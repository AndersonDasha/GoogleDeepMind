/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Curated list of ingredients & product traits that are *commonly cautioned*
 * during (especially early) pregnancy by dermatology / obstetric guidance.
 *
 * This is an educational reference, NOT medical advice. Guidance evolves and
 * individual circumstances differ — always defer to a doctor or midwife.
 */

import type { WatchlistEntry } from "./types";

export const WATCHLIST: WatchlistEntry[] = [
  {
    id: "retinoids",
    name: "Retinoids (Vitamin A derivatives)",
    aliases: [
      "retinol",
      "retinal",
      "retinaldehyde",
      "retinyl palmitate",
      "retinyl",
      "tretinoin",
      "retinoic acid",
      "adapalene",
      "isotretinoin",
      "vitamin a",
    ],
    severity: "replace",
    category: "Anti-aging / Acne",
    reason:
      "Topical and oral retinoids are among the most consistently avoided ingredients in pregnancy due to potential risk to fetal development.",
  },
  {
    id: "hydroquinone",
    name: "Hydroquinone",
    aliases: ["hydroquinone"],
    severity: "replace",
    category: "Brightening",
    reason:
      "High skin absorption makes hydroquinone a commonly avoided brightening agent during pregnancy.",
  },
  {
    id: "high-salicylic",
    name: "High-strength salicylic acid (BHA)",
    aliases: ["salicylic acid", "bha", "beta hydroxy acid", "betaine salicylate"],
    severity: "caution",
    category: "Exfoliant / Acne",
    reason:
      "Low-percentage leave-on BHA is often considered okay, but high-strength peels and oral salicylates are usually cautioned.",
  },
  {
    id: "benzoyl-peroxide",
    name: "Benzoyl peroxide",
    aliases: ["benzoyl peroxide"],
    severity: "caution",
    category: "Acne",
    reason:
      "Frequently flagged for review during pregnancy — many clinicians okay limited use, but it's worth confirming.",
  },
  {
    id: "strong-aha",
    name: "High-strength AHA peels",
    aliases: ["glycolic acid", "lactic acid peel", "trichloroacetic", "mandelic peel"],
    severity: "caution",
    category: "Exfoliant",
    reason:
      "Everyday low-strength AHAs are generally tolerated; strong professional-grade peels are commonly cautioned.",
  },
  {
    id: "fragrance",
    name: "Added fragrance / parfum",
    aliases: ["fragrance", "parfum", "perfume", "eau de", "cologne", "essential oil blend"],
    severity: "caution",
    category: "Fragrance",
    reason:
      "Strong synthetic fragrance can trigger first-trimester nausea and may contain phthalates; many people switch to fragrance-free.",
  },
  {
    id: "essential-oils",
    name: "Stimulating essential oils",
    aliases: [
      "clary sage",
      "rosemary oil",
      "sage oil",
      "jasmine oil",
      "juniper",
      "cinnamon oil",
      "wintergreen",
      "camphor",
    ],
    severity: "caution",
    category: "Aromatherapy",
    reason:
      "A handful of concentrated essential oils are traditionally cautioned in pregnancy, particularly the first trimester.",
  },
  {
    id: "phthalates",
    name: "Phthalates",
    aliases: ["phthalate", "dbp", "dibutyl phthalate", "diethyl phthalate", "dep"],
    severity: "replace",
    category: "Endocrine concern",
    reason:
      "Phthalates are endocrine-disrupting plasticizers commonly avoided during pregnancy.",
  },
  {
    id: "formaldehyde",
    name: "Formaldehyde & releasers",
    aliases: ["formaldehyde", "formalin", "dmdm hydantoin", "quaternium-15", "toluene"],
    severity: "replace",
    category: "Nail / Preservative",
    reason:
      "Common in long-wear nail products; formaldehyde and toluene are typically avoided during pregnancy.",
  },
  {
    id: "chemical-sunscreen",
    name: "Oxybenzone sunscreen filter",
    aliases: ["oxybenzone", "benzophenone-3"],
    severity: "caution",
    category: "Sunscreen",
    reason:
      "Oxybenzone is an endocrine-active UV filter many people swap for mineral (zinc/titanium) sunscreen in pregnancy.",
  },
  {
    id: "minoxidil",
    name: "Minoxidil",
    aliases: ["minoxidil"],
    severity: "replace",
    category: "Hair growth",
    reason: "Hair-growth treatments containing minoxidil are generally avoided during pregnancy.",
  },
  {
    id: "thioglycolate",
    name: "Hair-straightening / perm chemicals",
    aliases: ["thioglycolate", "thioglycolic acid", "ammonium thioglycolate"],
    severity: "caution",
    category: "Hair treatment",
    reason:
      "Chemical straighteners and perms are commonly postponed during pregnancy out of caution.",
  },
];

/** Normalize text for matching. */
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Scan free text (product name, brand, ingredient string) against the
 * watchlist. Returns every entry whose alias appears as a word/substring.
 */
export function matchWatchlist(text: string): WatchlistEntry[] {
  const haystack = norm(text);
  if (!haystack) return [];
  const hits: WatchlistEntry[] = [];
  for (const entry of WATCHLIST) {
    if (entry.aliases.some((a) => haystack.includes(norm(a)))) {
      hits.push(entry);
    }
  }
  return hits;
}

/** A compact, prompt-friendly rendering of the watchlist for grounding the AI. */
export function watchlistForPrompt(): string {
  return WATCHLIST.map(
    (e) =>
      `- ${e.name} [${e.severity}] (category: ${e.category}; aliases: ${e.aliases.join(
        ", ",
      )}): ${e.reason}`,
  ).join("\n");
}
