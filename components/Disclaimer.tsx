/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-ash ${className}`}>
      <span className="eyebrow text-ink/70">A note</span>
      <br />
      Bloom offers editorial guidance, not medical advice. Ingredient research evolves and every
      pregnancy is different — always confirm with your doctor or midwife before changing your
      routine.
    </p>
  );
}
