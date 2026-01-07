'use client';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/app/sections/hero';
import About from '@/app/sections/about';
import HistoryTimeline from '@/app/sections/history-timeline';
import FeaturedProjects from '@/app/sections/featured-projects';
import Services from '@/app/sections/services';
import Testimonials from '@/app/sections/testimonials';
import Blogs from '@/app/sections/blogs';
import ContactCta from '@/app/sections/contact-cta';
import StyleQuiz from '@/app/sections/style-quiz';
import VideoSection from '@/app/sections/video-section';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-background text-foreground"
    >
      <Header />
      <main>
        <Hero />
        {/* This empty section acts as a buffer for the parallax scroll effect of the hero */}
        <section className="h-screen w-full" /> 
        <About />
        <HistoryTimeline />
        <FeaturedProjects />
        <VideoSection />
        <Services />
        <StyleQuiz />
        <Testimonials />
        <Blogs />
        <ContactCta />
      </main>
      <Footer />
    </motion.div>
  );
}
