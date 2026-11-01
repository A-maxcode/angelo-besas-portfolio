import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-hero text-navy-foreground">
      <div
        aria-hidden="true"
        className="grid-lines absolute inset-0"
      />

      <div
        className={`container-page relative py-14 md:py-20 ${
          title ? "" : "text-center"
        }`}
      >
        {title ? (
          <>
            <p className="eyebrow text-cyan">{eyebrow}</p>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold sm:text-4xl md:text-5xl">
              {title}
            </h1>
          </>
        ) : (
          <h1 className="text-5xl font-extrabold sm:text-6xl md:text-7xl">
            {eyebrow}
          </h1>
        )}

        {description && (
          <p
            className={`mt-4 max-w-2xl text-base text-navy-muted md:text-lg ${
              title ? "" : "mx-auto"
            }`}
          >
            {description}
          </p>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
