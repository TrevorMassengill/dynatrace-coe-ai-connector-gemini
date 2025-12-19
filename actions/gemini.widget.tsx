import { AutomationTextInput, AutomationConnectionPicker } from '@dynatrace/automation-action-components';
import { FormField, Label } from '@dynatrace/strato-components-preview/forms';
import { ActionWidget } from '@dynatrace-sdk/automation-action-utils';
import React from 'react';

interface GeminiInput {
  prompt: string;
  data: string;
  connectionId: string;
}

const GeminiWidget: ActionWidget<GeminiInput> = (props) => {
  const { value, onValueChanged } = props;

  const updateValue = (newValue: Partial<GeminiInput>) => {
    onValueChanged({ ...value, ...newValue });
  };

  return (
    <>
      <FormField>
        <Label>Connection</Label>
        <AutomationConnectionPicker
          connectionId={value.connectionId}
          schema='gemini-connection'
          onChange={(connectionId) => updateValue({ connectionId })}
        />
      </FormField>
      <FormField>
        <Label>Prompt</Label>
        <AutomationTextInput value={value.prompt} onChange={(prompt: string) => updateValue({ prompt })} />
        <Label>Name of Task with data to analyze</Label>
        <AutomationTextInput value={value.data} onChange={(data: string) => updateValue({ data })} />
      </FormField>
    </>
  );
};

export default GeminiWidget;
