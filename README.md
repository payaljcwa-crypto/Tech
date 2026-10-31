# Sub-Regional Profit & Loss (P&L) Dashboard HTML Tool

An enterprise-grade, interactive financial dashboard for capturing Region-wise and WK-wise financial data, auditing performance on a Gross Margin EBITDA basis, and generating a structured 3-sheet Excel workbook.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![License](https://img.shields.io/badge/License-Apache--2.0-blue)
![Export](https://img.shields.io/badge/Excel-3--Sheet%20Formatted-green)

---

## 🌟 Key Features

1. **Structured Data-Entry Module (13 Core Fields)**
   - **Reporting Region**: Sub-Regional territory mapping (North America, EMEA, APAC, LATAM, or custom).
   - **WK & WK Name**: Unique workstream codes and descriptive business unit titles.
   - **Business Classification**: GAD vs Non-GAD tracking with regional share distribution.
   - **Bid Type**: RFP, Sole Source, Framework Agreement, Time & Material, Fixed Price, and Renewal.
   - **P&L Category**: Revenue, Gross Margin, SG&A, Direct Cost, Operating Expense, Other Income/Cost.
   - **Financials**: Monthly Revenue, Gross Margin (GM), SG&A, Quarterly Revenue, Quarterly EBITDA, Full-Year (FY) Revenue, and Full-Year (FY) EBITDA.
   - **Operations**: Add new, edit, duplicate, single/batch delete, and local persistence.

2. **Dual Currency & Numbering System**
   - **Indian Format**: Indian grouping (`12,34,567.89`) with scaling in Lakhs (`L`) and Crores (`Cr`).
   - **International Format**: Standard Western grouping (`1,234,567.89`) with scaling in Thousands (`K`) and Millions (`M`).
   - **Currency Support**: INR (₹), USD ($), EUR (€), GBP (£), or unformatted raw numbers.
   - **Flexible Input Parser**: Accepts numbers with commas, currency prefixes, accounting negative parentheses `(1,000.00)`, and shorthand suffixes (`2.5M`, `25L`, `1.2Cr`).

3. **Financial Calculation & Governance Rules**
   - **EBITDA Reporting Basis**: Anchored strictly on **Gross Margin (GM)** as the primary gross operational baseline.
   - **SG&A Captured Separately**: Recorded independently to prevent distortion of direct delivery gross margins.
   - **Manual Period Reporting**: Quarterly and FY metrics are independently maintained without automated annualization or overwriting of keyed inputs.
   - **Validation & Audit Center**: Live inspection flagging missing figures, inverted margins, and monthly-to-quarterly divergence notifications.

4. **Structured 3-Sheet Excel Workbook Export**
   Downloads a `.xlsx` workbook containing **exactly three sheets**:
   - **Sheet 1: WK-wise P&L** (Columns A through J in exact sequence):
     - `A`: Reporting Region
     - `B`: WK
     - `C`: WK Name
     - `D`: GAD/Non GAD
     - `E`: Bid Type
     - `F`: PL Category
     - `G`: Quarterly Revenue
     - `H`: Quarterly EBITDA
     - `I`: FY Revenue
     - `J`: FY EBITDA
   - **Sheet 2: Region-wise Summary P&L** (Sub-regional roll-up with GAD split, recorded GM, SG&A expense, Quarterly EBITDA %, and FY totals).
   - **Sheet 3: Category & Performance Master** (Matrix cross-referencing P&L Category and Bid Type with Gross Margin basis and FY profitability margins).

5. **Bulk Upload Module**
   - Ingests `.xlsx`, `.xls`, and `.csv` workbooks via drag-and-drop.
   - Fuzzy header recognition maps variations like `WK Code`, `Sub-Region`, `GM`, `SG&A`, `Quarterly Rev`.
   - Offers Append or Replace modes with row preview before commit.
   - Includes a downloadable Excel template.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start local development server (port 3000)
npm run dev

# 3. Build for production (output in /dist)
npm run build
```

---

## 📤 How to Push this Repository to GitHub

### Option A: Using the GitHub CLI (`gh`)
```bash
# Login to GitHub (if not already logged in)
gh auth login

# Create a new repository and push current branch
gh repo create sub-regional-pnl-dashboard --public --source=. --remote=origin --push
```

### Option B: Using Standard Git Commands
1. Go to [GitHub.com/new](https://github.com/new) and create a new repository named `sub-regional-pnl-dashboard`.
2. Run the following commands in your terminal:

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/sub-regional-pnl-dashboard.git

# Set branch name to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

---

## 🌐 Deploy to GitHub Pages (Free Web Hosting)

This repository includes a pre-configured GitHub Actions workflow in `.github/workflows/deploy.yml`.

To enable automatic deployment:
1. Push this repository to GitHub.
2. In your repository on GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Every push to the `main` branch will automatically build and host the live dashboard at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/sub-regional-pnl-dashboard/`

---

## 📄 License

Apache License 2.0.
