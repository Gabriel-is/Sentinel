// Convert raw bytes to text. PDF + HTML for V1; XLSX and zip are stubs
// (they persist as sentinel_documents rows but carry no chunks).

import { getDocument } from "npm:pdfjs-dist@4.7.76/legacy/build/pdf.mjs";
import { DOMParser } from "jsr:@b-fuze/deno-dom@0.1.48";
import type { ParsedDoc, RawBlob, SourceSpec } from "./types.ts";

export interface ParseResult {
  doc: ParsedDoc;
  skip_reason?: "scanned" | "stub_only";
}

export async function parseBlob(
  spec: SourceSpec,
  blob: RawBlob,
): Promise<ParseResult> {
  const base = {
    source_url: spec.url,
    local_filename: spec.local_filename,
    title: spec.title,
    doc_type: spec.doc_type,
    content_hash: blob.content_hash,
    fetched_at: blob.fetched_at,
    raw_storage_path: blob.storage_path,
  };

  if (spec.doc_type === "pdf") {
    const parsed = await parsePdf(blob.bytes);
    return {
      doc: {
        ...base,
        raw_text: parsed.text,
        page_count: parsed.pageCount,
      },
      skip_reason: parsed.scanned ? "scanned" : undefined,
    };
  }

  if (spec.doc_type === "html") {
    const text = parseHtml(new TextDecoder("utf-8").decode(blob.bytes));
    return { doc: { ...base, raw_text: text } };
  }

  // xlsx and zip persist as rows with empty text; V2 ingests content.
  return {
    doc: { ...base, raw_text: "" },
    skip_reason: "stub_only",
  };
}

interface PdfParse {
  text: string;
  pageCount: number;
  scanned: boolean;
}

async function parsePdf(bytes: Uint8Array): Promise<PdfParse> {
  const loadingTask = getDocument({
    data: bytes,
    useSystemFonts: true,
    disableFontFace: true,
  });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  let totalChars = 0;
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      // deno-lint-ignore no-explicit-any
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
    totalChars += pageText.length;
  }

  // Heuristic: <50 chars per page → likely scanned/image-only
  const avgChars = pdf.numPages > 0 ? totalChars / pdf.numPages : 0;
  const scanned = avgChars < 50;

  return {
    text: pages.join("\n\n"),
    pageCount: pdf.numPages,
    scanned,
  };
}

function parseHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) return "";

  // Strip script, style, nav, footer, header
  for (const sel of ["script", "style", "nav", "footer", "header", "aside"]) {
    doc.querySelectorAll(sel).forEach((n) => n.remove());
  }

  // Prefer <main> or <article> if present, else body
  const main = doc.querySelector("main") ??
    doc.querySelector("article") ??
    doc.body;
  const text = (main?.textContent ?? "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  return text;
}
