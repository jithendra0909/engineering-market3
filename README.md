# Engineering Market

Engineering Market is a premium, Apple-inspired full-stack student marketplace website where engineering students can buy, sell, and donate items.

This application is built as a complete peer-to-peer campus solution, enabling students to find textbooks, lab equipment, hoodies, calculators, and stationery within their own college or from verified students across other institutions.

---

## Technical Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router Dom
- **HTTP Client**: Axios (with auto-JWT interceptors)
- **Iconography**: Lucide React
- **Animations**: CSS transitions & smooth SaaS typography

### Backend
- **Platform**: Node.js & Express
- **Database**: MongoDB (via Mongoose)
- **Media Upload**: Multer & Cloudinary (with automatic local storage fallback for development)
- **Security**: JWT (JSON Web Tokens), bcryptjs (password hashing)
- **Autoseeder**: Populates the database with initial college and listings on startup

---

## Features

- **Double Layout Experience**:
  - **Desktop**: Rich navigation headers, layout grids, newsletters, trust sections.
  - **Mobile**: Mobile-first optimized layouts matching mobile mockups, floating bottom navigation, active item highlight.
- **Auto-sliding Banner Carousel**: Drag and swipe support, manual chevron controls, sliding pagination dots.
- **Double Marketplaces**:
  - **College Market**: Listings visible only to students sharing the same college.
  - **General Market**: Listings visible to all logged-in students.
- **Permissions Control**:
  - Unverified students can view the site, browse listings, and see college items.
  - Unverified students **cannot** post listings, contact sellers, donate items, or request purchases. Restricted actions display a `"You are not verified"` warning.
  - Verified students can post, sell, donate, and contact sellers.
- **WhatsApp Integration**: Contacting or buying items redirects verified students to WhatsApp with a prefilled message `"Is it available?"` to the seller's verified number.
- **Unified Admin Portal**:
  - Admin login dashboard.
  - Inspect student registration files and ID card front images.
  - Approve or Reject student accounts.
  - Remove/delete listings.
  - View students by status (Pending, Approved, Rejected).

---

## Setup & Running Locally

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Optional. If not running locally on port 27017, the server automatically starts an **in-memory MongoDB database** using `mongodb-memory-server` and pre-seeds it!).

### 2. Environment Variables Configuration
Go to the `server/` directory, copy the example variables file, and check details:
```bash
cd server
cp .env.example .env
```
Inside `server/.env`:
- Set `NODE_ENV=development` to enable the local storage fallback.
- If you have a Cloudinary account, paste your `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- If credentials are left empty, the server automatically saves uploaded student ID cards and listings locally under `server/public/uploads/` and serves them statically.

### 3. Installation
From the root project directory, install all client and server dependencies:
```bash
npm run install-all
```

### 4. Running the Application
To run the client and server concurrently, execute the dev command in the root folder:
```bash
npm run dev
```
- **Frontend** will be hosted at: [http://localhost:5173](http://localhost:5173)
- **Backend API** will be hosted at: [http://localhost:5000](http://localhost:5000)

---

## Seed Data Accounts

The database is automatically pre-seeded with these accounts for easy evaluation:

### 1. System Administrator
- **Email**: `admin@vignan.edu.in`
- **Password**: `admin123`
- **Role**: `admin`
- **Access**: Admin Dashboard (approve/reject students, remove listings)

### 2. Verified Student (Arjun Sharma)
- **Email**: `arjun.sharma@vignan.edu.in`
- **Password**: `password123`
- **Role**: `student`
- **Verification Status**: `approved` (Verified)
- **Access**: Buy, Sell, Donate, Contact via WhatsApp. (Owner of the 4 trending listings).

### 3. Pending Student (Pavan Kumar)
- **Email**: `pavan.kumar@vignan.edu.in`
- **Password**: `password123`
- **Role**: `student`
- **Verification Status**: `pending` (Unverified)
- **Access**: View listings, but cannot sell, donate, or contact sellers (shows `"You are not verified"`).
