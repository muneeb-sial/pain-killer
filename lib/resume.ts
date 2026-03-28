import pdfParse from "pdf-parse";

export async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();

  if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }

  return buffer.toString("utf8").trim();
}

export function normalizeResumeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
