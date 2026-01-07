'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useState, useEffect } from "react";

export default function Hero() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-background");
  const featuredProjectImage = PlaceHolderImages.find((img) => img.id === "project-azure-hallway");

  const { scrollY } = useScroll();
  
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    // This code now runs only on the client
    setInnerHeight(window.innerHeight);
  }, []);

  // Use a default value of 1 until innerHeight is set on the client
  const scrollOpacity = useTransform(scrollY, [0, innerHeight * 1.5 || 1], [1, 0]);
  const contentOpacity = useTransform(scrollY, [0, innerHeight * 1.2 || 1], [1, 0]);
  const contentScale = useTransform(scrollY, [0, innerHeight * 1.5 || 1], [1, 0.9]);
  const featuredProjectOpacity = useTransform(scrollY, [0, 100, 200], [1, 1, 0]);


  return (
    <section id="hero-section" className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {heroImage && (
        <motion.div className="fixed top-0 left-0 w-full h-screen" style={{ opacity: scrollOpacity }}>
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </motion.div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
        <motion.div 
          className="relative max-w-4xl" 
          style={{ opacity: contentOpacity, scale: contentScale }}
        >
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold leading-tight drop-shadow-lg">
            حيث تلتقي الجماليات بالحياة الهادفة
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-stone-200 drop-shadow-md">
            نحن نصمم مساحات داخلية تمزج بين الأناقة الخالدة والوظائف العصرية، لتعكس قصتك وأسلوب حياتك. فلنبني شيئًا جميلاً معًا.
          </p>
          <div className="mt-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Button asChild size="lg" className="bg-black/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 rounded-full font-semibold">
                <Link href="/projects">
                  استكشف أعمالنا <ArrowLeft className="ms-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="absolute bottom-8 right-8 left-8 sm:right-auto"
        style={{ opacity: featuredProjectOpacity }}
      >
        {featuredProjectImage && (
          <Link href="/projects/azure-hallway" className="group">
            <div className="bg-black/20 backdrop-blur-md rounded-lg p-3 border border-white/10 max-w-sm me-auto">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={featuredProjectImage.imageUrl}
                    alt={featuredProjectImage.description}
                    data-ai-hint={featuredProjectImage.imageHint}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-headline text-lg text-white font-semibold">الممر اللازوردي</h4>
                </div>
                <ArrowLeft className="text-white h-6 w-6 shrink-0 transition-transform duration-300 group-hover:-translate-x-1" />
              </div>
            </div>
          </Link>
        )}
      </motion.div>
    </section>
  );
}
