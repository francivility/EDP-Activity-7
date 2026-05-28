# Fernando's Fruits & Veggies 🥬🥕🍅
### Vegetable Store Management System

A modern, full‑stack inventory and point‑of‑sale system that I built from the ground up for my aunt's store in the plaza of SORSOGON, **Fernando's Fruits & Veggies**.  
This wasn’t just a one‑time code – it went through **countless revisions, bug fixes, UI improvements, and feature additions** to become the fully functional system it is today.

---

## 💪 The Development Journey

I started with a basic idea: a simple POS for a vegetable store.  
But as I tested and used it, I kept adding features and fixing things until it became a complete management tool.

**By May 22, the whole system was already built and fully functional.**  
Every core feature you see below – login, inventory management, point of sale with cash/GCash/card, sales history, Excel reports, user management, forgot password, and the entire UI – was in place and working.  
Since then, I have continued to refine it: I removed outdated code, rewrote entire sections, and replaced the old implementation with a cleaner, more robust, and fully updated version.  
The updates you see after May 22 are **enhancements, new features, and polish** – not missing pieces.

- **Over 10 major feature updates** were implemented over the course of May 2026.
- The system was **tested repeatedly**, and every bug found was squashed.
- The UI was redesigned multiple times to make it professional and user‑friendly.
- Payment simulation was completely rebuilt to mimic a real GCash transaction.
- Security was taken seriously – password hashing, JWT tokens, role‑based access.
- Every tiny detail – from the receipt layout to the date/time sync – was fine‑tuned.

**This project represents hours of dedication, debugging, and polishing.**  
It’s now a robust, production‑ready system that I can rely on for my business.

> **📢 Professor Review**  
> I am submitting this **latest version** to my professor for evaluation.  
> I welcome any feedback, suggestions, or areas where I can further improve the system – whether it’s in functionality, design, security, or user experience.

---

## 🚀 Features

### 🔐 Authentication & Security
- Secure login with encrypted passwords.
- Role‑based access – I (admin) have full control; staff can only sell and view.
- Forgot password flow – answer my security question to reset my password.
- Profile page – change password, update security question anytime.
- Logout confirmation popup – prevents accidental logouts.

### 📦 Inventory Management
- Add, edit, and delete products with image uploads.
- Organized categories: Vegetables, Fruits, Whole Grains, Dairy, Poultry.
- Multiple unit types (pcs, kg, g, L, mL, packs, bottles, trays, dozens).
- Low‑stock alerts – a red badge when stock drops below my set threshold.
- Grid and list views, with search and filter by category/supplier.
- Optional expiration date for each product.

### 🛒 Point of Sale (POS)
- Beautifully designed two‑panel interface – products on the left, cart on the right.
- Category tabs for quick filtering.
- Quantity controls directly in the cart (+ / – buttons).
- Cash, GCash, and Card payment methods.
- **GCash simulation** – a lifelike GCash payment screen with a confirm button, processing spinner, and auto‑generated unique reference number.
- **Receipt generation** – shows all items, total, payment method, and reference number. Printable.

### 📈 Sales & Payments
- Sales history with date/time, cashier, total, method, and status.
- I (admin) can change sale status (pending / completed / cancelled).
- Payment history table includes the unique reference number for GCash/Card payments.
- Automatic stock deduction on every sale.

### 📊 Reports
- Export three types of Excel reports: Sales, Inventory, and Payments.
- Each report includes:
  - Store logo and header
  - Date generated
  - Signature placeholders
  - Formatted tables
  - Charts on the second sheet (when Excel supports it)

### 👥 User Management (Admin Only)
- View all users in a table.
- Add new users with full credentials.
- Edit existing users – change name, username, role, password, security question.
- Delete users (cannot delete myself).
- Staff users cannot see or access the User Management page.

### 🧾 Unique Reference Numbers
- Every GCash or Card transaction generates a unique reference ID (e.g., `REF‑3F8A2C1B`).
- The reference appears on:
  - The payment success screen
  - The receipt (both on‑screen and printed)
  - The payment history table
  - The database (`payments` table)

---

## 🔧 Recent Updates & Revisions (May 2026)

> **Important:** The complete system was already built and submitted by **May 22**.  
> The updates listed below are **improvements, polish, and additional features** I added afterward.

| Update | Estimated Date |
|--------|----------------|
| Full system completed – all core features (login, inventory, POS, reports) | By May 22 |
| Added category & unit dropdowns, product images | Before May 22 |
| Date/time sync fix, Excel report improvements | Before May 22 |
| UI redesign – login page with typing effect, green color palette | Before May 22 |
| Inventory grid/list toggle, image preview/removal | Before May 22 |
| User management – admin can add, edit, delete users | Before May 22 |
| Forgot password flow – security question verification | Before May 22 |
| Staff permission enforcement – locked pages for non‑admins | May 22 |
| GCash simulation redesigned (realistic UI, loading spinner) | May 23 |
| Logout confirmation custom modal | May 24 |
| Reference numbers auto‑generated and stored | May 25 |
| Receipt display of reference numbers (frontend fix) | May 26 |
| Final bug fixes, polish, and complete system test | May 28 |

**Every one of these updates involved multiple code revisions, testing, and tweaks to get it right.**  
The result is a system that handles real‑world sales, inventory, and user management without errors.

---

## 🛠️ Tech Stack

| Layer      | Technology                           |
|------------|--------------------------------------|
| Frontend   | React, Tailwind CSS, Vite            |
| Backend    | Python, Flask, SQLAlchemy            |
| Database   | MySQL (XAMPP / MySQL Workbench)      |
| Auth       | JWT (JSON Web Tokens)                |
| Payments   | Built‑in simulation (no external API)|
| Reports    | openpyxl (Excel export)              |

---

## 📁 How to Run (for my future reference)

1. **Start MySQL** via XAMPP.
2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python db_init.py
   python app.py