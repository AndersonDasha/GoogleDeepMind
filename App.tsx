/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bloom — a mobile-first web app that imports your Sephora purchase history
 * (pasted order emails), extracts each product, and flags which items are
 * commonly considered pregnancy-friendly vs. worth replacing during early
 * pregnancy, using a curated ingredient watchlist grounded into Gemini.
 */

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import AppHeader from "./components/AppHeader";
import ImportScreen from "./components/ImportScreen";
import ProductReview from "./components/ProductReview";
import ResultsScreen from "./components/ResultsScreen";
import { analyzeProducts, parseProducts } from "./lib/gemini";
import type { AnalyzedProduct, ParsedProduct } from "./lib/types";

type Step = "import" | "review" | "results";

export default function App() {
  const [step, setStep] = useState<Step>("import");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedProduct[]>([]);
  const [analyzed, setAnalyzed] = useState<AnalyzedProduct[]>([]);

  const reset = () => {
    setStep("import");
    setParsed([]);
    setAnalyzed([]);
    setError(null);
  };

  async function handleImport(text: string) {
    setError(null);
    setLoading(true);
    try {
      const products = await parseProducts(text);
      if (!products.length) {
        setError("We couldn't spot any products in that text. Try pasting more of the order, or add items manually.");
        return;
      }
      setParsed(products);
      setStep("review");
    } catch {
      setError("Something went wrong reading your products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze(products: ParsedProduct[]) {
    setError(null);
    setLoading(true);
    try {
      const results = await analyzeProducts(products);
      setAnalyzed(results);
      setStep("results");
    } catch {
      setError("Something went wrong during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <AppHeader onReset={reset} showReset={step !== "import"} />

      {error && (
        <div className="mx-5 mb-3 flex items-start gap-2 rounded-2xl bg-rose/10 px-4 py-3 text-[13px] text-rose-deep">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === "import" && <ImportScreen onImport={handleImport} loading={loading} />}

      {step === "review" && (
        <ProductReview
          products={parsed}
          loading={loading}
          onBack={() => setStep("import")}
          onConfirm={handleAnalyze}
        />
      )}

      {step === "results" && <ResultsScreen products={analyzed} />}
    </div>
  );
}
