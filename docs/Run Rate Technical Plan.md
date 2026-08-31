# RunRate Technical Plan

**Tagline:** Freelancer Pricing & Runway Tool

## 1. Frontend — Next.js

Next.js will power the RunRate interface and user experience.

It will handle:
- Account and login screens.
- Freelancer category and currency selection.
- Financial information forms.
- Runway display.
- Job details form.
- Market-rate inputs.
- Rate comparison.
- Minimum and suggested rate displays.
- Runway impact displays.

## 2. Backend / Application Logic — Next.js

Next.js will handle the application logic required for RunRate, including:
- Runway calculations.
- Pricing scenario calculations.
- Minimum-rate calculation.
- Suggested-rate calculation.
- Income-assumption logic.
- Currency-aware calculations.
- Built-in market-rate estimates.

## 3. Database — Supabase

Supabase will store the information that needs to persist for each freelancer, including:
- Freelancer profile/category.
- Currency preference.
- Monthly expenses.
- Current savings.
- Average income.
- Other approved RunRate data required for persistence.

## 4. Authentication — Supabase Auth

Supabase Auth is required for V1.

It will handle:
- Account creation/sign-up.
- Login.
- User identity.
- Secure access to each freelancer's saved information.

Authentication ensures that a freelancer can leave RunRate and return later without entering their financial information again.

## 5. Version Control — GitHub

GitHub will:
- Store the RunRate code.
- Track project changes.
- Provide version history.
- Allow us to recover earlier versions when necessary.

## 6. Hosting — Vercel

Vercel will host the RunRate web application and make it accessible online.

## How the Tools Work Together

Freelancer
↓
Next.js — RunRate interface
↓
Supabase Auth — identifies the freelancer
↓
Supabase Database — stores their information
↓
Next.js — runs pricing and runway logic
↓
Vercel — hosts the live application
↓
GitHub — stores and tracks the project

## Technical Principle

We will introduce technical pieces only when the V1 journey requires them. We will not add unnecessary technology or features beyond the approved RunRate V1 scope.
