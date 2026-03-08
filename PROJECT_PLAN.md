# Aradhya Seed Store — Project Plan

> Business requirements extracted from the handwritten layout, plus recommended **free** web and mobile technologies for development and deployment.

---

## 1. Business & Domain Information

### Store Details

| Field | Value |
|-------|-------|
| **Business Name** | ARADHYA SEED STORE |
| **Location** | Chhatter, India |
| **Mobile** | 70180 63629 |

### Purpose of the Application

Digitize two paper registers used daily at the store:

1. **Stock / Inventory Register** — track seed products currently in stock
2. **Customer Sales / Billing Register** — record sales, payments, and outstanding balance

---

## 2. Data Fields (from Handwritten Layout)

### 2.1 Stock Register (Inventory)

Used to track seeds in stock. Each row represents one product (or one batch).

| Column | Description | Notes |
|--------|-------------|-------|
| **Sr. No.** | Serial number | Auto-generated row number |
| **Product Name** | Name of the seed product | e.g. Wheat, Mustard, etc. |
| **HSN Code** | Harmonized System of Nomenclature code | Required for GST invoicing in India |
| **Quantity** | Amount in stock | Units: **Liters (Ltr.)** or **Kilograms (Kg.)** |
| **Manufacturing Date** | Date product was manufactured | Track batch freshness |
| **Expiry Date (Exp. Date)** | Product expiry date | Important for seed quality & compliance |

### 2.2 Customer Sales / Billing Register

Used when selling to customers. Header + line items + payment summary.

#### Customer Header

| Field | Description |
|-------|-------------|
| **Customer Name & Address** | Buyer details for invoice and records |

#### Line Items (per product sold)

| Column | Description | Notes |
|--------|-------------|-------|
| **Sr. No. / Date** | Entry number and transaction date | One invoice per sale |
| **Product Name** | Seed product sold | Linked to stock |
| **HSN Code** | Tax classification code | Same as on product |
| **Quantity** | Amount sold | Ltr. or Kg. |
| **Rate** | Price per unit | ₹ per Kg or Ltr. |
| **Amount** | Line total | Quantity × Rate |

#### Payment Summary (bottom of invoice)

| Field | Description | Formula |
|-------|-------------|---------|
| **Total Amount** | Sum of all line amounts | Sum of Amount column |
| **Received Amount** | Cash/payment received from customer | Partial or full payment |
| **Balance Amount** | Outstanding amount owed | Total Amount − Received Amount |

---

## 3. Functional Requirements (Derived)

| Module | Features |
|--------|----------|
| **Products & Stock** | Add/edit products, HSN, unit (Kg/Ltr), MFG & expiry dates, current quantity |
| **Sales / Invoices** | Create bill with customer info, line items, auto-calculate totals |
| **Customers** | Store name, address, phone; track pending balance |
| **Stock Deduction** | Reduce stock automatically when a sale is saved |
| **Reports** | Stock list, sales by date, customers with outstanding balance, expiring stock |
| **Print / Share** | Printable invoice (A4 or thermal); optional WhatsApp share |

### Indian Market Considerations

- **HSN codes** on products and invoices (GST compliance)
- **Units:** Kilograms and Liters only
- **Credit sales:** Balance Amount implies simple accounts-receivable tracking
- **Optional later:** GST %, Hindi UI, UPI payment reference on invoice

---

## 4. Recommended Database Schema (Reference)

```
products          → id, name, hsn_code, unit, stock_qty, mfg_date, exp_date
customers         → id, name, address, phone
sales             → id, customer_id, date, total, received, balance
sale_items        → sale_id, product_id, quantity, rate, amount, hsn_code
stock_movements   → product_id, type (in/out), quantity, reference (optional)
```

---

## 5. Technology Recommendations (Free Development & Deployment)

### 5.1 Strategy: One Codebase for Web + Mobile

Build a **responsive web application** that:

- Runs in any browser on desktop, tablet, and phone
- Can be **installed on Android/iPhone** like an app (PWA — Progressive Web App)
- Uses one backend and one database (no duplicate work)

```
┌──────────────────────────────────────┐
│  Browser (Web)  +  Phone (PWA)       │
└─────────────────┬────────────────────┘
                  │
         ┌────────▼────────┐
         │  Backend / API   │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  PostgreSQL DB   │
         └─────────────────┘
```

---

### 5.2 Recommended Stack (Best Balance)

