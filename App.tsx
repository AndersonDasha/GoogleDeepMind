/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bloom — an editorial, mobile-first beauty app that imports your purchase
 * history (Sephora connect / image upload / Gmail confirmations), then edits
 * each product for early pregnancy: keep, check, or replace.
 */

import { useMemo, useState } from "react";
import AppBar from "./components/AppBar";
import TabBar, { type Tab } from "./components/TabBar";
import HomeScreen from "./screens/HomeScreen";
import ImportHub, { type SourceLabel } from "./screens/ImportHub";
import ReviewScreen from "./screens/ReviewScreen";
import ResultsScreen from "./screens/ResultsScreen";
import WishlistScreen from "./screens/WishlistScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { analyzeProducts } from "./lib/gemini";
import type { AnalyzedProduct, ParsedProduct } from "./lib/types";

type ImportStep = "hub" | "review" | "results";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [step, setStep] = useState<ImportStep>("hub");
  const [loading, setLoading] = useState(false);

  const [parsed, setParsed] = useState<ParsedProduct[]>([]);
  const [source, setSource] = useState<SourceLabel | null>(null);
  const [analyzed, setAnalyzed] = useState<AnalyzedProduct[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const wishlist = useMemo(
    () => analyzed.filter((p) => savedIds.has(p.id)),
    [analyzed, savedIds],
  );

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startImport() {
    setStep("hub");
    setTab("import");
  }

  async function handleParsed(products: ParsedProduct[], src: SourceLabel) {
    setParsed(products);
    setSource(src);
    setStep("review");
  }

  async function handleAnalyze(products: ParsedProduct[]) {
    setLoading(true);
    try {
      const results = await analyzeProducts(products);
      setAnalyzed(results);
      // Pre-save everything we recommend keeping.
      setSavedIds(new Set(results.filter((r) => r.status === "keep").map((r) => r.id)));
      setStep("results");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setParsed([]);
    setSource(null);
    setAnalyzed([]);
    setSavedIds(new Set());
    setStep("hub");
    setTab("home");
  }

  // Within the Analyze tab, the back arrow steps the import flow back.
  const back =
    tab === "import" && step === "review"
      ? () => setStep("hub")
      : tab === "import" && step === "results"
        ? () => setStep("hub")
        : undefined;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col bg-paper">
      <AppBar onBack={back} onMenu={() => setTab("profile")} />

      <main className="flex flex-1 flex-col pt-4">
        {tab === "home" && (
          <HomeScreen
            onStart={startImport}
            results={analyzed.length ? analyzed : null}
            onViewResults={() => {
              setStep("results");
              setTab("import");
            }}
          />
        )}

        {tab === "import" && step === "hub" && <ImportHub onParsed={handleParsed} />}
        {tab === "import" && step === "review" && (
          <ReviewScreen
            products={parsed}
            source={source ?? "Gmail confirmations"}
            loading={loading}
            onConfirm={handleAnalyze}
          />
        )}
        {tab === "import" && step === "results" && (
          <ResultsScreen
            products={analyzed}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onRestart={() => setStep("hub")}
          />
        )}

        {tab === "wishlist" && (
          <WishlistScreen items={wishlist} onToggleSave={toggleSave} onStart={startImport} />
        )}

        {tab === "profile" && (
          <ProfileScreen source={source} analyzedCount={analyzed.length} onReset={resetAll} />
        )}
      </main>

      <TabBar tab={tab} onChange={setTab} wishlistCount={wishlist.length} />
    </div>
  );
}
