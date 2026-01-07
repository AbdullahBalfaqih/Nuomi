'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const textLines = [
  "عش",
  "لحظاتك",
  "الفريدة",
  "مع مجموعة",
  "Spain",
  ""
];

const lineVariants = {
  hidden: { y: "100%" },
  visible: (i: number) => ({
    y: 0,
    transition: {
      delay: i * 0.1 + 0.5,
      duration: 0.8,
      ease: [0.6, 0.01, -0.05, 0.95]
    }
  })
};


const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Attempt to play the video
      video.play().catch(error => {
        // Autoplay was prevented.
        console.error("Autoplay prevented: ", error);
      });
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[80vh] w-full overflow-hidden text-white">
        <motion.video
          ref={videoRef}
          style={{ y }}
          preload="metadata"
          loop
          playsInline
          muted
          autoPlay
          poster="https://spaincollection.com/wp-content/uploads/2025/10/poster-video-reel.jpg"
          className="absolute top-0 left-0 w-full h-[140%] object-cover"
        >
          <source src="https://spaincollection.com/wp-content/uploads/2025/04/c976-46fc-8cdb-0a35755778aa.mp4" type="video/mp4" />
          متصفحك لا يدعم وسم الفيديو.
        </motion.video>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 h-full flex items-center container mx-auto px-4 md:px-6">
            <div className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold text-right">
                {textLines.map((line, i) => (
                    <div key={i} className="overflow-hidden">
                        <motion.div
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.8 }}
                            variants={lineVariants}
                            className={i === 1 || i === 2 ? 'italic font-serif' : ''}
                        >
                            {line}
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default VideoSection;
