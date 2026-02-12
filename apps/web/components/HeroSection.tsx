import { motion } from "framer-motion";
import MockCanvas from "@/components/MockCanvas";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="mx-auto max-w-5xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground leading-[1.05]"
        >
          Brainstorm together.
          <br />
          <span className="gradient-text">Anytime. Anywhere.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          The open-source whiteboard for developers. Real-time sync, zero lag.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex justify-center gap-4"
        >
          <button className="px-7 py-3 rounded-full text-sm font-semibold gradient-primary text-primary-foreground hover:scale-105 transition-transform shadow-lg shadow-primary/25">
            Start for Free
          </button>
          <button className="px-7 py-3 rounded-full text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors">
            View on GitHub
          </button>
        </motion.div>

        <MockCanvas />
      </div>
    </section>
  );
};

export default HeroSection;
