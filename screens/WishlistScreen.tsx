/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Heart } from "lucide-react";
import ProductCard from "../components/ProductCard";
import type { AnalyzedProduct } from "../lib/types";

export default function WishlistScreen({
  items,
  onToggleSave,
  onStart,
}: {
  items: AnalyzedProduct[];
  onToggleSave: (id: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-2">
      <p className="eyebrow text-ash">Saved</p>
      <h2 className="mt-2 font-display text-[28px] text-ink">My wishlist</h2>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
          <Heart size={26} strokeWidth={1.2} className="text-ink/30" />
          <p className="max-w-[14rem] text-[13px] leading-relaxed text-ash">
            Pieces you save from your edit will live here — your pregnancy-friendly keepers.
          </p>
          <button onClick={onStart} className="eyebrow text-ink underline">
            Start an edit
          </button>
        </div>
      ) : (
        <div className="mt-5">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} saved onToggleSave={() => onToggleSave(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
