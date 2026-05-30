/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check } from "lucide-react";
import Disclaimer from "../components/Disclaimer";
import { HAS_API_KEY } from "../lib/gemini";
import type { SourceLabel } from "./ImportHub";

export default function ProfileScreen({
  source,
  analyzedCount,
  onReset,
}: {
  source: SourceLabel | null;
  analyzedCount: number;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-2">
      <p className="eyebrow text-ash">Account</p>
      <h2 className="mt-2 font-display text-[28px] text-ink">Profile</h2>

      <dl className="mt-8 divide-y divide-line border-y hairline">
        <Row label="Data source" value={source ?? "Not connected"} />
        <Row label="Products analyzed" value={String(analyzedCount)} />
        <Row
          label="Analysis engine"
          value={HAS_API_KEY ? "Gemini + watchlist" : "On-device watchlist"}
          ok={HAS_API_KEY}
        />
      </dl>

      <button
        onClick={onReset}
        className="mt-8 border hairline py-4 text-center eyebrow text-ink transition hover:border-ink"
      >
        Clear my data
      </button>

      <div className="mt-auto pt-10">
        <Disclaimer />
        <p className="mt-6 wordmark text-[13px] text-ink/30">Bloom</p>
      </div>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-4">
      <dt className="eyebrow text-ash">{label}</dt>
      <dd className="flex items-center gap-1.5 text-[14px] text-ink">
        {ok && <Check size={14} className="text-keep" />}
        {value}
      </dd>
    </div>
  );
}
