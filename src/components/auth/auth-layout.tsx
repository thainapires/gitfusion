import Link from "next/link";
import { ReactNode } from "react";
import { AppLogo } from "../ui/app-logo";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-lg border border-gray-200 bg-card shadow-sm dark:border-gray-800 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden bg-[#060d1c] p-10 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.28),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.28),transparent_30%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <Link href="/" className="flex items-center gap-3 text-lg font-extrabold">
                <span className="grid size-9 place-items-center">
                  <AppLogo className="size-5" aria-hidden/>
                </span>
                Git Fusion
              </Link>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">One graph. All your code.</p>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight">Unify GitHub and GitLab activity in minutes.</h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  Create a Git Fusion account with email and password. Provider connections stay separate from app authentication.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              <Link href="/" className="mb-8 flex items-center gap-3 font-extrabold lg:hidden">
                <AppLogo className="size-6" aria-hidden/>
                Git Fusion
              </Link>
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-normal">{title}</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
