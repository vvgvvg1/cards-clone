# Paper Phygitals

PaperCrypt-style simulator for Phygitals packs: play money, real pack data (prices, value bands, odds, EV,
buyback) and real top-hit cards with images. Not affiliated with Phygitals. Simulation only.

## Deploy (free, ~3 minutes)
1. Create a free account at vercel.com.
2. Put this folder in a GitHub repo and "Import" it in Vercel (no build settings needed), OR run `npx vercel` in this folder.
3. Open the URL Vercel gives you.

## Run locally
`npx vercel dev` in this folder, then open the printed localhost URL.
(Opening index.html directly will NOT work: it needs the /api/phy function.)

## How it works
- `api/phy.js` is a small read-only proxy to Phygitals' public pack endpoints (claw/list, claw/get and chase/get). All ~50 packs (Pokemon, One Piece, sports, Yu-Gi-Oh, etc.) load from the live list.
- `model.js` rolls a value band by its published weight, then a value inside the band. Phygitals doesn't publish
  the value spread inside a band, so one skew parameter is solved so the simulated EV matches the published EV.
- Only top-hit ("chase") cards have names and images. Cheaper pulls show band + value only until a full
  inventory endpoint is added.
