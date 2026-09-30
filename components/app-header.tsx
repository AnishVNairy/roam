import { Wordmark } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="border-b border-line bg-white/90">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div>
          <Wordmark />
          <p className="mt-1 hidden font-mono text-[9px] tracking-[0.17em] text-muted sm:block">
            RIDER PROFILE
          </p>
        </div>
        <div className="flex items-center gap-3">
          {email ? <span className="hidden max-w-48 truncate text-xs text-muted sm:block">{email}</span> : null}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
