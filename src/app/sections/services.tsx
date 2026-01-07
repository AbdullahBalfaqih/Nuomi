'use client';
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowUpLeft } from "lucide-react";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/motion/fade-up";

const services = [
  {
    index: "001",
    title: "تصميم سكني",
    description: "تصاميم داخلية كاملة للمنازل تعكس أسلوبك، عملية، جميلة، وشخصية بعمق.",
    projects_count: "+90",
    href: "/services/residential-design",
    imageId: "service-residential"
  },
  {
    index: "002",
    title: "تصميم داخلي تجاري",
    description: "مساحات ذكية ذات علامات تجارية للمكاتب والمقاهي ومتاجر التجزئة التي تجذب وتؤدي أداءً جيدًا.",
    projects_count: "+40",
    href: "/services/commercial-design",
    imageId: "service-commercial"
  },
  {
    index: "003",
    title: "تجديدات داخلية",
    description: "نعيد تصميم التخطيطات، ونحدث المواد، ونمنح المساحات المتعبة لمسة عصرية جديدة.",
    projects_count: "+30",
    href: "/services/renovations",
    imageId: "service-renovations"
  },
  {
    index: "004",
    title: "تصميم وديكور",
    description: "اللمسات النهائية - أثاث وفن وإكسسوارات تضفي شخصية وأناقة.",
    projects_count: "+20",
    href: "/services/styling-decor",
    imageId: "service-styling"
  },
  {
    index: "005",
    title: "تصميم إلكتروني افتراضي",
    description: "خدمة تصميم إلكتروني افتراضي، تخطيطات وخطط أثاث دون مغادرة منزلك.",
    projects_count: "+35",
    href: "/services/e-design",
    imageId: "service-virtual"
  },
];


export default function Services() {
  return (
    <section className="py-24 sm:py-32 w-full bg-background">
      <div className="container mx-auto px-4 md:px-6 flex flex-col gap-24">

        <FadeUp>
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 md:gap-4 border-b border-border pb-12">
          <div className="flex flex-col gap-8 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">الخدمات</span>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-foreground">
                رعاية شخصية. مساحات ملهمة.
              </h2>
              <p className="text-lg text-muted-foreground font-light max-w-lg">
                حلول إبداعية مصممة لكل نمط وكل مساحة.
              </p>
            </div>
          </div>
          <div className="pb-2">
            <Link href="/services" className="group flex items-center gap-2 text-black border-b border-black/20 pb-1 hover:border-black transition-all">
              <span className="text-base font-medium">عرض الخدمات</span>
              <ArrowUpLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
        </FadeUp>

        <div className="flex flex-col">
          {services.map((service) => {
            const serviceImage = PlaceHolderImages.find((img) => img.id === service.imageId);
            return (
              <motion.div
                key={service.index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="service-card group border-b border-border py-16"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  <div className="lg:col-span-6 flex flex-col justify-between h-full py-2">
                    <div className="flex flex-col gap-6">
                      <span className="text-xl font-medium text-gray-300 group-hover:text-foreground transition-colors duration-300">({service.index})</span>
                      <h3 className="font-headline text-3xl md:text-4xl font-medium text-foreground">{service.title}</h3>
                      <p className="text-muted-foreground font-light text-lg leading-relaxed max-w-md">
                        {service.description}
                      </p>
                    </div>
                    <div className="flex items-end justify-between mt-12 lg:mt-0">
                      <div className="flex flex-col">
                        <span className="text-3xl font-semibold text-foreground">{service.projects_count}</span>
                        <span className="text-sm text-muted-foreground mt-1">مساحات محولة</span>
                      </div>
                      <Link href={service.href} className="group/btn flex items-center gap-2 text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground transition-all pb-0.5">
                        <span className="text-sm font-medium">اقرأ المزيد</span>
                        <ArrowUpLeft className="w-3 h-3 transition-transform duration-300 group-hover/btn:-translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-6 h-[400px] lg:h-[500px] w-full overflow-hidden rounded-xl bg-muted">
                    {serviceImage && (
                        <Image
                            src={serviceImage.imageUrl}
                            alt={serviceImage.description}
                            data-ai-hint={serviceImage.imageHint}
                            width={600}
                            height={500}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
