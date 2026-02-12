import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border/50"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-extrabold tracking-tight text-foreground">
          Flowboard
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button className="px-5 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </button>
          <button className="px-5 py-2.5 rounded-full text-sm font-semibold gradient-primary text-primary-foreground hover:scale-105 transition-transform shadow-md shadow-primary/25">
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden border-t border-border/50 px-6 py-4 flex flex-col gap-3"
        >
          <button className="px-5 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left">
            Sign In
          </button>
          <button className="px-5 py-2.5 rounded-full text-sm font-semibold gradient-primary text-primary-foreground shadow-md shadow-primary/25 text-center">
            Get Started
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
