const parseQuestionsInstructions = [
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
const tutorInstructions = [
  {
    text: `You are an assistant evaluating user responses based on correctness. You answer with a JSON string on the format {"correct": true/false, "response": "response text"}`,
  },
];

export { parseQuestionsInstructions, tutorInstructions };
