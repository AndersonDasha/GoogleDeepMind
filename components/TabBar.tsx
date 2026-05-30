/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Heart, Home, ScanLine, User } from "lucide-react";

export type Tab = "home" | "import" | "wishlist" | "profile";

const TABS: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Edit", icon: Home },
  { key: "import", label: "Analyze", icon: ScanLine },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "profile", label: "Profile", icon: User },
];

export default function TabBar({
  tab,
  onChange,
  wishlistCount = 0,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
  wishlistCount?: number;
}) {
  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-4 border-t hairline bg-paper/95 px-2 pb-6 pt-2.5 backdrop-blur">
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative flex flex-col items-center gap-1 py-1 transition ${
              active ? "text-ink" : "text-ink/35"
            }`}
          >
            <span className="relative">
              <Icon size={21} strokeWidth={active ? 1.9 : 1.4} />
              {key === "wishlist" && wishlistCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-semibold text-paper">
                  {wishlistCount}
                </span>
              )}
            </span>
            <span className="eyebrow text-[9px]">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
