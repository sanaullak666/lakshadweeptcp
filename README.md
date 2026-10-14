# Lakshadweep Town & Country Planning Objections Portal (Draft Rules, 2026)

Production-ready web application for collecting public objections and suggestions to the **Draft Lakshadweep Town and Country Planning and Development Rules, 2026**, issued under Section 153(7) of the Lakshadweep Town and Country Planning and Development Regulation, 2026 (Regulation No. 8 of 2026).

---

## 🏛️ Core Architectural Principle: Single Submission = Three Separate Letters

**ONE USER FORM SUBMISSION = THREE SEPARATE FINAL OBJECTION LETTERS.**

The applicant enters their personal information **ONLY ONCE**. The application automatically generates, signs, and packages three distinct formal statutory letters:

1. **Objection Letter 1:**
   *Draft Lakshadweep Town and Country Planning and Development (Planning and Development Board) Rules, 2026* (F.No.16/1/2022-UD(Vol.1))
   - Includes verbatim legal objections on consultation defects, NCST & Panchayat non-consultation, Rules 3 & 4 term extensions, Rule 6 quorum bypass, Rule 7 Regional Plan timeline, and the full 9-row statutory amendment table.
   - Copy to: Administrator (Lakshadweep), Chairperson (District Panchayat), Chairperson (NCST), Secretary (MHA).

2. **Objection Letter 2:**
   *Draft Lakshadweep Town and Country Planning and Development (Chief Town Planner Qualifications) Rules, 2026* (F.No.16/1/2022-UD(Vol.1)(1))
   - Includes verbatim legal objections on Rule 3(b) being ultra vires Section 3, Articles 14, 16 and 320(3) violations, island/atoll ecological qualifications, local ST preference & Malayalam/Mahl proficiency, and the proposed replacement Rule 3 with UPSC consultation.
   - Copy to: Administrator, Chairperson (District Panchayat), Chairperson (NCST), Secretary (MHA), Secretary (UPSC).

3. **Objection Letter 3:**
   *Draft Lakshadweep Town and Country Planning and Development (Planning and Development Authority) Rules, 2026* (F.No.16/1/2022-UD(Vol.1)(3) dated 18.09.2026)
   - Includes 16 pages of comprehensive legal objections, all 31 numbered paragraphs, Section 21 & Section 153(2) statutory mandates, Table 1 (13 omitted protective rules), and Table 2 Annexure (21 rule-by-rule analysis rows).
   - Copy to: Administrator (Lakshadweep), Secretary (MHA), Secretary (MoHUA), Member of Parliament (Lakshadweep).

---

## 🔒 Immutability Guarantee

Once an objection is submitted:
- All generated letters and PDFs are **permanently frozen and immutable**.
- Subsequent template edits or activations in `/admin/templates` **NEVER** alter historical submissions.
- Old submissions always preserve the exact content, version, and PDF submitted by the applicant.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, TypeScript, Puppeteer-Core (A4 PDF engine with Edge/Chrome), Archiver (ZIP).
- **Database:** MySQL 8.0 (`lakshadweep_objections_db`) with transactions, foreign keys, and indexes.
- **Security:** Helmet, CORS, Express-Rate-Limit, Zod schema validation, bcrypt password hashing, JWT authentication, idempotency protection.

---

## 🚀 Running the Application

### 1. Database Setup (MySQL 8)
MySQL 8 service is configured on `127.0.0.1:3306`:
- Database: `lakshadweep_objections_db`
- Default Admin User: `admin`
- Default Admin Password: `Admin@2026!`

### 2. Backend Server
```bash
cd backend
npm install
npm run build
node dist/server.js
# Backend runs on: http://localhost:5000
```

### 3. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
# Frontend runs on: http://localhost:5173
```
