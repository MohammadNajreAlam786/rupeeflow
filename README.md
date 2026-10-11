# RupeeFlow — Gen Z Financial Decision Engine 💸⚡

> An individual submission developed for the **PROMPT RUN Vibe Coding Hackathon**  
> *Master a limited ₹10,000 budget over 30 days. Simulate every decision before spending a single rupee.*

![RupeeFlow License](https://img.shields.io/badge/License-MIT-emerald.svg)
![React 19](https://img.shields.io/badge/React-19.2-cyan.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-indigo.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)

---

## 🎯 Problem Statement

Gen Z students and early-career pros in India often struggle with managing a fixed monthly allowance or stipend (such as ₹10,000 over a 30-day cycle). Without visibility into:
1. **Mandatory upcoming commitments** (broadband split, mobile recharge, streaming subs, gym dues),
2. **True safe-to-spend allowance** per day,
3. **The ripple effect** of impulse purchases or surprise expenses on month-end solvency,

...they frequently face acute month-end cash crunches ("month-end broke syndrome").

**RupeeFlow** solves this through an **interconnected financial calculation engine** and an interactive **Decision Lab**, empowering users to simulate what-if scenarios (purchases, gig income, subscription cancellations, savings deposits) before committing real funds.

---

## ✨ Key Features & Views

### 1. 📊 Financial Command Center (Dashboard)
- **4 Vital Metrics**: Liquid Available Cash, Safe-to-Spend Pool, Daily Discretionary Allowance, and Reserved Commitments.
- **30-Day Capital Allocation Bar**: Interactive stacked visual breakdown showing Spent to Date, Locked in Goals, Reserved for Bills, and Free Discretionary Cushion.
- **Radial Financial Health Gauge**: Real-time 0–100 index with risk pill (Low, Moderate, High) and "Audit Math" modal.
- **Timeline Scrubber**: Interactive 1–30 day slider letting judges and users simulate the progression of days and observe how remaining days dynamically recalibrate daily allowances.
- **Upcoming Bills Stream**: Displays bills due in the next 3–7 days with one-click **"Pay"** settlement.

### 2. 🧪 Decision Lab (What-If Simulation Sandbox)
- **Pure Non-Mutating Sandbox**: Simulates decisions in isolated memory without touching live ledger state until explicitly confirmed.
- **Supported Scenarios**:
  - *Discretionary Spends* (Concerts, shopping, dining out)
  - *Unexpected Emergencies* (Medical, phone repair)
  - *New Income / Gigs* (Freelance contracts, cashbacks, allowances)
  - *Subscription Cancellations* (Unreserving recurring monthly expenses)
  - *Savings Goal Contributions* (Locking cash into emergency cushions)
- **Side-by-Side Comparison Matrix**: Before vs. After delta comparison across Cash Balance, Safe-to-Spend, Daily Allowance, Health Score, and Month-End Forecast.
- **Narrative Impact Explanation**: Plain-English explanation detailing whether mandatory commitments remain 100% funded and how daily flexibility is affected.
- **Affordability Checks**: Automated flags for bill default risk and survival floor violations (< ₹150/day).
- **Commit or Revert**: One-click "Commit Decision" logs the transaction or updates commitments; "Cancel" restores the sandbox.

### 3. 📜 Cashflow Ledger (Transactions)
- Full ledger of income inflows and expense outflows.
- Search by merchant or notes, filter by type (Income/Expense), filter by category, and sort by timeline or amount.
- **Add, Edit, and Delete** with instant recalculation of all financial balances.
- Formatted in Indian Rupee currency standards (`₹10,000`, `₹1,500`, etc.).

### 4. 🐷 Savings & Emergency Reserves
- Create and manage targeted goals (Emergency Buffer, Goa Trip, Mechanical Keyboard).
- Progress meters with percentage tracking and target completion estimates.
- **Transfer Funds**: Safe deposits and withdrawals validated against liquid cash.
- **Milestone Celebrations**: Interactive confetti animations when reaching 100% of a target.

### 5. 📅 Commitments & Subscriptions
- Track upcoming mandatory bills (Hostel Wi-Fi, Jio 5G, Gym dues) and streaming subscriptions (Spotify, Netflix).
- **Automatic Reservation**: Unpaid commitments are deducted from available cash to calculate the genuine safe-to-spend limit.
- **No Double-Counting Accounting Rule**: Marking a bill as paid creates a ledger expense transaction and simultaneously removes it from reserved commitments.
- **One-Click Cancel**: Cancel subscriptions to immediately boost daily discretionary allowance.

### 6. 📈 Insights & 30-Day Forecast
- **Recharts Spending Trajectory Area Chart**: Plots actual cumulative spend vs. ideal linear benchmark (₹333/day) and projects future burn rate trajectory through Day 30.
- **Category Donut Breakdown**: Visual breakdown of expenses across Food & Dining, Utilities, Shopping, Entertainment, etc.
- **End-of-Period Forecast**: Estimates month-end surplus or deficit, projected depletion day, and documents all mathematical assumptions.
- **Actionable Optimization Steps**: Context-aware suggestions based on top spend categories.

---

## 🧮 Interconnected Financial Engine & Accounting Rules

RupeeFlow enforces strict mathematical invariants managed by a single source of truth in [`src/engine/calculator.ts`](src/engine/calculator.ts):

```
1. Total Available Income = Initial Budget (₹10,000) + Additional Income Transactions
2. Liquid Cash Balance    = Total Available Income - Total Actual Expenses - Total Savings Locked
3. Reserved Commitments   = Sum of Unpaid Active Commitments (Status: 'upcoming')
4. Safe-to-Spend Pool     = Liquid Cash Balance - Reserved Commitments
5. Days Remaining         = Total Period (30) - Current Day + 1
6. Safe Daily Allowance   = Max(0, Safe-to-Spend Pool / Days Remaining)
```

### Deterministic Financial Health Index (0–100)

| Pillar | Weight | Description |
| :--- | :---: | :--- |
| **Budget Adherence** | **30%** | Compares cumulative spend pace to expected day-in-cycle benchmark. |
| **Daily Cushion** | **25%** | Evaluates safe daily allowance against the minimum ₹150/day survival floor. |
| **Commitment Coverage** | **25%** | Tests whether liquid cash covers upcoming mandatory bills (coverage ratio ≥ 1.0x). |
| **Savings Buffer** | **20%** | Rewards reserving 10%–15% (₹1,000–₹1,500) of capital in emergency goals. |

**Risk Levels**:
- 🟢 **Low Risk (75–100)**: Resilient cashflow, commitments covered 2x+, healthy daily cushion.
- 🟡 **Moderate Risk (50–74)**: Pacing requires discipline, narrow discretionary margin.
- 🔴 **High Risk (0–49)**: Deficit hazard, bills at risk of default, or allowance squeezed below baseline.

*Disclaimer: RupeeFlow's scoring is an educational deterministic model and does not constitute certified financial or investment advice.*

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) with custom dark fintech design system
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts 3.x](https://recharts.org/)
- **Visual Polish**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Persistence**: Browser `localStorage` with a persistent single source of truth and one-click "Reset Demo Data" option.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/MohammadNajreAlam786/rupeeflow.git
cd rupeeflow

# 2. Install dependencies
npm install

# 3. Launch Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build
```bash
# Verify TypeScript types and build minified production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment Instructions

### Deploy to Vercel (Recommended)
1. Fork or push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `rupeeflow` repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Click **Deploy**.

> Note: The included [`vercel.json`](vercel.json) already configures SPA route rewrites (`/(.*) -> /index.html`).

---

## 🧪 Demo & Testing Guide for Hackathon Judges

1. **Dashboard Check**: Note the initial balance of ₹7,320, safe-to-spend of ₹5,453, and daily allowance of ₹287/day.
2. **Timeline Slider**: In the left sidebar, slide the "Cycle Timeline" slider from Day 12 to Day 20 and watch the daily allowance adjust in real time.
3. **Decision Lab**:
   - Navigate to **Decision Lab**.
   - Select "Discretionary Spend" and try the **"Concert Ticket (₹1,500)"** preset.
   - Observe the Before vs. After matrix and read the narrative explanation.
   - Click **Commit Decision** and see it immediately reflected in your Ledger and Dashboard.
4. **Mark Bill Paid**:
   - Go to **Commitments**.
   - Click **"Pay"** on Hostel WiFi (₹350).
   - Notice how it transfers to your transactions ledger with zero double-counting.
5. **Confetti Milestone**:
   - Go to **Savings Goals**.
   - Click **Transfer Funds** on Emergency Raincheck Fund, deposit ₹1,200, and watch the confetti celebrate 100% completion!
6. **Reset Anytime**:
   - Click **Reset Demo Data** in the sidebar to reset all records back to the default state.

---

## 📄 License
MIT License © 2026. All rights reserved.