| Layer | Technology | Why | Cost |
|-------|------------|-----|------|
| **Frontend** | [Next.js](https://nextjs.org/) (React) | Modern, fast, good for forms & tables | Free (MIT) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Quick, clean UI | Free |
| **Backend + DB** | [Supabase](https://supabase.com/) | PostgreSQL, auth, APIs, real-time | Free tier |
| **Hosting (Web)** | [Vercel](https://vercel.com/) | Deploy Next.js in one click | Free tier |
| **Mobile** | PWA (Add to Home Screen) | No Play Store fee needed initially | Free |
| **Invoices** | jsPDF or `@react-pdf/renderer` | Generate PDF bills | Free |
| **Version Control** | [GitHub](https://github.com/) | Store code, backups | Free |

**Total monthly cost for MVP:** **₹0** (within free tiers)

---

### 5.3 Alternative Free Stacks

| Approach | Stack | Best For |
|----------|-------|----------|
| **Simpler web** | HTML + CSS + JavaScript + Supabase | Minimal learning curve |
| **Python backend** | FastAPI or Django + SQLite/PostgreSQL on [Render](https://render.com/) | If you prefer Python |
| **Firebase** | React + Firebase (Firestore) | Quick start; less ideal for invoice relations |
| **Native mobile later** | [Capacitor](https://capacitorjs.com/) wrapping the web app | Free `.apk` build when you need a store app |

---

### 5.4 Free Hosting & Deployment Options

| Service | Use Case | Free Tier Highlights |
|---------|----------|----------------------|
| **Vercel** | Host Next.js / React frontend | Generous bandwidth, auto HTTPS |
| **Netlify** | Alternative frontend host | Similar to Vercel |
| **Supabase** | Database + authentication + storage | 500 MB DB, 50K monthly active users |
| **Render** | Host Node/Python API if not using Supabase-only | 750 hrs/month (with limits) |
| **Railway** | Alternative backend host | Limited free credits |
| **Cloudflare Pages** | Static site / frontend | Unlimited bandwidth on free plan |

**Recommended deployment path:** Next.js on **Vercel** + database on **Supabase** = no server management, ₹0 to start.

---

### 5.5 Free Domain Options

A custom domain (e.g. `aradhyaseedstore.in`) usually costs ₹500–800/year. These options are **fully free**:

| Option | Example URL | Notes |
|--------|-------------|-------|
| **Vercel subdomain** | `aradhya-seed-store.vercel.app` | Instant, HTTPS, good for MVP |
| **Netlify subdomain** | `aradhya-seed-store.netlify.app` | Same idea |
| **GitHub Pages** | `username.github.io/aradhya-seed-store` | Free; static sites only |
| **Cloudflare Pages** | `aradhya-seed-store.pages.dev` | Free subdomain + CDN |
| **Supabase project URL** | For API only, not public marketing site | Backend use |

**Tip:** Start with `*.vercel.app` or `*.pages.dev`. Buy a `.in` domain later when the business wants a professional URL (~₹99–800/year on promotions).

---

### 5.6 Mobile App Options (Free)

| Method | Cost | Description |
|--------|------|-------------|
| **PWA (recommended first)** | ₹0 | User opens site in Chrome → “Add to Home Screen” → icon on phone |
| **Capacitor wrapper** | ₹0 dev | Same web app packaged as Android `.apk` for sideload or Play Store |
| **React Native / Flutter** | ₹0 dev tools | Separate native app; more work; Play Store ₹1,750 one-time fee to publish |

For a seed store in a town like Chhatter, **PWA is sufficient** for daily billing and stock entry on mobile.

---

## 6. Development Tools (All Free)

| Tool | Purpose |
|------|---------|
| [VS Code](https://code.visualstudio.com/) or Cursor | Code editor |
| [Node.js LTS](https://nodejs.org/) | Run Next.js locally |
| [Git](https://git-scm.com/) | Version control |
| [Chrome DevTools](https://developer.chrome.com/docs/devtools/) | Debug UI; test mobile layout |
| [Figma](https://figma.com/) (free tier) | Optional wireframes |

---

## 7. Cost Summary

| Item | Cost |
|------|------|
| Development tools | **Free** |
| Hosting (Vercel + Supabase) | **Free** (free tiers) |
| Web URL (subdomain) | **Free** (`*.vercel.app`) |
| SSL / HTTPS | **Free** (included on Vercel/Netlify) |
| PWA mobile install | **Free** |
| Custom domain (optional) | ~₹500–800/year |
| Google Play listing (optional) | ₹1,750 one-time |

**Minimum to launch:** **₹0**

---

## 8. Suggested Build Phases

### Phase 1 — Core MVP
- Product & stock CRUD (matches stock register columns)
- Create sale with customer, line items, total / received / balance
- Auto deduct stock on sale
- Owner login (Supabase Auth)

### Phase 2 — Daily Use
- Customer list and outstanding balance report
- Invoice PDF + print
- Low stock and expiry alerts
- Search and filter products

### Phase 3 — Mobile & Growth
- PWA offline support (weak network areas)
- Optional Android `.apk` via Capacitor
- Hindi labels (optional)
- GST % on invoice (if required)

---

## 9. Screen Layout (Mirror Paper Registers)

### Stock Screen
`Sr | Product Name | HSN | Qty | Unit | MFG Date | Exp Date | Edit`

### New Sale Screen
- **Top:** Customer name & address  
- **Middle:** Line items — Product | HSN | Qty | Rate | Amount  
- **Bottom:** Total Amount | Received Amount | Balance Amount  
- **Actions:** Save | Print | Share

### Dashboard (optional)
- Today’s sales total  
- Products expiring soon  
- Total pending customer balance  

---

## 10. Final Recommendation

| Choice | Recommendation |
|--------|----------------|
| **Web framework** | Next.js 14+ with App Router |
| **Database & auth** | Supabase (PostgreSQL) |
| **CSS** | Tailwind CSS |
| **Hosting** | Vercel |
| **Free URL** | `aradhya-seed-store.vercel.app` (or similar) |
| **Mobile** | PWA first; Capacitor later if needed |
| **Learning order** | HTML/CSS → JavaScript → React → Supabase |

This stack keeps development and deployment **free**, scales with the business, and matches every field on the handwritten register.

---

*Document created for Aradhya Seed Store, Chhatter — based on provided business layout.*
