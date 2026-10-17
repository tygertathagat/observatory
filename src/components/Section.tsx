import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 py-14 md:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h2 className="font-display mt-3 text-4xl leading-[1.05] tracking-tight md:text-6xl text-balance">
            {title}
          </h2>
        </Reveal>
        <div className="mt-10 md:mt-12">{children}</div>
      </div>
    </section>
  );
}
