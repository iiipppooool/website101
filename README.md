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

## Forms and sign-up counts

Every form (waitlist, newsletter, contact, concern, job application) posts to `api/submit.js`, which saves the submission to a Redis database. Each form shows a short note saying the project is not a real product and what the data is used for.

Set-up, once:

1. In Vercel: Project > Storage > Create Database > **Upstash for Redis** (free tier), and connect it to this project. That adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables for you.
2. Add an `ADMIN_KEY` environment variable: a long random password of your own (12+ characters).
3. Redeploy.

Then open `/admin`, enter the admin key, and you get totals per form, a table of submissions and a CSV download. The page is not linked from the site.

Until the database is connected, forms still show their confirmation but nothing is saved.

What is stored: the form fields, the time, and the visitor's country. IP addresses are not stored.

## Analytics

Each page loads Vercel Web Analytics (`/_vercel/insights/script.js`). Turn it on in Vercel: Project > Analytics > Enable. The script only exists on Vercel, so it 404s harmlessly when running locally.

## Email

The contact page lists `placement@`, `guardians@`, `help@` and `press@engramyx.org`. Set up forwarding for those addresses with your domain provider, or mail sent to them will bounce.
