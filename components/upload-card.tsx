"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/loading-overlay";
import type { StoredAnalysis } from "@/lib/types";

const STORAGE_KEY = "resume-checker-analysis";

export function UploadCard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onFileChange(file: File | null) {
    setSelectedFile(file);
    setError(null);
  }

  function handleSubmit() {
    setError(null);

    if (!selectedFile && !resumeText.trim()) {
      setError("Upload a PDF/text file or paste your resume text first.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("plan", "basic");

        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        if (resumeText.trim()) {
          formData.append("resumeText", resumeText.trim());
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Analysis failed.");
        }

        const analysis: StoredAnalysis = {
          extractedText: payload.extractedText,
          result: payload.result,
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(analysis));
        router.push("/results");
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Something went wrong while analyzing the resume.",
        );
      }
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-6 shadow-soft sm:p-8">
      {isPending ? <LoadingOverlay label="Analyzing your resume..." /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
              Upload resume
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Fast AI feedback for clarity, keywords, and ATS fit
            </h2>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex min-h-44 w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-line bg-canvas px-6 text-center transition hover:border-brand"
          >
            <span className="text-base font-medium text-ink">
              {selectedFile ? selectedFile.name : "Choose PDF or TXT file"}
            </span>
            <span className="mt-2 text-sm text-muted">
              Upload a PDF or text file for quick parsing.
            </span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,text/plain,application/pdf"
            className="hidden"
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-ink" htmlFor="resume-text">
            Or paste resume text
          </label>
          <textarea
            id="resume-text"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Paste your resume here..."
            className="min-h-44 w-full rounded-[1.5rem] border border-line bg-canvas px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand"
          />

          {error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Analyze Resume
          </button>
        </div>
      </div>
    </div>
  );
}
