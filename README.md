# AI Resume Checker

A full-stack Next.js App Router app for AI-powered resume analysis with:

- Resume upload via PDF or pasted text
- OpenAI-powered scoring and structured feedback
- Free and paid analysis tiers
- Stripe Checkout for upgrades
- Simple email session login
- Vercel-ready deployment

## 1. Install

```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and set:

```bash
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
SESSION_SECRET=...
OPENAI_MODEL=gpt-4o-mini
```

`SESSION_SECRET` is strongly recommended for production.

## 3. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## 4. App flow

- Sign in with an email
- Upload a PDF or paste resume text
- Run the free analysis
- Upgrade to detailed analysis via Stripe
- Download the AI-improved resume text after payment

## 5. Included routes

- `/` homepage with upload UI
- `/login` simple email login
- `/results` analysis results and premium unlock
- `/api/analyze` resume analysis endpoint
- `/api/payment` Stripe Checkout session creator
- `/api/payment/confirm` Stripe payment verification

## 6. Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy.
5. In Stripe test mode, use a test card like `4242 4242 4242 4242`.

## Notes

- The login flow is intentionally simple and uses a signed email session cookie.
- The premium upgrade verifies the Stripe Checkout session before requesting detailed AI output.
- The improved resume is downloaded as a `.txt` file to keep the app serverless-friendly and easy to deploy.
