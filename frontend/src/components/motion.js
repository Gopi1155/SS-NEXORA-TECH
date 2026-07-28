import { motion } from "framer-motion";

export const LOGO_URL = "https://customer-assets-eiarnc6j.emergentagent.net/job_98f20b1c-aded-48d2-adc1-6e43bd96e549/artifacts/wcoxhf9m_company%20logo.jpeg";

export function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MaskedLines({ lines, className = "", lineClassName = "", startDelay = 0 }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: startDelay + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Overline({ children, className = "" }) {
  return (
    <p className={`text-xs uppercase tracking-[0.3em] text-cyan-400/90 font-medium ${className}`}>
      {children}
    </p>
  );
}

export function SectionHeading({ overline, title, className = "" }) {
  return (
    <FadeUp className={className}>
      {overline && <Overline className="mb-4">{overline}</Overline>}
      <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-50">
        {title}
      </h2>
    </FadeUp>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, testId }) {
  return (
    <div data-testid={testId} className="glass rounded-3xl p-16 text-center flex flex-col items-center gap-4">
      {Icon && <Icon className="w-10 h-10 text-cyan-400/70" strokeWidth={1.2} />}
      <h3 className="font-heading text-xl text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md">{subtitle}</p>
    </div>
  );
}
