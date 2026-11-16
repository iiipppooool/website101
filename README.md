# Engramyx

Multi-page marketing site. Static HTML, CSS and vanilla JavaScript: no build step.

## Pages

| Route | File |
| --- | --- |
| `/` | `index.html` |
| `/how-it-works` | `how-it-works.html` |
| `/app` | `app.html` |
| `/motor-link` | `motor-link.html` |
| `/safety` | `safety.html` |
| `/about` | `about.html` |
| `/contact` | `contact.html` |
| `/support` | `support.html` |
| not found | `404.html` |

Shared navigation, footer, waitlist modal, page transitions, cursor, reveals, counters, glitch text and form handling live in `assets/js/main.js`. Each page has its own script in `assets/js/`.

## Run locally

Links use clean URLs (`/app`, not `/app.html`), so use a server that resolves them:

```bash
npx serve .
```

## Deploy to Vercel

Import the repository in Vercel. Framework preset: **Other**. No build command, output directory is the repo root. `vercel.json` turns on clean URLs.

## Donations (Stripe)

`/support` posts to `api/checkout.js`, a Vercel serverless function that creates a Stripe Checkout Session and redirects to Stripe's hosted page.

1. In Stripe, copy your secret key (Developers > API keys). Use a `sk_test_...` key first.
2. In Vercel: Project > Settings > Environment Variables, add `STRIPE_SECRET_KEY`. Optionally add `DONATION_CURRENCY` (default `gbp`).
3. Redeploy. Test with card `4242 4242 4242 4242`, then swap in the live key.

Until the key is set, the page shows "Donations are not switched on yet."

## Forms

The waitlist, contact, concern, application and newsletter forms validate in the browser and show a confirmation, but do not send data anywhere. Submissions are only written to the visitor's own `localStorage`. To collect real submissions, post the form data to a backend in the `submit` handler in `assets/js/main.js`.
