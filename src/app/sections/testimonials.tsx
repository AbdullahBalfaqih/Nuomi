'use client';
import Image from "next/image";
import CardSwap, { Card } from "@/components/ui/CardSwap";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Star } from "lucide-react";
import { FadeUp } from "@/components/motion/fade-up";

const testimonials = [
  {
    review: "خدمة رائعة! لقد حولوا مساحتي إلى واحة مذهلة تعكس شخصيتي تمامًا. الاهتمام بالتفاصيل كان لا تشوبه شائبة.",
    client_name: "كيرا ريفوندا",
    location: "سيول",
    imageIds: ["testimonial-profile-1", "testimonial-profile-2", "testimonial-profile-3"],
  },
  {
    review: "فريق نعومي موهوب ومحترف بشكل لا يصدق. استمعوا إلى احتياجاتنا وقدموا تصميمًا فاق توقعاتنا.",
    client_name: "أليكس طومسون",
    location: "نيويورك",
    imageIds: ["testimonial-profile-2", "testimonial-profile-3", "testimonial-profile-1"],
  },
  {
    review: "تجربة تحويلية حقيقية. منزلنا يبدو جديدًا تمامًا، ولكنه فريد من نوعه. لا يمكنني أن أوصي بهم بما فيه الكفاية.",
    client_name: "سامانثا لي",
    location: "لندن",
    imageIds: ["testimonial-profile-3", "testimonial-profile-1", "testimonial-profile-2"],
  },
];

export default function Testimonials() {
  const profileImages = PlaceHolderImages.filter(img => img.id.startsWith("testimonial-profile"));

  return (
    <section className="py-24 sm:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <FadeUp>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">الشهادات</span>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mt-2">
              ثناء، شراكات، ونتائج حقيقية.
            </h2>
          </div>
        </FadeUp>

        <FadeUp customDelay={0.2}>
          <div className="relative flex justify-center items-center h-[500px]">
            <CardSwap
                width={700}
                height={350}
                cardDistance={40}
                verticalDistance={-50}
                skewAmount={-6}
                easing="elastic"
                pauseOnHover={true}
            >
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="!rounded-3xl bg-secondary shadow-2xl p-8 flex flex-col justify-center items-center text-center">
                    <div className="flex text-primary gap-1 mb-6">
                      {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
                    </div>
                    <p className="font-headline text-2xl font-medium text-foreground max-w-xl">
                      &ldquo;{testimonial.review}&rdquo;
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                      <div className="flex -space-x-4">
                        {testimonial.imageIds.map(id => {
                          const img = profileImages.find(p => p.id === id);
                          return img ? (
                            <Image
                              key={id}
                              src={img.imageUrl}
                              alt={img.description}
                              data-ai-hint={img.imageHint}
                              width={56}
                              height={56}
                              className="rounded-full border-2 border-background"
                            />
                          ) : null;
                        })}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-right">{testimonial.client_name}</p>
                        <p className="text-sm text-muted-foreground text-right">{testimonial.location}</p>
                      </div>
                    </div>
                </Card>
              ))}
            </CardSwap>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
