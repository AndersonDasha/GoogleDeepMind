/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Gemini-powered parsing & pregnancy-safety analysis, with a fully offline
 * heuristic fallback so the app stays usable without an API key.
 */

import { GoogleGenAI } from "@google/genai";
import type { AnalyzedProduct, Concern, ParsedProduct, Severity } from "./types";
import { matchWatchlist, watchlistForPrompt } from "./watchlist";

const API_KEY = process.env.GEMINI_API_KEY;
export const HAS_API_KEY = Boolean(API_KEY);

const MODEL = "gemini-2.5-flash";
const ai = HAS_API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

let _id = 0;
const nextId = () => `p${Date.now().toString(36)}_${_id++}`;

/** Best-effort JSON extraction from a model response. */
function parseJson<T>(text: string): T | null {
  if (!text) return null;
  // Strip code fences if present.
  const cleaned = text.replace(/```json/gi, "```").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to grab the first {...} or [...] block.
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. Parse pasted order text -> structured product list
// ---------------------------------------------------------------------------

const PARSE_PROMPT = `You extract beauty/skincare products from pasted Sephora order
confirmation emails or order text. Return ONLY a JSON array. Each element:
{"name": string, "brand": string, "category": string}.

Rules:
- "name" is the product name only (no quantities, prices, or order numbers).
- "brand" is the beauty brand if identifiable, else "".
- "category" is a short type like "Serum", "Cleanser", "Moisturizer",
  "Fragrance", "Foundation", "Lip", "Hair", "Sunscreen", "Treatment", else "".
- Skip shipping lines, totals, taxes, samples labelled "FREE SAMPLE", and
  non-product text.
- If nothing looks like a product, return [].

Order text:
`;

/** An uploaded image, as a base64 payload + mime type. */
export interface ImageInput {
  base64: string; // without the data: prefix
  mimeType: string;
}

/**
 * Extract products from one or more uploaded screenshots/photos of orders,
 * receipts, or product pages using Gemini's vision model.
 */
export async function parseProductsFromImages(images: ImageInput[]): Promise<ParsedProduct[]> {
  if (!images.length) return [];
  if (!ai) {
    // No vision without an API key; surface a typed signal to the caller.
    throw new NoVisionError();
  }
  try {
    const parts = [
      {
        text:
          PARSE_PROMPT.replace("Order text:", "") +
          "\nThe images are screenshots or photos of beauty orders, receipts, or product pages. Read every visible product.",
      },
      ...images.map((img) => ({
        inlineData: { mimeType: img.mimeType, data: img.base64 },
      })),
    ];
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json", temperature: 0 },
    });
    const arr = parseJson<Array<{ name: string; brand?: string; category?: string }>>(
      res.text ?? "",
    );
    return (arr ?? [])
      .filter((p) => p && p.name && p.name.trim())
      .map((p) => ({
        id: nextId(),
        name: p.name.trim(),
        brand: (p.brand || "").trim() || undefined,
        category: (p.category || "").trim() || undefined,
      }));
  } catch (err) {
    if (err instanceof NoVisionError) throw err;
    console.warn("Gemini vision parse failed:", err);
    throw new Error("We couldn't read those images. Try clearer screenshots, or add items manually.");
  }
}

/** Thrown when image parsing is requested without an API key. */
export class NoVisionError extends Error {
  constructor() {
    super("Image analysis needs a Gemini API key. Set GEMINI_API_KEY, or use paste / manual entry.");
    this.name = "NoVisionError";
  }
}

/**
 * Representative recent purchases for the "Connect Sephora" DEMO flow.
 * Sephora has no public account API, so this stands in for a real sync.
 */
