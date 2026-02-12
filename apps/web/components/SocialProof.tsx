import { motion } from "framer-motion";

const logos = [
  { name: "Next.js", svg: (
    <svg viewBox="0 0 394 80" className="h-5 w-auto" fill="currentColor"><path d="M261.919 0.0330722H330.547V12.7H303.323V79.339H289.71V12.7H261.919V0.0330722ZM149.052 0.0330722V12.7H94.0421V33.0772H138.281V45.7441H94.0421V66.6721H150.143V79.339H80.43V0.0330722H149.052ZM183.32 0.0330722L218.413 49.1294L253.507 0.0330722H271.593L226.216 63.2191V79.339H210.276V63.2191L164.9 0.0330722H183.32ZM0 0.0330722H13.6137L67.2539 59.4262V0.0330722H80.43V79.339H67.2539L13.6137 19.1642V79.339H0V0.0330722Z"/><path d="M360.097 56.5471C360.097 53.6001 361.982 51.7151 364.628 51.7151C367.274 51.7151 369.16 53.6001 369.16 56.5471C369.16 59.4941 367.274 61.3791 364.628 61.3791C361.982 61.3791 360.097 59.4941 360.097 56.5471ZM372.543 27.3311C372.543 10.6801 384.989 0.0330722 393.416 0.0330722V12.7C388.823 12.7 382.069 18.3951 382.069 27.3311V79.339H372.543V27.3311Z" /></svg>
  )},
  { name: "PostgreSQL", svg: (
    <svg viewBox="0 0 100 20" className="h-5 w-auto" fill="currentColor"><text x="0" y="16" className="text-[14px] font-bold" fontFamily="Inter, sans-serif">PostgreSQL</text></svg>
  )},
  { name: "Docker", svg: (
    <svg viewBox="0 0 60 20" className="h-5 w-auto" fill="currentColor"><text x="0" y="16" className="text-[14px] font-bold" fontFamily="Inter, sans-serif">Docker</text></svg>
  )},
  { name: "Turborepo", svg: (
    <svg viewBox="0 0 80 20" className="h-5 w-auto" fill="currentColor"><text x="0" y="16" className="text-[14px] font-bold" fontFamily="Inter, sans-serif">Turborepo</text></svg>
  )},
];

const SocialProof = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-16 px-6 border-t border-border/50"
    >
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Powered by:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-muted-foreground/50">
          {logos.map((logo) => (
            <div key={logo.name} className="opacity-50 hover:opacity-80 transition-opacity">
              {logo.svg}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default SocialProof;
