import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { motion } from 'framer-motion';


export default function ContactCta() {
  const ctaImage = PlaceHolderImages.find((img) => img.id === "cta-background");

  return (
    <section className="relative h-[600px] w-full text-white">
      {ctaImage && (
        <Image
          src={ctaImage.imageUrl}
          alt={ctaImage.description}
          data-ai-hint={ctaImage.imageHint}
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-4">
        <span className="text-sm font-semibold uppercase tracking-wider text-accent">
          ابدأ رحلة التصميم الخاصة بك
        </span>
        <h2 className="font-headline text-5xl md:text-7xl font-bold mt-4 max-w-4xl">
          ادخل إلى مساحة أحلامك
        </h2>
        <p className="mt-4 max-w-xl text-lg text-stone-300">
            هل أنت مستعد لتحويل بيئتك؟ دعنا نتعاون لإنشاء مساحة فريدة من نوعها.
        </p>
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-8"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold">
            <Link href="/contact">اتصل بنا</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
