import Link from "next/link";
import { FaCodeMerge } from "react-icons/fa6";
import { IntegrationAccountsPanel } from "../components/accounts/integration-accounts-panel";

export default function ConnectAccountsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-lg border border-gray-200 bg-card p-6 shadow-sm dark:border-gray-800 sm:p-8">
          <Link href="/" className="mb-8 flex items-center gap-3 font-extrabold">
            <FaCodeMerge className="size-6 text-primary" aria-hidden />
            Git Fusion
          </Link>

          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Provider connections</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-normal">Connect your accounts</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Link GitHub and GitLab to your Git Fusion account. This only stores the connection for now; activity sync comes later.
            </p>
          </div>

          <IntegrationAccountsPanel showContinue redirectTo="/connect-accounts" />
        </div>
      </section>
    </main>
  );
}
