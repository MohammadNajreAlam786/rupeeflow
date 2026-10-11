# RupeeFlow — Gen Z Financial Decision Engine 💸⚡

> An individual submission developed for the **PROMPT RUN Vibe Coding Hackathon**  
> *Master a limited ₹10,000 budget over 30 days. Simulate every decision before spending a single rupee.*

![RupeeFlow License](https://img.shields.io/badge/License-MIT-emerald.svg)
![React 19](https://img.shields.io/badge/React-19.2-cyan.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-indigo.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)

---

## 🎯 Problem Statement & Challenge Model

Gen Z students, interns, and early-career professionals in India commonly manage a tight monthly budget or stipend—typically **₹10,000 over a 30-day cycle**.

Traditional personal finance trackers fail this demographic because they are **historical and post-facto**: they record transactions *after* money is already gone ("month-end broke syndrome"). They do not account for:
1. **Mandatory Scheduled Commitments**: Fixed bills (broadband splits, mobile data packs, OTT subscriptions, gym dues) that must be honored later in the month.
2. **True Safe-to-Spend Allowance**: The actual daily discretionary ceiling after subtracting upcoming liabilities from liquid cash.
3. **The Ripple Effect of Discretionary Choices**: How a single impulse purchase (e.g. concert pass or weekend dining) depresses the daily allowance for every remaining day of the cycle.
4. **Minimum Survival Floor**: Ensuring the user never breaches a critical baseline subsistence allowance (calibrated at **₹150/day** for meals and local transit).

**RupeeFlow** solves this through an **interconnected mathematical engine** and a real-time **Decision Lab**, allowing users to simulate the full ripple effect of any financial decision before spending a single rupee.

---

## 🏗️ Repository Architecture & Directory Structure

RupeeFlow is structured with strict separation between pure mathematical engines, reactive state containers, and presentation components:

```
rupeeflow/
├── src/
│   ├── components/
│   │   ├── commitments/       # Recurring bills & subscription management
│   │   │   ├── CommitmentModal.tsx   # Add/edit commitment form with accessible labels
│   │   │   └── CommitmentsView.tsx   # Filterable bill schedule, pay settlement, cancel
│   │   ├── common/            # Shared reusable UI primitives
│   │   │   ├── Badge.tsx             # Risk, status, and category pill badges
│   │   │   ├── ErrorBoundary.tsx     # Graceful error boundary for code-split views
│   │   │   ├── HealthScoreGauge.tsx  # Radial health meter with audit math trigger
│   │   │   ├── MetricCard.tsx        # Keyboard-accessible vital metric display cards
│   │   │   ├── Modal.tsx             # Focus-trapped, escape-closable dialog container
│   │   │   └── Toast.tsx             # Notification toast container & alerts
│   │   ├── dashboard/         # Financial Command Center
│   │   │   ├── DashboardView.tsx     # Vitals, stacked capital allocation, quick actions
│   │   │   └── HealthBreakdownModal.tsx # 4-pillar health score audit dialog
│   │   ├── decisionLab/       # What-if decision simulation sandbox
│   │   │   └── DecisionLabView.tsx   # Live before/after matrix & scenario presets
│   │   ├── insights/          # Forecast & analytics
│   │   │   └── InsightsView.tsx      # Trajectory area chart, category donut, runway forecaster
│   │   ├── layout/            # Application shell
│   │   │   ├── Header.tsx            # Sticky header with breadcrumbs & add transaction CTA
│   │   │   ├── MobileNav.tsx         # Mobile bottom navigation bar
│   │   │   └── Sidebar.tsx           # Desktop navigation, timeline slider, demo reset
│   │   ├── savings/           # Target savings milestones
│   │   │   ├── ContributeModal.tsx   # Deposit / withdrawal dialog
│   │   │   ├── GoalModal.tsx         # Goal creator with color & category pickers
│   │   │   └── SavingsGoalsView.tsx  # Goal cards, progress tracking, confetti milestones
│   │   └── transactions/      # Cashflow ledger
│   │       ├── TransactionModal.tsx  # Transaction creation & edit modal
│   │       └── TransactionsView.tsx  # Filterable, searchable, sorted ledger table
│   ├── context/
│   │   └── FinanceContext.tsx # Central state container, localStorage sync & actions
│   ├── data/
│   │   └── seedData.ts        # Initial ₹10,000 / 30-day baseline state & sample records
│   ├── engine/                # 100% PURE, SIDE-EFFECT-FREE CALCULATION ENGINES
│   │   ├── calculator.ts      # Core balance reconciliation & mathematical invariants
│   │   ├── decisionSimulator.ts # Hypothetical simulation sandbox & delta generator
│   │   ├── forecaster.ts      # Burn rate velocity, runway depletion day, end forecast
│   │   └── healthScore.ts     # 4-pillar deterministic health score algorithm (0–100)
│   ├── types/
│   │   └── finance.ts         # TypeScript domain interfaces, unions, and metrics
│   ├── utils/
│   │   └── formatters.ts      # INR currency formatting, date helpers, category mappings
│   ├── App.css                # Component styling helpers
│   ├── App.tsx                # Shell with React.lazy code-splitting & ErrorBoundary
│   ├── index.css              # Tailwind CSS directives, dark theme tokens, font imports
│   └── main.tsx               # Application entry point
├── public/                    # Static public assets
├── .oxlintrc.json             # Oxlint configuration
├── index.html                 # HTML shell
├── package.json               # Project scripts and dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Custom dark fintech theme tokens and glow utilities
├── tsconfig.json              # TypeScript root configuration
├── tsconfig.app.json          # TypeScript application configuration
├── tsconfig.node.json         # TypeScript tooling configuration
├── vercel.json                # SPA routing configuration for Vercel
└── vite.config.ts             # Vite build configuration
```

---

## ⚙️ Configuration & Environment

RupeeFlow is architected as an **offline-first, zero-backend, client-side web application**:

- **Zero Secrets / API Keys**: Does not require any `.env` files, third-party API credentials, or cloud database connections.
- **Budget Configuration**: Configurable in [`src/data/seedData.ts`](src/data/seedData.ts) via the `DEFAULT_BUDGET_CONFIG` object:
  - `initialBudget`: **₹10,000** (standard baseline student/intern stipend).
  - `budgetPeriodDays`: **30** days.
  - `currentDay`: **12** (defaults to mid-cycle to showcase active mid-month decisions).
  - `minDailySurvivalBudget`: **₹150/day** (calibrated baseline for basic subsistence).
  - `periodStartDate`: `'2026-10-01'`.

---

## 🧮 Financial Accounting Logic & Mathematical Invariants

All metrics are derived deterministically in [`src/engine/calculator.ts`](src/engine/calculator.ts) from the active data collections (`transactions`, `commitments`, `savingsGoals`, and `config`). State invariants are strictly enforced:

### 1. Core Financial Formulas

$$\text{Total Available Income} = \text{Initial Budget (₹10,000)} + \sum \text{Income Transactions}$$

$$\text{Liquid Available Cash} = \text{Total Available Income} - \sum \text{Expense Transactions} - \sum \text{Savings Goals Locked}$$

$$\text{Reserved Commitments} = \sum \text{Active Commitments where } \text{status} = \text{'upcoming'}$$

$$\text{Safe-to-Spend Pool} = \text{Liquid Available Cash} - \text{Reserved Commitments}$$

$$\text{Days Remaining} = \max(1, \text{Budget Period Days (30)} - \text{Current Day} + 1)$$

$$\text{Safe Daily Allowance} = \begin{cases} \frac{\text{Safe-to-Spend Pool}}{\text{Days Remaining}} & \text{if Safe-to-Spend} > 0 \\ 0 & \text{otherwise} \end{cases}$$

### 2. The Escrow Cushion Protocol (Zero Double-Counting Invariant)

When an upcoming commitment is settled via `markCommitmentPaid()`:
1. The commitment's status changes from `'upcoming'` to `'paid'`.
2. An expense transaction is added to the ledger with a unique payment ID (`tx_pay_${id}_${timestamp}`).
3. **No Double-Counting Proof**:
   - `Reserved Commitments` decreases by bill amount $X$.
   - `Liquid Available Cash` decreases by bill amount $X$.
   - $\Delta \text{SafeToSpend} = \Delta \text{AvailableCash} - \Delta \text{ReservedCommitments} = (-X) - (-X) = 0$.
   - **Result**: Paying a scheduled bill never penalizes the user's daily discretionary allowance because the money was already escrowed.

### 3. Deterministic Financial Health Score (0–100)

Calculated in [`src/engine/healthScore.ts`](src/engine/healthScore.ts) across four weighted pillars:

| Pillar | Max Pts | Weight | Mathematical Evaluation Rule |
| :--- | :---: | :---: | :--- |
| **Budget Adherence** | 30 | 30% | Compares actual cumulative spending against expected timeline velocity: $\text{ratio} = \frac{\text{Expenses}}{\text{Income} \times (\text{Day} / 30)}$. Ratio $\le 0.85$ earns 30 pts; $\le 1.0$ earns 26 pts; $\le 1.2$ earns 18 pts; $\le 1.5$ earns 10 pts; overrun earns 4 pts. |
| **Daily Cushion** | 25 | 25% | Evaluates daily allowance against minimum survival threshold (₹150/day). Allowance $\ge 2.2\times$ threshold earns 25 pts; $\ge 1.5\times$ earns 20 pts; $\ge 1.0\times$ earns 14 pts; $> 0$ earns 6 pts; $\le 0$ earns 0 pts. |
| **Commitment Coverage** | 25 | 25% | Evaluates liquid cash against upcoming unpaid bills: $\text{ratio} = \frac{\text{Available Cash}}{\text{Reserved Commitments}}$. Ratio $\ge 2.0\times$ earns 25 pts; $\ge 1.5\times$ earns 22 pts; $\ge 1.0\times$ earns 18 pts; $< 1.0\times$ earns proportional fraction; deficit earns 0 pts. |
| **Savings Buffer** | 20 | 20% | Evaluates emergency funds locked relative to initial budget. Savings $\ge 12\%$ (₹1,200) earns 20 pts; $\ge 8\%$ earns 16 pts; $\ge 5\%$ earns 12 pts; $> 0$ earns 6 pts. |

**Composite Risk Levels**:
- 🟢 **Low Risk (75–100)**: Resilient cashflow, bills fully covered, daily allowance well above baseline.
- 🟡 **Moderate Risk (50–74)**: Discretionary cushion is narrow; requires disciplined spending pace.
- 🔴 **High Risk (0–49)**: Deficit hazard; bills at risk of default or allowance depressed below survival floor.

### 4. 30-Day Budget Forecast & Runway Forecaster

Calculated in [`src/engine/forecaster.ts`](src/engine/forecaster.ts):
- **Historical Burn Rate**: $\text{burnRatePerDay} = \frac{\text{Total Expenses}}{\text{Days Elapsed}}$
- **Ideal Benchmark Pace**: $\text{idealBurnRatePerDay} = \frac{\text{Initial Budget (₹10,000)}}{30} = \text{₹333.33/day}$
- **Projected End Balance**:
  $$\text{projectedEndBalance} = \text{Available Cash} - (\text{burnRatePerDay} \times (\text{Days Remaining} - 1)) - \text{Reserved Commitments}$$
- **Runway Depletion Day**: If heading toward a deficit ($\text{projectedEndBalance} < 0$), estimates the exact calendar day when cash reserves hit zero:
  $$\text{estimatedRunoutDay} = \text{Current Day} + \left\lfloor \frac{\text{Available Cash}}{\text{burnRatePerDay} + (\text{Reserved Commitments} / \text{Days Remaining})} \right\rfloor$$

---

## 🧪 Decision Lab: Simulation vs. Commit Lifecycle

The Decision Lab in [`src/components/decisionLab/DecisionLabView.tsx`](src/components/decisionLab/DecisionLabView.tsx) separates hypothetical exploration from persistent state mutation:

```
[User Selects Scenario or Enters Amount]
                │
                ▼
┌────────────────────────────────────────┐
│  simulateFinancialDecision() (PURE)    │
│  - Clones data arrays in memory        │
│  - Executes calculator & forecaster    │
│  - Generates delta matrix & narrative  │
│  - ZERO side effects on live state     │
└──────────────────┬─────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│ Cancel / Revert  │ │ Commit Decision  │
│ - Resets sandbox │ │ - Validates > ₹0 │
│ - State untouched│ │ - Guard: active  │
└──────────────────┘ │   subscription   │
                     │ - Updates State  │
                     │ - Syncs Storage  │
                     └──────────────────┘
```

1. **Hypothetical Simulation Phase**:
   - Executes via [`simulateFinancialDecision()`](src/engine/decisionSimulator.ts).
   - Generates an immutable `SimulationResult` containing current state, simulated state, net deltas, affordability checks, and narrative guidance.
   - Reverting or changing inputs leaves the live ledger untouched.
2. **Commit Decision Phase**:
   - Handled by `commitDecision()` in [`src/context/FinanceContext.tsx`](src/context/FinanceContext.tsx).
   - **Validation Guards**: Rejects amounts $\le 0$ or NaN for purchases, emergencies, income, and goal deposits.
   - **Subscription Sync**: Disallows implicit fallback cancellation; requires an explicit active subscription ID and matches simulated savings to its exact monthly cost.
   - **Commit Execution**: Creates real transactions, updates commitment status, records savings, and displays confirmation toasts.

---

## 💾 Data Persistence & Defensive Storage Architecture

State persists reactively across browser sessions using `localStorage` through verified keys:

| Storage Key | TypeScript Type | Seed Data Fallback | Defensive Validation Guard |
| :--- | :--- | :--- | :--- |
| `rf_transactions_v1` | `Transaction[]` | `INITIAL_TRANSACTIONS` | Validates `Array.isArray(parsed)`. Reverts to seed if non-array or invalid JSON. |
| `rf_commitments_v1` | `Commitment[]` | `INITIAL_COMMITMENTS` | Validates `Array.isArray(parsed)`. Reverts to seed if non-array or invalid JSON. |
| `rf_goals_v1` | `SavingsGoal[]` | `INITIAL_SAVINGS_GOALS` | Validates `Array.isArray(parsed)`. Reverts to seed if non-array or invalid JSON. |
| `rf_config_v1` | `BudgetConfig` | `DEFAULT_BUDGET_CONFIG` | Validates object type and ensures `typeof parsed.initialBudget === 'number'`. |

- **One-Click Reset**: The "Reset Demo Data" button in the sidebar clears all four keys from `localStorage` and restores the clean ₹10,000 / 30-day baseline state.

---

## ♿ Accessibility Implementation (Verified In-Code)

RupeeFlow incorporates keyboard accessibility and assistive technology support across views:

1. **Explicit Form Label Associations**:
   - Every input, select, and textarea across [`TransactionModal.tsx`](src/components/transactions/TransactionModal.tsx), [`GoalModal.tsx`](src/components/savings/GoalModal.tsx), [`CommitmentModal.tsx`](src/components/commitments/CommitmentModal.tsx), [`ContributeModal.tsx`](src/components/savings/ContributeModal.tsx), and [`DecisionLabView.tsx`](src/components/decisionLab/DecisionLabView.tsx) connects via matching `id` and `htmlFor` attributes.
2. **Accessible Names on Unlabeled Controls**:
   - Transaction Search: `aria-label="Search transactions, notes, or merchants"`.
   - Sort Selector: `aria-label="Sort transactions by"`.
   - 30-Day Timeline Scrubber: `aria-label="Simulation day in 30-day budget period"` with ARIA range values (`aria-valuemin="1"`, `aria-valuemax="30"`, `aria-valuenow`).
   - Goal Color Picker Buttons: `aria-label="Select color: ..."` with `aria-pressed`.
3. **Modal Dialog Focus Management**:
   - Implemented in [`src/components/common/Modal.tsx`](src/components/common/Modal.tsx):
     - `role="dialog"` with `aria-modal="true"`.
     - Automatically shifts focus to the first focusable control upon opening.
     - **Keyboard Focus Trap**: Keeps `Tab` and `Shift+Tab` navigation inside the modal while open.
     - **Escape Key Listener**: Closes modal immediately upon `Escape` press.
     - **Focus Restoration**: Automatically restores focus to the triggering element upon closure.
4. **Interactive Cards & Custom Controls**:
   - Metric cards and compact health score gauges implement `role="button"`, `tabIndex={0}`, Enter/Space key listeners, and visible focus rings.

---

## 🚀 Installation, Quality Assurance & Build Commands

Verified commands from [`package.json`](package.json):

```bash
# 1. Clone the repository
git clone https://github.com/MohammadNajreAlam786/rupeeflow.git
cd rupeeflow

# 2. Install dependencies (zero-backend, lightweight)
npm install

# 3. Launch local Vite development server
npm run dev

# 4. Run Oxlint code quality and lint check
npm run lint

# 5. Type-check TypeScript and build production bundle
npm run build

# 6. Preview production build locally
npm run preview
```

### Production Build & Code-Splitting Performance

RupeeFlow code-splits secondary views with `React.lazy()` and `Suspense` in [`src/App.tsx`](src/App.tsx), wrapped with an [`ErrorBoundary`](src/components/common/ErrorBoundary.tsx):

- **Initial Load**: Only downloads the core application shell and `DashboardView` (~95 KB gzipped JS).
- **On-Demand Chunks**: `InsightsView` (including Recharts, ~113 KB gzipped) and secondary views are fetched only when their respective tabs are activated.

---

## ⏱️ 3-Minute Hackathon Judge Walkthrough

A structured guide to verify RupeeFlow's core features in under three minutes:

```
[1. Command Center] ──► [2. Time Travel] ──► [3. Decision Lab] ──► [4. Settle Bill] ──► [5. Confetti Milestone]
  Inspect Escrow          Scrub Days 12→20     Simulate Concert        Verify Zero          Deposit ₹1,200 into
  Safe-to-Spend           Observe Allowance    Review Net Deltas       Double-Deduction     Emergency Fund
```

1. **Step 1: Inspect the Escrow Cushion Protocol (Command Center)**
   - Open the Dashboard.
   - Observe that **Liquid Available Cash** and **Safe-to-Spend Pool** are distinct.
   - Note that upcoming bills are already reserved, safeguarding funds from accidental overspending.
2. **Step 2: Time-Travel Across the 30-Day Cycle (Left Sidebar)**
   - Locate the **"Cycle Timeline"** slider in the sidebar (defaults to Day 12).
   - Drag the slider from **Day 12** forward to **Day 20**.
   - Watch the **Daily Discretionary Allowance** dynamically recalibrate as remaining days decrease.
3. **Step 3: Simulate Before Spending (Decision Lab)**
   - Click the **"Decision Lab"** tab.
   - Click the quick preset chip **"Concert Ticket (₹1,500)"**.
   - Review the Before-and-After matrix: daily allowance tightens, but upcoming bills remain 100% reserved.
   - Change the amount to ₹7,000: observe the **Critical Alert** banner calculating the exact bill shortfall.
   - Click **Cancel / Revert**: observe the sandbox reset without altering ledger data.
4. **Step 4: Cancel an Unused Subscription (Decision Lab)**
   - Under Decision Category, click **"Cancel Subscription"**.
   - Select **"Campus Fitness / Gym Pass Share (₹800)"**.
   - Notice the amount auto-synchronizes to ₹800.
   - Click **Commit Decision**: observe the subscription marked cancelled and safe-to-spend immediately expanded.
5. **Step 5: Settle a Bill Without Double-Deduction (Commitments)**
   - Navigate to the **"Commitments"** view.
   - Click **"Pay"** on Hostel WiFi (₹350).
   - Notice the status updates to **Paid** and a ledger transaction is created without double-deducting from safe-to-spend.
6. **Step 6: Hit a Savings Milestone with Confetti & Audit Math**
   - Navigate to **"Savings Goals"**.
   - Click **Transfer Funds** on Emergency Raincheck Fund and deposit ₹1,200.
   - Watch the confetti animation celebrate reaching 100% completion!
   - Open the **Audit Math** modal from the Health Score gauge to inspect the deterministic scoring breakdown.
7. **Step 7: Reset Anytime**
   - Click **"Reset Demo Data"** at the bottom of the sidebar to return to the baseline state.

---

## 🌐 Deployment & Client-Side Storage Architecture

- **Production Deployment**: Configured for static hosting platforms (such as Vercel) via [`vercel.json`](vercel.json) rewrites (`/(.*) -> /index.html`) supporting SPA client-side routing.
- **Client-Side Storage Isolation**: Data is stored locally in the user's browser `localStorage`. Clearing browser data or switching devices starts a fresh session with the default seed data.
- **Browser Requirements**: Compatible with modern evergreen web browsers (Chrome, Edge, Firefox, Safari) supporting ES2022+ and CSS Grid/Flexbox.

---

## 📄 License

MIT License © 2026 Mohammad Najre Alam. All rights reserved.
