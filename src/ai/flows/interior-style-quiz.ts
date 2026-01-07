'use server';

/**
 * @fileOverview A flow that uses AI to recommend interior design styles based on user preferences.
 *
 * - interiorStyleQuiz - A function that handles the interior design style quiz process.
 * - InteriorStyleQuizInput - The input type for the interiorStyleQuiz function.
 * - InteriorStyleQuizOutput - The return type for the interiorStyleQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteriorStyleQuizInputSchema = z.object({
  userPreferences: z
    .string()
    .describe(
      'A description of the user preferences for their interior design style.'
    ),
});
export type InteriorStyleQuizInput = z.infer<typeof InteriorStyleQuizInputSchema>;

const InteriorStyleQuizOutputSchema = z.object({
  recommendedStyles: z
    .array(z.string())
    .describe(
      'A list of recommended interior design styles based on the user preferences.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the recommended interior design styles, explaining why they match the user preferences.'
    ),
});
export type InteriorStyleQuizOutput = z.infer<typeof InteriorStyleQuizOutputSchema>;

export async function interiorStyleQuiz(input: InteriorStyleQuizInput): Promise<InteriorStyleQuizOutput> {
  return interiorStyleQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interiorStyleQuizPrompt',
  input: {schema: InteriorStyleQuizInputSchema},
  output: {schema: InteriorStyleQuizOutputSchema},
  prompt: `أنت مستشار خبير في التصميم الداخلي. قدم مستخدم وصفًا لتفضيلاته في التصميم الداخلي. بناءً على هذه التفضيلات، قم بالتوصية بقائمة من أنماط التصميم الداخلي التي تناسبه، واشرح أسبابك.

تفضيلات المستخدم: {{{userPreferences}}}

استجب بتنسيق JSON. يجب أن يكون حقل recommendedStyles مصفوفة من السلاسل النصية، ويجب أن يكون حقل reasoning سلسلة نصية تشرح سبب تطابق الأنماط الموصى بها مع تفضيلات المستخدم.`,
});

const interiorStyleQuizFlow = ai.defineFlow(
  {
    name: 'interiorStyleQuizFlow',
    inputSchema: InteriorStyleQuizInputSchema,
    outputSchema: InteriorStyleQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
