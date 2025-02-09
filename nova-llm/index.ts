import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { input } from "@inquirer/prompts";
import { questionsSchema } from "./schemas";
import { tutorInstructions, parseQuestionsInstructions } from "./systemPrompt";
import { converseAndParse } from "./bedrock";
import { w } from "@faker-js/faker/dist/airline-BnpeTvY9";
import { z } from "zod";
process.on("SIGINT", () => {
  console.log("\nProcess interrupted. Shutting down...");
  process.exit(0);
});
const convItem = (role: "user" | "assistant", text: string) => ({
  role,
  content: [{ text }],
});
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

const questions = (
  await converseAndParse(
    [convItem("user", userMessage)],
    questionsSchema,
    parseQuestionsInstructions,
  )
).questions;
const tutorSchema = z.object({
  correct: z.boolean(),
  response: z.string(),
});
let conversation = [convItem("user", "Please ask me the first question")];

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

    // Wait for the user's answer using inquirer
    const userAnswer = await input({
      message: `${currentQuestion}\n`,
    });

    // Add the user's answer to the conversation
    conversation.push({
      role: "user",
      content: [{ text: userAnswer }],
    });

    // Get response from the LLM to evaluate the answer
    const evaluation = await converseAndParse(
      conversation,
      tutorSchema,
      tutorInstructions,
    );
    if (evaluation && evaluation.correct === true) {
      console.log("Correct! " + evaluation.response);
    } else {
      console.log("Incorrect!" + evaluation.response);
    }

    // Move to the next question
    questionIndex++;

    // // Optionally, you can break out of the loop or ask for retrying on wrong answers
    // const continueQuiz = await input({
    //   message:
    //     'Do you want to continue? (Type "yes" to continue, anything else to stop)',
    // });
    //
    // if (continueQuiz.toLowerCase() !== "yes") {
    //   console.log("Ending the quiz.");
    //   break;
    // }
  }

  console.log("Quiz completed!");
};

// Start the quiz
await askQuestions();
