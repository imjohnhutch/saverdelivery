# SaverDelivery

Side-by-side discount comparison across delivery apps. Punch in what you want to order and see who's cheapest after promos, fees, and delivery — instead of opening four apps and doing it in your head.

## Why

Every delivery app runs its own promo cycle. The "cheapest" app on any given day depends on the order total, your distance, current promos, and which fees apply where. The math is annoying. This does the math.

## Stack

- **Next.js** (App Router) + TypeScript
- **Prisma** + Postgres for menu / promo / fee storage
- **Playwright + Cheerio** for scraping current promo state per app
- **shadcn/ui** + Tailwind for the comparison UI
- **Railway** for deploy

## Status

Pre-launch. Building out scraper coverage per delivery app and the comparison UI.

## Local dev

```bash
npm install
cp .env.example .env   # set DATABASE_URL
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.
