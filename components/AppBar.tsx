/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, Menu, ShoppingBag } from "lucide-react";

export default function AppBar({
  onBack,
  onMenu,
}: {
  onBack?: () => void;
  onMenu?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b hairline bg-paper/90 px-5 py-4 backdrop-blur">
      <button
        onClick={onBack ?? onMenu}
        className="text-ink/80 transition active:scale-90"
        aria-label={onBack ? "Back" : "Menu"}
      >
        {onBack ? <ChevronLeft size={22} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
      </button>
      <span className="wordmark text-[19px] text-ink">Bloom</span>
      <button className="text-ink/80 transition active:scale-90" aria-label="Bag">
        <ShoppingBag size={19} strokeWidth={1.5} />
      </button>
    </header>
  );
}
