'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { getStyleSuggestion, type QuizState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Sparkles } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="ms-2 h-4 w-4 animate-spin" />
          تحليل...
        </>
      ) : (
        <>
          <Wand2 className="ms-2 h-4 w-4" />
          ابحث عن أسلوبي
        </>
      )}
    </Button>
  );
}

export function StyleQuizForm() {
  const initialState: QuizState = {};
  const [state, dispatch] = useActionState(getStyleSuggestion, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'خطأ',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (state?.result) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state?.result]);


  return (
    <div>
      <Card className="max-w-3xl mx-auto">
        <form ref={formRef} action={dispatch}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              اختبار أسلوب الديكور الداخلي بالذكاء الاصطناعي
            </CardTitle>
            <CardDescription>
              صف مساحة أحلامك وأجواءك وألوانك المفضلة. سيقترح الذكاء الاصطناعي لدينا أنماط تصميم داخلي مخصصة لك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="preferences"
              placeholder="مثال: 'أحب المساحات المشرقة والمفتوحة مع الكثير من الضوء الطبيعي والنباتات والمواد الطبيعية مثل الخشب والحجر. أفضل لوحة ألوان محايدة مع لمسات من اللون الأخضر. الأجواء التي أفضلها هادئة ومريحة وبسيطة.'"
              rows={5}
              required
            />
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state?.result && (
        <div ref={resultsRef} className="mt-12 max-w-3xl mx-auto">
          <h3 className="text-2xl font-headline text-center mb-8">توصيات أسلوبك</h3>
          <Card className="bg-secondary">
             <CardHeader>
                <CardTitle>الأنماط الموصى بها</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-wrap gap-2">
                 {state.result.recommendedStyles.map((style) => (
                    <div key={style} className="bg-background px-4 py-2 rounded-full font-medium text-foreground">
                        {style}
                    </div>
                ))}
             </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
                <CardTitle>الأساس المنطقي</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{state.result.reasoning}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