export function demoSephoraPurchases(): ParsedProduct[] {
  return [
    { name: "A-Passioni Retinol Cream", brand: "Drunk Elephant", category: "Treatment" },
    { name: "Niacinamide 10% + Zinc 1%", brand: "The Ordinary", category: "Serum" },
    { name: "Brazilian Crush Body Fragrance Mist", brand: "Sol de Janeiro", category: "Fragrance" },
    { name: "Anthelios Mineral Sunscreen SPF 50", brand: "La Roche-Posay", category: "Sunscreen" },
    { name: "2% BHA Liquid Exfoliant", brand: "Paula's Choice", category: "Exfoliant" },
    { name: "Hydrating Facial Cleanser", brand: "CeraVe", category: "Cleanser" },
    { name: "Lip Sleeping Mask", brand: "Laneige", category: "Lip" },
    { name: "C E Ferulic Vitamin C Serum", brand: "SkinCeuticals", category: "Serum" },
  ].map((p) => ({ id: nextId(), ...p }));
}

export async function parseProducts(rawText: string): Promise<ParsedProduct[]> {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: PARSE_PROMPT + trimmed,
        config: { responseMimeType: "application/json", temperature: 0 },
      });
      const arr = parseJson<Array<{ name: string; brand?: string; category?: string }>>(
        res.text ?? "",
      );
      if (arr && arr.length) {
        return arr
          .filter((p) => p && p.name && p.name.trim())
          .map((p) => ({
            id: nextId(),
            name: p.name.trim(),
            brand: (p.brand || "").trim() || undefined,
            category: (p.category || "").trim() || undefined,
          }));
      }
    } catch (err) {
      console.warn("Gemini parse failed, using heuristic:", err);
    }
  }

  return heuristicParse(trimmed);
}

/** Line-based fallback parser for when the AI is unavailable. */
function heuristicParse(rawText: string): ParsedProduct[] {
  // Whole-line metadata to drop (prices are stripped first, so no "$" clause).
  const ignore =
    /^(order|subtotal|total|sub-total|shipping|tax|qty|quantity|reward|points|tracking|order\s*#|confirmation|delivery|payment|free sample)\b/i;
  const seen = new Set<string>();
  return rawText
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/^[•\-\*\d.\s]+/, "") // leading bullets/numbering
        .replace(/\$\s?\d[\d.,]*/g, "") // inline prices
        .replace(/\bx\s?\d+\b/gi, "") // quantities like "x2"
        .replace(/\s{2,}/g, " ")
        .trim(),
    )
    .filter((l) => l.length >= 4 && l.length <= 120 && !ignore.test(l) && /[a-z]/i.test(l))
    .filter((l) => {
      const k = l.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((line) => ({ id: nextId(), name: line }));
}

// ---------------------------------------------------------------------------
// 2. Analyze products -> pregnancy-safety verdicts
// ---------------------------------------------------------------------------

const ANALYZE_SYSTEM = `You are a careful assistant that assesses whether beauty
products are commonly considered pregnancy-friendly, focused on EARLY pregnancy.
You are NOT a doctor and must never claim certainty. Ground your judgement in
this curated watchlist of commonly-cautioned ingredients/traits:

${watchlistForPrompt()}

For each product, infer its typical key ingredients and whether it is strongly
fragranced, based on the product name/brand. Decide a status:
- "replace": likely contains a clearly-cautioned ingredient (e.g. retinoids,
  hydroquinone, phthalates, formaldehyde, minoxidil).
- "caution": possibly contains something worth checking (strong fragrance,
  high-strength acids/peels, benzoyl peroxide, oxybenzone) OR you are unsure.
- "keep": no commonly-cautioned ingredient is likely.
When unsure, prefer "caution" over "keep". Be conservative.

Return ONLY a JSON array, one object per product IN THE SAME ORDER:
{"status":"keep|caution|replace","fragranced":boolean,
 "concerns":[{"ingredient":string,"severity":"replace|caution","reason":string}],
 "summary":string (<=140 chars, plain language),
 "suggestedSwap":string (what kind of product to switch to, or "" if keep)}`;

export async function analyzeProducts(products: ParsedProduct[]): Promise<AnalyzedProduct[]> {
  if (!products.length) return [];

  if (ai) {
    try {
      const list = products
        .map((p, i) => `${i + 1}. ${p.brand ? p.brand + " — " : ""}${p.name}`)
        .join("\n");
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: `${ANALYZE_SYSTEM}\n\nProducts:\n${list}`,
        config: { responseMimeType: "application/json", temperature: 0.2 },
      });
      const arr = parseJson<
        Array<{
          status?: Severity;
          fragranced?: boolean;
          concerns?: Concern[];
          summary?: string;
          suggestedSwap?: string;
        }>
      >(res.text ?? "");

      if (arr && arr.length === products.length) {
        return products.map((p, i) => mergeWithWatchlist(p, arr[i], "ai"));
      }
    } catch (err) {
      console.warn("Gemini analyze failed, using heuristic:", err);
    }
  }

  return products.map((p) => mergeWithWatchlist(p, undefined, "heuristic"));
}

