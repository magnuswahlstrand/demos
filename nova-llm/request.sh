#!/bin/bash
MODEL=$(aws bedrock list-foundation-models | jq '.modelSummaries[].modelId' -r | fzf)


echo "Please enter some text:"
read user_input
trimmed_input=$(echo "$user_input" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' )
# user_input="Hello, how are you?"

json_string=$(printf '[{"role": "user", "content": [{"text": "%s"}]}]' "$user_input")

echo $json_string
OUTPUT=$(aws bedrock-runtime converse \
--model-id $MODEL \
--messages "$json_string" \
--inference-config '{"maxTokens": 512, "temperature": 0.5, "topP": 0.9}')

echo $OUTPUT | jq '.output.message.content[].text' -r
