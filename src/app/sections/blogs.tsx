'use client';
import ImageTrail from "@/components/ui/image-trail";
import { FadeUp } from "@/components/motion/fade-up";

export default function Blogs() {
  return (
    <section className="py-24 sm:py-32 bg-background flex justify-center items-center">
      <FadeUp>
        <div className="works-board relative w-[80vw] h-[70vh] bg-black rounded-2xl shadow-2xl overflow-hidden flex justify-center items-center">
          <h1 className="center-text text-[8vw] text-white z-20 pointer-events-none uppercase tracking-wider mix-blend-difference font-bold font-headline">
            أعمالنا
          </h1>
          <ImageTrail variant={1} />
        </div>
      </FadeUp>
    </section>
  );
}
