'use server';

import { interiorStyleQuiz } from '@/ai/flows/interior-style-quiz';
import { z } from 'zod';

const quizSchema = z.object({
  preferences: z.string().min(10, "يرجى وصف تفضيلاتك بمزيد من التفصيل."),
});

export type QuizState = {
  result?: {
    recommendedStyles: string[];
    reasoning: string;
  };
  error?: string;
  message?: string;
};

export async function getStyleSuggestion(
  prevState: QuizState,
  formData: FormData
): Promise<QuizState> {
  const validatedFields = quizSchema.safeParse({
    preferences: formData.get('preferences'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.preferences?.[0]
    };
  }

  try {
    const result = await interiorStyleQuiz({ userPreferences: validatedFields.data.preferences });
    return { result };
  } catch (error) {
    console.error(error);
    return { error: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' };
  }
}
