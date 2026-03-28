import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const showError = params.error === "invalid-email";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.75rem] border border-line bg-white p-8 shadow-soft">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Simple auth</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Sign in with your email</h1>
          <p className="mt-4 text-sm leading-6 text-muted">
            This demo uses a lightweight session cookie so you can test the full resume analysis
            and payment flow without adding a separate auth provider first.
          </p>

          <form action={loginAction} className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-[1.25rem] border border-line bg-canvas px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand"
              />
            </div>

            {showError ? (
              <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                Enter a valid email address to continue.
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue
            </button>
          </form>
        </div>

        <div className="rounded-[1.75rem] border border-line bg-gradient-to-br from-ink to-brand p-8 text-white shadow-soft">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">Included</p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-white/85">
            <div className="rounded-2xl bg-white/10 p-4">
              Free scoring, grammar review, keyword insights, and ATS checks
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              Detailed premium analysis for <span className="font-semibold text-white">$5</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              Downloadable improved resume draft after Stripe checkout
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
