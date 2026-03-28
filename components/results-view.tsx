"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import type { StoredAnalysis } from "@/lib/types";

const STORAGE_KEY = "resume-checker-analysis";

function SectionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[1.5rem] border border-line bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-muted">
        {items.length ? (
          items.map((item, index) => (
            <li key={`${title}-${index}`} className="rounded-2xl bg-canvas px-4 py-3">
              {item}
            </li>
          ))
        ) : (
          <li className="rounded-2xl bg-canvas px-4 py-3">No items returned yet.</li>
        )}
      </ul>
    </section>
  );
}

function downloadImprovedResume(content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "improved-resume.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ResultsView({ email }: { email: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [storedAnalysis, setStoredAnalysis] = useState<StoredAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, startUpgrade] = useTransition();
  const [isVerifying, startVerify] = useTransition();

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      setStoredAnalysis(JSON.parse(raw));
    } catch {
      setError("Saved analysis data could not be loaded.");
    }
  }, []);

  const analysis = storedAnalysis?.result;
  const isDetailed = analysis?.plan === "detailed";
  const sessionId = searchParams.get("session_id");
  const upgrade = searchParams.get("upgrade");

  useEffect(() => {
    if (!sessionId || upgrade !== "1" || !storedAnalysis || isDetailed) {
      return;
    }

    startVerify(async () => {
      try {
        setError(null);

        const confirmResponse = await fetch(`/api/payment/confirm?session_id=${sessionId}`);
        const confirmPayload = await confirmResponse.json();
        if (!confirmResponse.ok || !confirmPayload.verified) {
          throw new Error(confirmPayload.error || "Payment verification failed.");
        }

        const formData = new FormData();
        formData.append("plan", "detailed");
        formData.append("resumeText", storedAnalysis.extractedText);
        formData.append("checkoutSessionId", sessionId);

        const analyzeResponse = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        const analyzePayload = await analyzeResponse.json();
        if (!analyzeResponse.ok) {
          throw new Error(analyzePayload.error || "Detailed analysis failed.");
        }

        const nextState: StoredAnalysis = {
          extractedText: analyzePayload.extractedText,
          result: analyzePayload.result,
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        setStoredAnalysis(nextState);
        router.replace("/results");
      } catch (upgradeError) {
        setError(
          upgradeError instanceof Error
            ? upgradeError.message
            : "We could not unlock the detailed analysis.",
        );
      }
    });
  }, [isDetailed, router, sessionId, storedAnalysis, upgrade]);

  const paymentLabel = useMemo(() => `Unlock detailed analysis for ${formatCurrency(5)}`, []);

  async function handleUpgrade() {
    startUpgrade(async () => {
      try {
        setError(null);
        const response = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.url) {
          throw new Error(payload.error || "Checkout could not be created.");
        }

        window.location.href = payload.url;
      } catch (checkoutError) {
        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : "Something went wrong while starting checkout.",
        );
      }
    });
  }

  if (!analysis) {
    return (
      <div className="rounded-[1.75rem] border border-line bg-white p-8 text-center shadow-soft">
        <h2 className="text-2xl font-semibold text-ink">No analysis found</h2>
        <p className="mt-3 text-sm text-muted">
          Run a resume analysis first, then your results will appear here.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
        >
          Go to homepage
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-soft">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Resume score</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-6xl font-semibold tracking-tight text-ink">{analysis.score}</span>
            <span className="pb-2 text-lg text-muted">/ 100</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">{analysis.summary}</p>
        </div>

        <div className="rounded-[1.75rem] border border-line bg-gradient-to-br from-brand to-ink p-6 text-white shadow-soft">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
            {isDetailed ? "Detailed plan unlocked" : "Upgrade for more"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {isDetailed
              ? "Your full premium analysis is ready."
              : "Get deeper feedback, stronger ATS guidance, and an improved resume draft."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
            {isDetailed
              ? "You can now download an AI-improved version of your resume as a starter draft."
              : "Premium unlocks detailed keyword coverage, sharper rewrite suggestions, and a downloadable improved resume."}
          </p>

          {isDetailed ? (
            <button
              type="button"
              onClick={() => downloadImprovedResume(analysis.improvedResume || "")}
              className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:opacity-90"
            >
              Download Improved Resume
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isUpgrading || isVerifying}
              className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUpgrading ? "Redirecting to checkout..." : paymentLabel}
            </button>
          )}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {(isVerifying || searchParams.get("payment") === "cancelled") && !error ? (
        <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-ink">
          {isVerifying
            ? "Payment confirmed. Running your detailed analysis now..."
            : "Checkout was cancelled. Your free results are still available."}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Strengths" items={analysis.strengths} />
        <SectionCard title="Weaknesses" items={analysis.weaknesses} />
        <SectionCard title="Suggestions" items={analysis.suggestions} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Grammar Issues" items={analysis.grammarIssues} />
        <SectionCard title="Missing Keywords" items={analysis.missingKeywords} />
        <SectionCard title="ATS Optimization" items={analysis.atsOptimization} />
      </section>
    </div>
  );
}
