/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Mail,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import {
  HAS_API_KEY,
  NoVisionError,
  demoSephoraPurchases,
  parseProducts,
  parseProductsFromImages,
  type ImageInput,
} from "../lib/gemini";
import type { ParsedProduct } from "../lib/types";

type Method = "choose" | "sephora" | "image" | "gmail";

export type SourceLabel = "Sephora account" | "Uploaded images" | "Gmail confirmations";

const SAMPLE = `Sephora Order #SO48211992
Drunk Elephant A-Passioni Retinol Cream  $74.00
Sol de Janeiro Brazilian Crush Body Fragrance Mist  $38.00
La Roche-Posay Anthelios Mineral Sunscreen SPF 50  $33.50
CeraVe Hydrating Facial Cleanser  $16.99`;

export default function ImportHub({
  onParsed,
}: {
  onParsed: (products: ParsedProduct[], source: SourceLabel) => void;
}) {
  const [method, setMethod] = useState<Method>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (method === "choose") return <Chooser onPick={(m) => { setError(null); setMethod(m); }} />;

  const back = () => { setError(null); setMethod("choose"); };

  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-2">
      <button onClick={back} className="mb-5 flex items-center gap-1 self-start text-sm text-ash">
        <ChevronLeft size={16} /> Methods
      </button>

      {error && (
        <p className="mb-4 border-l-2 border-replace pl-3 text-[13px] text-replace">{error}</p>
      )}

      {method === "sephora" && (
        <SephoraConnect
          loading={loading}
          onConnect={() => {
            setLoading(true);
            // Simulate a brief sync, then hand over demo purchases.
            setTimeout(() => {
              setLoading(false);
              onParsed(demoSephoraPurchases(), "Sephora account");
            }, 1100);
          }}
        />
      )}

      {method === "gmail" && (
        <GmailImport
          loading={loading}
          onSubmit={async (text) => {
            setError(null);
            setLoading(true);
            try {
              const products = await parseProducts(text);
              if (!products.length) {
                setError("We couldn't spot any products. Paste more of the email, or try another method.");
                return;
              }
              onParsed(products, "Gmail confirmations");
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {method === "image" && (
        <ImageImport
          loading={loading}
          onSubmit={async (images) => {
            setError(null);
            setLoading(true);
            try {
              const products = await parseProductsFromImages(images);
              if (!products.length) {
                setError("No products found in those images. Try clearer shots, or another method.");
                return;
              }
              onParsed(products, "Uploaded images");
            } catch (e) {
              setError(e instanceof NoVisionError ? e.message : (e as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------- Chooser -------------------------------- */

function Chooser({ onPick }: { onPick: (m: Method) => void }) {
  const methods: {
    key: Method;
    icon: typeof Store;
    title: string;
    desc: string;
    tag?: string;
  }[] = [
    {
      key: "sephora",
      icon: Store,
      title: "Connect Sephora",
      desc: "Sync your recent purchases automatically.",
      tag: "Demo",
    },
    {
      key: "image",
      icon: ImagePlus,
      title: "Upload screenshots",
      desc: "Photos of orders, receipts or product pages.",
      tag: HAS_API_KEY ? "AI vision" : "Needs key",
    },
    {
      key: "gmail",
      icon: Mail,
      title: "Gmail confirmations",
      desc: "Paste or forward your order emails.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col px-6 pb-10 pt-2">
      <p className="eyebrow text-ash">Step one</p>
      <h1 className="mt-2 font-display text-[30px] leading-[1.1] text-ink">
        Bring in your<br />collection.
      </h1>
      <p className="mt-3 max-w-[18rem] text-[14px] leading-relaxed text-ash">
        Choose how Bloom learns what you own. We'll read each piece, then edit it for early
        pregnancy.
      </p>

      <div className="mt-8 space-y-3">
        {methods.map(({ key, icon: Icon, title, desc, tag }) => (
          <button
            key={key}
            onClick={() => onPick(key)}
            className="group flex w-full items-center gap-4 border hairline px-5 py-5 text-left transition hover:border-ink active:scale-[0.99]"
          >
            <Icon size={22} strokeWidth={1.4} className="shrink-0 text-ink" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-display text-[17px] text-ink">{title}</span>
                {tag && (
                  <span className="eyebrow border hairline px-1.5 py-0.5 text-[9px] text-ash">
                    {tag}
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-[13px] text-ash">{desc}</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-ink/30 transition group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Sephora (demo) ---------------------------- */

function SephoraConnect({ loading, onConnect }: { loading: boolean; onConnect: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="eyebrow text-ash">Connect</p>
      <h2 className="mt-2 font-display text-[26px] text-ink">Your Sephora account</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-ash">
        Bloom will pull in your recent purchase history and edit it for pregnancy. Your data stays
        on your device.
      </p>

      <div className="mt-6 border hairline bg-stone/60 p-4">
        <p className="eyebrow text-ink/70">Heads up</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ash">
          Sephora doesn't offer a public account API, so this demo loads a representative set of
          recent purchases to show the full experience. Upload or Gmail import use your real data.
        </p>
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={onConnect}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 bg-ink py-4 text-paper transition active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Syncing purchases…
            </>
          ) : (
            <span className="eyebrow text-paper">Connect account (Demo)</span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Gmail/paste ----------------------------- */

function GmailImport({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <div className="flex flex-1 flex-col">
      <p className="eyebrow text-ash">Import</p>
      <h2 className="mt-2 font-display text-[26px] text-ink">From your inbox</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-ash">
        Forward or paste a Sephora order-confirmation email below. Bloom reads the products and
        leaves everything else behind.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your confirmation email…"
        className="mt-5 min-h-[200px] flex-1 resize-none border hairline bg-stone/40 p-4 text-[14px] leading-relaxed text-ink placeholder:text-ash/70 focus:border-ink focus:outline-none"
      />
      {!text && (
        <button onClick={() => setText(SAMPLE)} className="mt-2 self-start eyebrow text-ink/60 underline">
          Use a sample email
        </button>
      )}

      <button
        onClick={() => onSubmit(text)}
        disabled={!text.trim() || loading}
        className="mt-5 flex items-center justify-center gap-2 bg-ink py-4 text-paper transition active:scale-[0.99] disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Reading…
          </>
        ) : (
          <span className="eyebrow text-paper">Read my products</span>
        )}
      </button>
    </div>
  );
}

/* -------------------------------- Images --------------------------------- */

function ImageImport({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (images: ImageInput[]) => void;
}) {
  const [files, setFiles] = useState<{ url: string; image: ImageInput }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function add(list: FileList | null) {
    if (!list) return;
    const next: { url: string; image: ImageInput }[] = [];
    for (const file of Array.from(list).slice(0, 8)) {
      const base64 = await fileToBase64(file);
      next.push({ url: URL.createObjectURL(file), image: { base64, mimeType: file.type } });
    }
    setFiles((f) => [...f, ...next].slice(0, 8));
  }

  return (
    <div className="flex flex-1 flex-col">
      <p className="eyebrow text-ash">Upload</p>
      <h2 className="mt-2 font-display text-[26px] text-ink">Screenshots & photos</h2>
      <p className="mt-3 text-[14px] leading-relaxed text-ash">
        Add screenshots of your order history, receipts, or product pages. Bloom's vision model
        reads the products for you.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => add(e.target.files)}
      />

      {files.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-6 flex min-h-[200px] flex-1 flex-col items-center justify-center gap-3 border border-dashed hairline text-ash transition hover:border-ink"
        >
          <ImagePlus size={28} strokeWidth={1.2} />
          <span className="eyebrow">Tap to add images</span>
        </button>
      ) : (
        <div className="mt-6 grid flex-1 grid-cols-3 content-start gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative aspect-square overflow-hidden bg-stone">
              <img src={f.url} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => setFiles((xs) => xs.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-ink/80 text-paper"
                aria-label="Remove"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {files.length < 8 && (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center border border-dashed hairline text-ash hover:border-ink"
            >
              <ImagePlus size={20} strokeWidth={1.3} />
            </button>
          )}
        </div>
      )}

      {!HAS_API_KEY && (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-check">
          <Sparkles size={12} /> Image reading needs a Gemini API key.
        </p>
      )}

      <button
        onClick={() => onSubmit(files.map((f) => f.image))}
        disabled={!files.length || loading}
        className="mt-5 flex items-center justify-center gap-2 bg-ink py-4 text-paper transition active:scale-[0.99] disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Reading images…
          </>
        ) : (
          <span className="eyebrow text-paper">Read {files.length || ""} image{files.length === 1 ? "" : "s"}</span>
        )}
      </button>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
