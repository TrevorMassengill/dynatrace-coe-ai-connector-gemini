import { userLogger } from '@dynatrace-sdk/automation-action-utils/actions';
import { appSettingsObjectsClient } from '@dynatrace-sdk/client-app-settings-v2';
import { execution, result } from "@dynatrace-sdk/automation-utils";

export default async (payload: any) => {
  const taskExecutionResult = await result(payload.data);

  if (!payload.prompt) {
    throw new Error("Input field 'prompt' is missing.");
  }

  if (!payload.connectionId) {
    throw new Error("Input field 'connectionId' is missing.");
  }

  const connectionObject = await appSettingsObjectsClient.getAppSettingsObjectByObjectId({ objectId: payload.connectionId });

  async function callGemini(prompt: string) {
    const response = await fetch(`${connectionObject?.value?.url}/${connectionObject?.value?.model}:generateContent?key=${connectionObject?.value?.token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt + "\n" + JSON.stringify(taskExecutionResult) }]
        }]
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      userLogger.info("HTTP error! status:" + response.status);
      userLogger.info("API Error Body:" + JSON.stringify(errorBody));
      return { status: response.status, error: errorBody };
    }

    const data = await response.json();
    return data;
  }

  const geminiResponse: any = await callGemini(payload.prompt);
  const geminiResponseText = JSON.stringify(geminiResponse.candidates[0].content.parts[0].text);
  userLogger.info(geminiResponseText);
  return { 
    response: geminiResponseText,
    tokens: {
      total: geminiResponse.usageMetadata["totalTokenCount"]
    },
    fullResponse: geminiResponse
  };
};
