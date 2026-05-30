/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Severity = "replace" | "caution" | "keep";

/** A single ingredient/flag on the curated pregnancy-caution watchlist. */
export interface WatchlistEntry {
  id: string;
  /** Human-friendly name shown in the UI. */
  name: string;
  /** Lowercase strings we scan product names/ingredients for. */
  aliases: string[];
  /** How strongly this is generally cautioned during early pregnancy. */
  severity: Exclude<Severity, "keep">;
  category: string;
  /** Short, plain-language reason it shows up here. */
  reason: string;
}

/** A product parsed out of pasted order text. */
export interface ParsedProduct {
  id: string;
  name: string;
  brand?: string;
  /** e.g. "Serum", "Cleanser", "Fragrance". */
  category?: string;
}

/** A concern matched to a product during analysis. */
export interface Concern {
  ingredient: string;
  severity: Exclude<Severity, "keep">;
  reason: string;
}

/** Full analysis result for one product. */
export interface AnalyzedProduct extends ParsedProduct {
  status: Severity;
  /** True if the product is likely strongly fragranced / contains parfum. */
  fragranced: boolean;
  concerns: Concern[];
  /** One-line plain-language summary of the verdict. */
  summary: string;
  /** What kind of product to swap to, when status !== "keep". */
  suggestedSwap?: string;
  /** "ai" when Gemini analyzed it, "heuristic" for the offline fallback. */
  source: "ai" | "heuristic";
}
