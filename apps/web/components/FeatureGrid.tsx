import { motion } from "framer-motion";
import { Map, Zap, Code } from "lucide-react";

const features = [
  {
    icon: <Map size={28} className="text-primary" />,
    title: "Infinite Canvas",
    description:
      "Zoom, pan, and scroll endlessly. No boundaries, no limits — just your ideas stretching as far as you need.",
  },
  {
    icon: <Zap size={28} className="text-yellow-500" />,
    title: "Real-time WebSockets",
    description:
      "See every stroke, shape, and cursor in real time. Built on WebSockets for zero-lag collaboration.",
  },
  {
    icon: <Code size={28} className="text-secondary" />,
    title: "Export to Code",
    description:
      "Turn your wireframes into production-ready React, SVG, or JSON with a single click.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12 },
  }),
};

const FeatureGrid = () => {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-center"
        >
          Built for speed. Designed for teams.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-center text-muted-foreground max-w-xl mx-auto"
        >
          Everything you need for collaborative design — nothing you don't.
        </motion.p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              className="group rounded-2xl border border-border bg-card p-7 shadow-lg hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
