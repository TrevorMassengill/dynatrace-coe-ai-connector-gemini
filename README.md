## Prerequisites

1. Latest stable NodeJS
2. Latest stable Typescript
3. Permission to deploy apps in the Dynatrace Environment

## Installation 

1. Download zip
2. Unzip
3. Modify `app.config.json`
- Change `environmentURL` to reflect your Dynatrace Environment
4. Run `npx dt-app deploy` deploy from a terminal within the project folder.
- If successful, you should see a new connector as an option when adding a new task to a Workflow.

## Uninstall

1. Run `npx dt-app uninstall` from a terminal within the project folder.

## Usage

Follow these steps to set up an automated AI analysis workflow in Dynatrace.

### 1. Fetch your data
Create a new workflow and add a task to fetch the data you want analyzed (e.g., logs, events, or metrics).
* **Action:** Add a **DQL Query** task named `execute_dql_query`.
* **Example Query:**
    ```sql
    fetch logs  
    | filter matchesValue(status, "ERROR")  
    | summarize count=count(), by:{content}  
    | limit 10
    ```

### 2. Data Optimization
To save on token costs and improve response accuracy, use a script to extract only the necessary records before sending them to Gemini.
* **Action:** Add a **Run JavaScript** task.
* **Code:**
    ```javascript
    import { execution, result } from "@dynatrace-sdk/automation-utils";

    export default async function () {
      // Ensure the string matches your DQL task name
      const taskExecutionResult = await result("execute_dql_query");
      return taskExecutionResult['records'];
    }
    ```

### 3. Configure the Gemini Task
1. Add a new task and search for **Gemini**.
   
<img width="500" height="350" alt="1" src="https://github.com/user-attachments/assets/8e661061-2281-4dcb-ae86-265ffb005e23" />
  
2. Under **Input**, click **+ Create a new connection**.

<img width="420" height="315" alt="2" src="https://github.com/user-attachments/assets/f0cc1e21-0d51-48f0-948c-4d5345190d65" />
   
3. Enter a **Connection Name**, your **Model ID**, and your **API Key** (which you can generate here: https://aistudio.google.com/api-keys). 
   > **Note:** Do not modify the URL unless you are using a custom endpoint.
4. Click **Add item**. Your connection should now show up on the Connection dropdown for the task (refresh page if not).

<img width="550" height="600" alt="3" src="https://github.com/user-attachments/assets/616a4ffd-ecf6-442c-9a10-00e590ad7084" />

### 4. Set up the Prompt
* **Prompt:** Enter the specific question or instruction for the AI (e.g., *"Analyze these logs and suggest a potential root cause"*).
* **Name of Task with data to analyze:** Enter the exact name of the task from Step 1 (or Step 2 if you used the optimization script).

### 5. (Optional) Store the AI Response
You can archive Gemini's analysis back into Dynatrace as a log for long-term tracking.
1. Add a **Run JavaScript** task.
2. Use the Dynatrace SDK to ingest the task output as a log, sample code below.
    ```sql
    import { execution, result } from "@dynatrace-sdk/automation-utils";
    import { logsClient } from '@dynatrace-sdk/client-classic-environment-v2';
    
    export default async function () {
      const taskExecutionResult = await result('gemini_1');
    
      console.log('print: ', taskExecutionResult.response);
      
      return await logsClient.storeLog({
        body: [
          {
            'content': taskExecutionResult.response,
            'log.source': 'Gemini',
            'type': 'AI Summary',
          }
        ],
        type: 'application/json; charset=utf-8'
      });
    }
    ```   
4. To view your AI summaries later, run the following in the **Logs** app:
    ```sql
    fetch logs
    | filter matchesValue(type, "AI Summary") AND matchesValue(log.source, "Gemini")
    ```
