import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

const cursorPaths = {
  alex: {
    x: [40, 180, 260, 150, 80, 40],
    y: [60, 120, 60, 180, 140, 60],
  },
  sam: {
    x: [300, 200, 100, 220, 320, 300],
    y: [160, 80, 140, 200, 100, 160],
  },
};

const MockCanvas = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="relative mx-auto mt-12 w-full max-w-3xl"
    >
      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-4 text-xs font-medium text-muted-foreground">
            flowboard — untitled-board
          </span>
        </div>

        {/* Canvas area */}
        <div className="relative h-72 sm:h-80 dot-grid p-6 overflow-hidden">
          {/* Dotted rectangle */}
          <div className="absolute left-[15%] top-[20%] w-[35%] h-[45%] border-2 border-dashed border-muted-foreground/30 rounded-lg" />

          {/* Hand-drawn circle */}
          <svg
            className="absolute right-[12%] top-[18%] w-[30%] h-[55%]"
            viewBox="0 0 120 120"
            fill="none"
          >
            <ellipse
              cx="60"
              cy="60"
              rx="50"
              ry="48"
              stroke="hsl(258, 90%, 66%)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.5"
            />
          </svg>

          {/* Sticky note */}
          <div className="absolute left-[20%] top-[28%] w-24 h-20 bg-yellow-100 rounded shadow-sm p-2 rotate-[-2deg]">
            <p className="text-[10px] font-medium text-yellow-800">
              User flow ideas ✏️
            </p>
          </div>

          {/* Small connector line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 320">
            <line x1="310" y1="160" x2="430" y2="110" stroke="hsl(217, 91%, 60%)" strokeWidth="2" strokeDasharray="5 5" opacity="0.4" />
          </svg>

          {/* Cursor: Alex */}
          <motion.div
            className="absolute flex items-start gap-1 pointer-events-none"
            animate={{ x: cursorPaths.alex.x, y: cursorPaths.alex.y }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <MousePointer2 size={16} className="text-primary fill-primary" />
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
              Alex
            </span>
          </motion.div>

          {/* Cursor: Sam */}
          <motion.div
            className="absolute flex items-start gap-1 pointer-events-none"
            animate={{ x: cursorPaths.sam.x, y: cursorPaths.sam.y }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <MousePointer2 size={16} className="text-pink-500 fill-pink-500" />
            <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
              Sam
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MockCanvas;
