import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { input } from "@inquirer/prompts";
import { questionsSchema } from "./schemas";
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const modelId = "amazon.nova-lite-v1:0";

const setupPrompt = [
  {
    text: `
You are an intelligent assistant that processes raw text input and extracts questions from it. Your task is to identify all the questions from the provided raw text, and then return them in the following JSON format, WITHOUT WRAPPING IN MARKDOWN

{
  "questions": [
    { "question": "<question text>" },
    { "question": "<question text>" },
    ...
  ]
}

`,
  },
];

const userMessage = `

Islam: Instuderingsfrågor
1. När och var grundades islam?
2. Vad tycker/tänker mulimer om Jesus och Mose?
3. Islam är en av de tre abrahamitiska religionerna. Vad menas med
det?
4. På vilket sätt är Muhammed en viktig person inom islam?
5. Varför flydde Muhammed till Medina?
6. Vad heter den heligaste skriften inom islam? Hur gick det till när
den kom till?
`;
const conversation = [
  {
    role: "user" as const,
    content: [{ text: userMessage }],
  },
];

const response = await bedrock.send(
  new ConverseCommand({
    modelId,
    messages: conversation,
    system: setupPrompt,
  }),
);

const responseText = response.output.message.content[0].text;
console.log(responseText);

const qs = questionsSchema.parse(JSON.parse(responseText));
console.log(qs);

const initialQuestions = JSON.stringify(qs);

const systemPrompt = [
  {
    text: "You are an assistant helping someone with their exam questions. I have a list of questions that need to be asked one by one. Please select one question at a time, ask the user, and wait for their response before continuing. If the user answers correctly, move to the next question. If the answer is incorrect, allow them to either retry or skip. Continue until all questions are asked. Here are the questions:",
  },
  {
    text: initialQuestions,
  },
];
const response2 = await bedrock.send(
  new ConverseCommand({
    modelId,
    messages: [
      {
        role: "user",
        content: [{ text: "Please ask me the first question" }],
      },
    ],
    system: systemPrompt,
  }),
);

const responseText2 = response2.output.message.content[0].text;
console.log(responseText2);
