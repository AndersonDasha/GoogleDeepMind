/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Info } from "lucide-react";

export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex gap-2.5 rounded-2xl bg-amber-soft/15 px-4 py-3 text-[12px] leading-relaxed text-ink/70 ${className}`}
    >
      <Info size={15} className="mt-0.5 shrink-0 text-amber-soft" />
      <p>
        Educational guidance only — not medical advice. Ingredient guidance evolves and every
        pregnancy is different. Always confirm with your doctor or midwife before changing your
        routine.
      </p>
    </div>
  );
}
