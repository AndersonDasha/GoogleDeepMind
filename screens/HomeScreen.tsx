/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight } from "lucide-react";
import type { AnalyzedProduct, Severity } from "../lib/types";

export default function HomeScreen({
  onStart,
  results,
  onViewResults,
}: {
  onStart: () => void;
  results: AnalyzedProduct[] | null;
  onViewResults: () => void;
}) {
  const counts: Record<Severity, number> = { keep: 0, caution: 0, replace: 0 };
  results?.forEach((p) => (counts[p.status] += 1));

  return (
    <div className="flex flex-1 flex-col">
      {/* Editorial hero */}
      <section className="relative flex aspect-[4/5] flex-col justify-end bg-stone px-6 pb-8">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(120% 90% at 80% 0%, #efe7df 0%, #e7ded5 40%, #ddd2c7 100%)",
          }}
        />
        <div className="relative">
          <p className="eyebrow text-ink/60">The maternity edit</p>
          <h1 className="mt-3 font-display text-[40px] font-light leading-[0.98] text-ink">
            Beauty,<br />
            <span className="italic">reconsidered</span><br />
            for two.
          </h1>
          <p className="mt-4 max-w-[16rem] text-[14px] leading-relaxed text-ink/70">
            Bring in everything you've bought. Bloom edits your routine for early pregnancy —
            keep, check, replace.
          </p>
        </div>
      </section>

      <div className="px-6">
        <button
          onClick={onStart}
          className="mt-6 flex w-full items-center justify-between bg-ink px-6 py-5 text-paper transition active:scale-[0.99]"
        >
          <span className="eyebrow text-paper">Begin your edit</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Latest edit summary */}
      {results && results.length > 0 && (
        <button onClick={onViewResults} className="mt-8 px-6 text-left">
          <div className="flex items-end justify-between border-b hairline pb-3">
            <p className="eyebrow text-ash">Your latest edit</p>
            <span className="flex items-center gap-1 eyebrow text-ink">
              View <ArrowRight size={13} />
            </span>
          </div>
          <div className="mt-4 flex gap-8">
            <Figure n={counts.keep} label="Keep" />
            <Figure n={counts.caution} label="Check" />
            <Figure n={counts.replace} label="Replace" />
          </div>
        </button>
      )}

      {/* Editorial method strip */}
      <section className="mt-10 px-6 pb-12">
        <p className="eyebrow text-ash">Three ways in</p>
        <div className="mt-4 space-y-px">
          {[
            ["01", "Connect Sephora", "Sync your purchase history"],
            ["02", "Upload screenshots", "Read by AI vision"],
            ["03", "Gmail confirmations", "Straight from your inbox"],
          ].map(([n, t, d]) => (
            <div key={n} className="flex items-baseline gap-4 border-b hairline py-4">
              <span className="font-display text-[15px] text-ink/40">{n}</span>
              <span className="flex-1">
                <span className="font-display text-[17px] text-ink">{t}</span>
                <span className="mt-0.5 block text-[12px] text-ash">{d}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Figure({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-display text-[32px] leading-none text-ink">{n}</div>
      <div className="mt-1 eyebrow text-ash">{label}</div>
    </div>
  );
}
