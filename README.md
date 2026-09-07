# Picky-Eater Dinners — Landing Page

Static site. No build step, no dependencies beyond Google Fonts.

## Preview locally

Pick whichever needs zero extra setup for you:

```bash
# Option A — Node (no install needed, npx pulls it on demand)
npx serve .

# Option B — Python 3 (built in on most systems)
python -m http.server 8000

# Option C — just open the file
# double-click index.html, or open it directly in a browser
```

Then visit the printed localhost URL (Options A/B), or the file directly (Option C).

## Before this is ready to publish

Drop these 7 image files into `/assets` (same filenames, referenced throughout the page):

- `cover.jpg` — front cover
- `plate-1.jpg` — "Together" plate
- `plate-2.jpg` — "Kept separate" plate
- `plate-3.jpg` — "Simplest version" plate
- `quote-avatar.jpg` — Chef Byte headshot
- `recipe-page-a.jpg` — sample recipe spread, left page
- `recipe-page-b.jpg` — sample recipe spread, right page

Until these are added, the page renders cleanly with labeled placeholder swatches (each `<img>` has an `onerror` fallback).

Also before launch:
- Replace `CHECKOUT_URL` (appears in `index.html` — search for it, ~2 occurrences) with your real Stripe/Gumroad/Payhip link.
- Replace the three placeholder testimonials in the "FROM REAL KITCHENS" section with real customer quotes.
- Update the `mailto:hello@example.com` contact link and the footer refund-policy link.

## Structure

```
/
├── index.html       — markup only
├── css/styles.css    — all styles
├── js/main.js        — countdown timer, image gallery, scroll reveal, sticky CTA
└── assets/           — empty, add your 7 images here
```
