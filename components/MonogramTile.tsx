/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * A typographic stand-in for a product image (we don't fetch product photos).
 * Renders brand initials on a stone tile for an editorial, lookbook feel.
 */

function initials(brand?: string, name?: string): string {
  const src = (brand || name || "?").trim();
  const words = src.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function MonogramTile({
  brand,
  name,
  size = "md",
}: {
  brand?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "h-24 w-20" : size === "sm" ? "h-14 w-14" : "h-20 w-16";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center bg-stone text-ink/55`}
    >
      <span className={`font-display ${text} tracking-tight`}>{initials(brand, name)}</span>
    </div>
  );
}
