import Link from "next/link";
import { MoveUpRight } from "lucide-react";

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex w-fit items-center gap-2 font-mono text-sm font-bold tracking-[0.28em] ${light ? "text-white" : "text-ink"}`}
      aria-label="ROAM home"
    >
      <span className="grid size-8 place-items-center rounded-[10px] bg-signal text-white">
        <MoveUpRight aria-hidden="true" size={17} strokeWidth={2.5} />
      </span>
      ROAM
    </Link>
  );
}

export function BrandPanel({
  eyebrow = "MADE FOR THE LONG WAY",
  title,
  description,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-petrol px-6 py-7 text-white md:min-h-[350px] md:px-10 md:py-9 lg:min-h-screen lg:px-12 lg:py-10">
      <div className="absolute -right-20 top-24 size-64 rounded-full border border-white/10" aria-hidden="true" />
      <div className="absolute -right-10 top-34 size-44 rounded-full border border-white/10" aria-hidden="true" />
      <Wordmark light />
      <div className="relative max-w-xl py-10 lg:pb-16">
        <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-sage-light">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-[1.06] tracking-[-0.045em] md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-white/75 md:text-lg md:leading-8">
          {description}
        </p>
        <div className="mt-8 flex items-center gap-3 font-mono text-[10px] tracking-[0.14em] text-white/60" aria-hidden="true">
          <span className="size-2 rounded-full bg-signal" />
          <span className="h-px w-12 bg-white/30" />
          <span>RIDER FIRST. ALWAYS.</span>
        </div>
      </div>
      <p className="hidden font-mono text-[10px] tracking-[0.16em] text-white/45 lg:block">
        01 / 01 &nbsp;·&nbsp; START WITH YOUR RIDER CARD
      </p>
    </section>
  );
}

export function AuthFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <BrandPanel
        title={<>Find your people.<br />Follow the road.</>}
        description="Start with a rider profile that feels like you. The next good ride is closer than you think."
      />
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
