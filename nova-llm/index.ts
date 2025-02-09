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
const conversation2 = [
  {
    role: "user" as const,
    content: [{ text: userMessage }],
  },
];

const response = await bedrock.send(
  new ConverseCommand({
    modelId,
    messages: conversation2,
    system: setupPrompt,
  }),
);

const responseText = response.output.message.content[0].text;
console.log(responseText);

const questions = questionsSchema.parse(JSON.parse(responseText)).questions;
console.log(questions);

// const initialQuestions = JSON.stringify(questions);
//
// const systemPrompt = [
//   {
//     text: "You are an assistant helping someone with their exam. Here is a list of questions that need to be asked one by one. Please select one question at a time and ask it in its original language. After asking, simply prompt the user for their answer. Wait for their response before continuing.",
//   },
//   {
//     text: initialQuestions,
//   },
// ];
// const response2 = await bedrock.send(
//   new ConverseCommand({
//     modelId,
//     messages: [
//       {
//         role: "user",
//         content: [{ text: "Please ask me the first question" }],
//       },
//     ],
//     system: systemPrompt,
//   }),
// );
//
// const responseText2 = response2.output.message.content[0].text;
// console.log(responseText2);
let conversation = [
  {
    role: "user",
    content: [{ text: "Please ask me the first question" }],
  },
];

let questionIndex = 0; // Start at the first question

// Function to ask questions and get user input indefinitely
const askQuestions = async () => {
  while (questionIndex < questions.length) {
    // Ask the current question
    const currentQuestion = questions[questionIndex].question;

    // Add the current question to the conversation
    conversation.push({
      role: "assistant",
      content: [{ text: currentQuestion }],
    });

    // Output the first question
    console.log(`Question: ${currentQuestion}`);

    // Wait for the user's answer using inquirer
    const userAnswer = await input({
      message: `Your answer to: ${currentQuestion}`,
    });

    // Add the user's answer to the conversation
    conversation.push({
      role: "user",
      content: [{ text: userAnswer }],
    });

    console.log(conversation);
    // Get response from the LLM to evaluate the answer
    const response = await bedrock.send(
      new ConverseCommand({
        modelId,
        messages: conversation,
        system: [
          {
            text: `You are an assistant evaluating user responses based on correctness. You answer with a JSON string on the format {"correct": true/false, "response": "response text"}`,
          },
        ],
      }),
    );

    const responseText = response.output.message.content[0].text;

    // Parse the response from the model
    let evaluation;
    try {
      evaluation = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse response:", responseText);
      break;
    }

    // Check if the response indicates correctness
    if (evaluation && evaluation.correct === true) {
      console.log("Correct!");
    } else {
      console.log("Incorrect!" + evaluation.response);
    }

    // Move to the next question
    questionIndex++;

    // Optionally, you can break out of the loop or ask for retrying on wrong answers
    const continueQuiz = await input({
      message:
        'Do you want to continue? (Type "yes" to continue, anything else to stop)',
    });

    if (continueQuiz.toLowerCase() !== "yes") {
      console.log("Ending the quiz.");
      break;
    }
  }

  console.log("Quiz completed!");
};

// Start the quiz
await askQuestions();