/**
 * Combine the AI verdict with a deterministic watchlist scan of the product
 * name/brand. The watchlist acts as a safety net: anything it catches is always
 * surfaced, and can only escalate (never downgrade) the AI's status.
 */
function mergeWithWatchlist(
  product: ParsedProduct,
  ai:
    | {
        status?: Severity;
        fragranced?: boolean;
        concerns?: Concern[];
        summary?: string;
        suggestedSwap?: string;
      }
    | undefined,
  source: "ai" | "heuristic",
): AnalyzedProduct {
  const text = `${product.brand ?? ""} ${product.name} ${product.category ?? ""}`;
  const hits = matchWatchlist(text);

  // Start from AI concerns (deduped by ingredient), then add watchlist hits.
  const concerns: Concern[] = [];
  const seen = new Set<string>();
  const add = (c: Concern) => {
    const key = c.ingredient.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      concerns.push(c);
    }
  };
  (ai?.concerns ?? []).forEach((c) => {
    if (c && c.ingredient) add({ ingredient: c.ingredient, severity: c.severity ?? "caution", reason: c.reason ?? "" });
  });
  hits.forEach((h) => add({ ingredient: h.name, severity: h.severity, reason: h.reason }));

  // Resolve status: take the most severe of AI status and watchlist hits.
  const rank: Record<Severity, number> = { keep: 0, caution: 1, replace: 2 };
  let status: Severity = ai?.status ?? "keep";
  for (const c of concerns) status = rank[c.severity] > rank[status] ? c.severity : status;
  // Heuristic mode with no hits & no AI => default to caution (we can't be sure).
  if (source === "heuristic" && !ai && concerns.length === 0) status = "caution";

  const fragranced =
    ai?.fragranced ?? hits.some((h) => h.id === "fragrance" || h.id === "essential-oils");

  const summary =
    ai?.summary ||
    (status === "keep"
      ? "No commonly-cautioned ingredients spotted."
      : status === "replace"
        ? `Likely contains ${concerns[0]?.ingredient ?? "a cautioned ingredient"} — consider replacing.`
        : "Worth double-checking the ingredient list with your doctor.");

  const suggestedSwap =
    status === "keep"
      ? undefined
      : ai?.suggestedSwap || swapSuggestion(product, concerns);

  return {
    ...product,
    status,
    fragranced,
    concerns,
    summary,
    suggestedSwap,
    source,
  };
}

function swapSuggestion(product: ParsedProduct, concerns: Concern[]): string {
  const ids = concerns.map((c) => c.ingredient.toLowerCase());
  if (ids.some((i) => i.includes("retin") || i.includes("vitamin a")))
    return "A pregnancy-safe alternative like azelaic acid or vitamin C.";
  if (ids.some((i) => i.includes("hydroquinone")))
    return "A gentler brightener such as vitamin C or azelaic acid.";
  if (ids.some((i) => i.includes("fragrance") || i.includes("parfum") || i.includes("oil")))
    return "A fragrance-free version of the same product type.";
  if (ids.some((i) => i.includes("oxybenzone")))
    return "A mineral (zinc oxide / titanium dioxide) sunscreen.";
  return "A simpler, fragrance-free option in the same category.";
}
