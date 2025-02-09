import { z } from "zod";

const questionSchema = z.object({
  question: z.string().nonempty("Question cannot be empty"),
});

export const questionsSchema = z.object({
  questions: z
    .array(questionSchema)
    .nonempty("Questions array cannot be empty"),
});
