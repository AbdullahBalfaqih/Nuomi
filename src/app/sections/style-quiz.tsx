import { StyleQuizForm } from './style-quiz-form';

export default function StyleQuiz() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">اكتشف جمالك</span>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mt-2">
            لست متأكدا من أين تبدأ؟
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            دع الذكاء الاصطناعي يرشدك. أجب عن بعض الأسئلة واحصل على اقتراحات مخصصة لأسلوب التصميم الداخلي في ثوانٍ.
          </p>
        </div>
        <StyleQuizForm />
      </div>
    </section>
  );
}
