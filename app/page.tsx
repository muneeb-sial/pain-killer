import Link from "next/link";
import { UploadCard } from "@/components/upload-card";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <section className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">
            AI Resume Checker
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Stronger resumes, clearer wording, and better ATS alignment in minutes.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Upload a PDF or paste your resume text to get instant AI feedback on grammar,
            keyword coverage, ATS optimization, and practical improvements.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-line bg-white px-4 py-2 text-muted">
              Free basic analysis
            </div>
            <div className="rounded-full border border-line bg-white px-4 py-2 text-muted">
              Premium upgrade: $5
            </div>
            <div className="rounded-full border border-line bg-white px-4 py-2 text-muted">
              Vercel-ready
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-soft">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Why it works</p>
          <div className="mt-4 space-y-4 text-sm text-muted">
            <div className="rounded-2xl bg-canvas p-4">
              Resume text is extracted from PDF or plain text before analysis.
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              OpenAI returns a structured score plus strengths, weaknesses, and suggestions.
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              Stripe unlocks a richer premium report and a downloadable improved resume draft.
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 lg:mt-16">
        {user ? (
          <UploadCard />
        ) : (
          <div className="rounded-[1.75rem] border border-line bg-white p-8 text-center shadow-soft">
            <h2 className="text-2xl font-semibold text-ink">Sign in to start analyzing</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              This app uses a simple email session login so you can test the full workflow quickly.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue to login
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
