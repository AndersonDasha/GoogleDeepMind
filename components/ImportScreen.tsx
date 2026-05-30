/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ClipboardPaste, Loader2, Sparkles, WandSparkles } from "lucide-react";
import Disclaimer from "./Disclaimer";
import { HAS_API_KEY } from "../lib/gemini";

const SAMPLE = `Sephora Order #SO48211992

Drunk Elephant A-Passioni Retinol Cream  $74.00
The Ordinary Niacinamide 10% + Zinc 1%  $6.50
Sol de Janeiro Brazilian Crush Body Fragrance Mist  $38.00
La Roche-Posay Anthelios Mineral Sunscreen SPF 50  $33.50
Paula's Choice 2% BHA Liquid Exfoliant  $35.00
CeraVe Hydrating Facial Cleanser  $16.99
FREE SAMPLE: Tatcha Dewy Serum
Subtotal: $203.99
Shipping: FREE`;

export default function ImportScreen({
  onImport,
  loading,
}: {
  onImport: (text: string) => void;
  loading: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-1 flex-col px-5 pb-8">
      <div className="mb-5 mt-1">
        <h2 className="font-display text-[26px] leading-tight text-ink">
          What have you been buying?
        </h2>
        <p className="mt-1.5 text-sm text-ink/60">
          Paste your Sephora order confirmation emails (or any list of products) below. We'll pull
          out each item and check it against a pregnancy-caution ingredient list.
        </p>
      </div>

      <div className="relative flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste order emails or product names here…"
          className="card h-full min-h-[220px] w-full resize-none rounded-3xl p-4 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-rose/40"
        />
        {!text && (
          <button
            onClick={() => setText(SAMPLE)}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-sage/15 px-3 py-1.5 text-xs font-medium text-sage-deep transition hover:bg-sage/25 active:scale-95"
          >
            <WandSparkles size={13} /> Try a sample
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink/40">
        <Sparkles size={12} />
        {HAS_API_KEY ? "AI-assisted analysis active" : "Offline mode — using on-device watchlist"}
      </div>

      <button
        disabled={!text.trim() || loading}
        onClick={() => onImport(text)}
        className="mt-3 flex items-center justify-center gap-2 rounded-full bg-rose py-3.5 font-semibold text-white shadow-md transition enabled:hover:bg-rose-deep enabled:active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Reading your products…
          </>
        ) : (
          <>
            <ClipboardPaste size={18} /> Import & analyze
          </>
        )}
      </button>

      <Disclaimer className="mt-5" />
    </div>
  );
}
