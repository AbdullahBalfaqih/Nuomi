'use client';
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowLeft } from "lucide-react";
import { FadeUp } from "@/components/motion/fade-up";
import CountUp from "@/components/ui/count-up";

const stats = [
  { value: 200, label: "براءة اختراع", subtext: "تصاميم مبتكرة لتحسين تجربة المستخدم.", suffix: "+" },
  { value: 80000, label: "متر مربع", subtext: "قاعدة إنتاج ذكية بمعايير الصناعة 4.0.", suffix: "" },
  { value: 7, label: "مستويات رقابة", subtext: "من المواد الخام إلى المنتج النهائي لضمان الجودة.", suffix: "" },
];

export default function About() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === "about-image");

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <FadeUp>
            <div className="space-y-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">NUOMI: اجعل منزلك أفضل</span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
                جودة تبدأ من التفاصيل الدقيقة.
              </h2>
              <p className="text-lg text-muted-foreground">
                بصفتها إحدى العلامات التجارية الرائدة في الصين، تبتكر NUOMI مفهوم "السلسلة البيئية المتكاملة لإكسسوارات المنزل". نحن نوحد الأسلوب، اللون، الجودة، والعلامة التجارية لنقدم ترقية جمالية متكاملة عبر ستة أنظمة منتجات رئيسية، من حلول تخزين المطابخ والخزائن إلى أنظمة الإضاءة الذكية.
              </p>
              <Link href="/about-us" className="inline-flex items-center font-semibold text-primary group">
                اكتشف رحلتنا
                <ArrowLeft className="ms-2 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>
          </FadeUp>
          {aboutImage && (
            <FadeUp customDelay={0.1}>
              <div className="relative h-[500px] lg:h-full rounded-sm overflow-hidden">
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  data-ai-hint={aboutImage.imageHint}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </FadeUp>
          )}
        </div>
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat, i) => (
            <FadeUp key={stat.label} customDelay={i * 0.1}>
              <div className="relative">
                <div className="font-headline text-5xl md:text-6xl font-bold text-primary flex items-center justify-center">
                    <CountUp to={stat.value} duration={3} />
                    <span>{stat.suffix}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{stat.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{stat.subtext}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
