'use client';

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FadeUp } from "@/components/motion/fade-up";

const projects = [
  {
    title: "الهدوء الحضري",
    year: "2024",
    tags: ["بساطة", "طبيعي"],
    imageId: "project-urban-tranquility",
    link: "/projects/urban-tranquility"
  },
  {
    title: "الممر اللازوردي",
    year: "2025",
    tags: ["محيطي", "ضوء طبيعي"],
    imageId: "project-azure-hallway",
    link: "/projects/azure-hallway"
  },
  {
    title: "سكينة الساحل",
    year: "2024",
    tags: ["هدوء ساحلي", "طبيعة"],
    imageId: "project-coastal-serenity",
    link: "/projects/coastal-serenity"
  },
];

export default function FeaturedProjects() {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add('cursor-grabbing');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
    };

    const handleMouseUp = () => {
      isDown = false;
      slider.classList.remove('cursor-grabbing');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollSlider = (direction: number) => {
    const slider = sliderRef.current;
    if (slider) {
      const card = slider.querySelector('.snap-center') as HTMLElement;
      if (card) {
        const scrollAmount = card.offsetWidth + 24; // Card width + gap
        slider.scrollBy({
          left: direction * scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };


  return (
    <section className="py-24 sm:py-32 w-full overflow-hidden bg-background">
      <div className="container mx-auto px-4 md:px-6 flex flex-col gap-16">
        <FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                <span className="text-sm font-medium text-foreground">مشاريع حصرية</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-semibold leading-tight tracking-tight text-foreground">
                متجذرة بجرأة في الرؤية. حصرية في التنفيذ.
              </h2>
          </div>
          <div className="text-lg text-muted-foreground font-light md:justify-self-center">
            <p>
              مكتبة بصرية للتصاميم الداخلية التي تم إحياؤها من المخطط إلى الجمال.
            </p>
          </div>
          <div className="flex justify-start md:justify-end gap-3">
            <button onClick={() => scrollSlider(1)} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </button>
            <button onClick={() => scrollSlider(-1)} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        </FadeUp>

        <div className="relative w-full">
          <motion.div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 cursor-grab"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.2 }}
          >
            {projects.map((project) => {
              const projectImage = PlaceHolderImages.find((img) => img.id === project.imageId);
              return (
                <motion.div 
                  key={project.title} 
                  className="min-w-[85vw] md:min-w-[420px] lg:min-w-[460px] snap-center group"
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
                  }}
                >
                  <Link href={project.link}>
                    <div className="bg-secondary p-3 rounded-2xl transition-all duration-300 group-hover:bg-[#EBE9E5]">
                      <div className="w-full aspect-[3/4] overflow-hidden rounded-xl mb-5 relative">
                        {projectImage && (
                          <Image
                            src={projectImage.imageUrl}
                            alt={projectImage.description}
                            data-ai-hint={projectImage.imageHint}
                            fill
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 85vw, (max-width: 1200px) 420px, 460px"
                          />
                        )}
                      </div>
                      <div className="px-1 pb-2 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-headline font-medium text-foreground">{project.title}</h3>
                          <span className="text-muted-foreground font-light mt-1">{project.year}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="rounded-full bg-transparent border-border text-muted-foreground">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
