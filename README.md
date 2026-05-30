# 🌸 Bloom — Pregnancy-friendly beauty

Bloom is a mobile-first web app that imports your beauty purchase history,
understands what you've bought, and flags which items are commonly considered
**pregnancy-friendly** versus worth **replacing** during early pregnancy.

Bring in your purchase history three ways, then Bloom checks each item against a
curated watchlist of ingredients & traits frequently cautioned in pregnancy —
retinoids, hydroquinone, strong fragrance/parfum, high-strength acid peels,
phthalates, formaldehyde, oxybenzone sunscreen filters, and more — and sorts
everything into **Keep / Check / Replace** with plain-language reasons and swap
ideas. The interface is fashion-editorial (Farfetch / Vogue), not medical.

## Three ways to import

| Method | Status | How it works |
| --- | --- | --- |
| **Connect Sephora** | Demo | Sephora has no public account API, so this loads a representative set of recent purchases to show the full flow end-to-end. |
| **Upload screenshots** | Live (needs key) | Photos of order history, receipts, or product pages are read by Gemini's vision model. |
| **Gmail confirmations** | Live | Forward or paste a Sephora order-confirmation email; Gemini extracts the products. Background Gmail sync would need OAuth credentials + a backend. |

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
| `App.tsx` | Tab navigation (Edit / Analyze / Wishlist / Profile) + import flow |
| `lib/types.ts` | Shared types |
| `lib/watchlist.ts` | Curated pregnancy-caution ingredient watchlist + matcher |
| `lib/gemini.ts` | Gemini text + vision parsing, analysis, Sephora demo data, offline fallback |
| `screens/` | Home, ImportHub (3 methods), Review, Results, Wishlist, Profile |
| `components/` | AppBar, TabBar, ProductCard, MonogramTile, Disclaimer |
