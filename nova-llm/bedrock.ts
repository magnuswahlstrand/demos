import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseRequest,
} from "@aws-sdk/client-bedrock-runtime";
import { z } from "zod";

const modelId = "amazon.nova-lite-v1:0";
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

const converseAndParse = async <T>(
  conversations: ConverseRequest["messages"],
  schema: z.ZodType<T>,
  instructions: ConverseRequest["system"],
) => {
  const response = await bedrock.send(
    new ConverseCommand({
      modelId,
      messages: conversations,
      system: instructions,
    }),
  );

  if (response.output.message?.content?.length > 1) {
    throw new Error("Expected only one response from the model");
  }
  const responseText = response.output.message.content[0].text;
  console.log(responseText);

  return schema.parse(JSON.parse(responseText));
};

export { converseAndParse };
