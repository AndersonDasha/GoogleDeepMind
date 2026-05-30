# 🌸 Bloom — Pregnancy-friendly beauty

Bloom is a mobile-first web app that imports your beauty purchase history,
understands what you've bought, and flags which items are commonly considered
**pregnancy-friendly** versus worth **replacing** during early pregnancy.

You paste your Sephora order-confirmation emails (or any list of products);
Bloom extracts each item and checks it against a curated watchlist of
ingredients & traits that are frequently cautioned in pregnancy — retinoids,
hydroquinone, strong fragrance/parfum, high-strength acid peels, phthalates,
formaldehyde, oxybenzone sunscreen filters, and more — then sorts everything
into **Keep / Check / Replace** with plain-language reasons and swap ideas.

> ⚕️ **Not medical advice.** Bloom is an educational tool. Ingredient guidance
> evolves and every pregnancy is different — always confirm with your doctor or
> midwife before changing your routine.

## How it works

1. **Import** — paste order emails. Gemini extracts a clean product list
   (with an offline line-parser fallback if no API key is set).
2. **Review** — edit, remove, or add products before analysis.
3. **Analyze** — each product is assessed by Gemini, *grounded* in the curated
   watchlist (`lib/watchlist.ts`). A deterministic watchlist scan runs on top as
   a safety net, so known-cautioned ingredients are always surfaced and a
   verdict can only ever be escalated (never quietly downgraded).
4. **Results** — a dashboard of Keep / Check / Replace, filterable, with
   per-product concerns and suggested alternatives.

Works fully offline (on-device watchlist only) when `GEMINI_API_KEY` is unset.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. (Optional) Set `GEMINI_API_KEY` in `.env.local` to enable AI-assisted parsing
   and analysis. Without it, Bloom falls back to the on-device watchlist.
3. Run: `npm run dev` → http://localhost:3000

Add it to your phone's home screen ("Add to Home Screen") to use it like a
native app.

## Project structure

| Path | Purpose |
| --- | --- |
| `App.tsx` | Three-step flow: import → review → results |
| `lib/types.ts` | Shared types |
| `lib/watchlist.ts` | Curated pregnancy-caution ingredient watchlist + matcher |
| `lib/gemini.ts` | Gemini parse/analyze + offline heuristic fallback |
| `components/` | UI: import, review, results, product cards, header, disclaimer |
