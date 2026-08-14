# Bhati Jatha Management System

## Radha Soami Satsang Beas – Loni Centre

A full-stack web application for **Bhati Jatha Vehicle Entry & Sewadar Management** that replaces the existing Excel-based workflow with an online portal.

---

## 🚀 Features

### Vehicle Entry Form
- Complete form with header fields (Jathedar, Vehicle Type, Place of Sewa, Driver, Vehicle Number, Dates)
- Dynamic sewadar table with add/remove rows
- **Auto-fill**: Enter Badge ID or SRS ID → system fetches all sewadar details automatically
- Save entry to database
- Print (browser print)
- Download PDF (A4 landscape, formatted like original Excel)
- Download Excel (with merged cells, borders, column widths matching original template)
- Clear form

### Admin Panel
- **Sewadar Management**: Add, Edit, Delete, Search (by Badge ID, SRS ID, name, mobile)
- **Vehicle Entries**: View all submitted forms, view details with members, delete entries
- **Bulk Import**: Upload Excel file to create/update sewadar records (auto-maps column names)
- **Bulk Export**: Download all sewadars as formatted Excel
- **PDF/Excel Downloads** from any saved entry

### Validation
- Aadhaar number: 12 digits, cannot start with 0 or 1
- Indian vehicle number format (e.g., DL01AB1234)
- Mobile number: 10 digits starting with 6-9
- Duplicate Badge ID check within a single vehicle entry
- Required field validation

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Supabase) |
| PDF Generation | jsPDF + jsPDF-AutoTable |
| Excel Generation | SheetJS (xlsx) |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## 📁 Project Structure

```
bhati-jatha-management/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── layout.tsx                  # Root layout with Navbar/Footer
│   │   ├── globals.css                 # Global styles
│   │   ├── vehicle-entry/
│   │   │   └── page.tsx                # Vehicle Entry Form
│   │   ├── admin/
│   │   │   ├── page.tsx                # Admin Dashboard
│   │   │   ├── sewadars/page.tsx       # Sewadar CRUD + Import/Export
│   │   │   └── entries/page.tsx        # Vehicle Entries Management
│   │   └── api/
│   │       ├── sewadars/
│   │       │   ├── route.ts            # GET (list), POST, PUT, DELETE
│   │       │   ├── lookup/route.ts     # GET by badge_id or srs_id
│   │       │   └── bulk-import/route.ts # POST (Excel upload)
│   │       └── vehicle-entries/
│   │           ├── route.ts            # GET (list), POST
│   │           └── [id]/route.ts       # GET, PUT, DELETE
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client
│   │   ├── validation.ts              # Form validation utilities
│   │   ├── pdfGenerator.ts            # PDF generation (jsPDF)
│   │   ├── excelGenerator.ts          # Excel generation (SheetJS)
│   │   └── styles.ts                  # Shared style constants
│   └── types/
│       └── database.ts                # TypeScript types & interfaces
├── supabase-schema.sql                # Database schema (run in Supabase)
├── .env.local                         # Environment variables
└── README.md
```

---

## 🗄️ Database Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** from Settings > API

### 2. Run the Schema

Open the **SQL Editor** in your Supabase dashboard and run the contents of `supabase-schema.sql`. This creates:

- `sewadars` table (Badge ID, SRS ID, Name, Father/Husband, Gender, Age, Aadhaar, Address, Mobile)
- `vehicle_entries` table (Jathedar, Vehicle Type, Place, Driver, Vehicle No, Dates)
- `vehicle_entry_members` table (linked to vehicle entries with CASCADE delete)
- Indexes for fast lookups
- RLS policies (open for internal use)
- Auto-update timestamps

### 3. Configure Environment

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📋 Usage Guide

### Creating a Vehicle Entry

1. Go to **Vehicle Entry** from navigation
2. Fill in header fields (Jathedar name, vehicle type, place, driver, vehicle number, dates)
3. In the sewadar table:
   - Enter **Badge ID** or **SRS ID** and click the search icon (🔍)
   - System will auto-fill all sewadar details
   - Add more rows with "Add Row" button
4. Click **Save Entry** to store in database
5. Click **Download PDF** or **Download Excel** to get formatted output
6. Click **Print** for browser printing

### Managing Sewadars

1. Go to **Admin > Sewadars**
2. **Add**: Click "Add Sewadar" button and fill the form
3. **Search**: Type in the search box (searches Badge ID, SRS ID, name, mobile)
4. **Edit**: Click pencil icon on any row
5. **Delete**: Click trash icon on any row
6. **Import**: Switch to "Bulk Import" tab, upload Excel file
7. **Export**: Switch to "Bulk Export" tab or click "Export" button

### Bulk Import Excel Format

The import accepts Excel files with these column names (flexible matching):
- Badge ID (required)
- Name (required)
- SRS ID, Father/Husband Name, M/F, Age, Aadhar No., Address, Mobile No.

---

## 📄 Output Format

### PDF Output
- A4 Landscape orientation
- Header: "RADHA SOAMI SATSANG BEAS - LONI CENTRE" + "BHATI JATHA - VEHICLE ENTRY FORM"
- Header fields displayed in rows
- Table with borders, alternating row colors, centered headers
- Matches original Excel layout

### Excel Output
- Merged title cells across all columns
- Header fields in labeled rows
- Table with proper column widths matching original
- Row heights configured
- Borders on all data cells
- Minimum 20 rows in table (empty rows padded)

---

## 🔒 Security Notes

- This is designed as an **internal office portal**
- RLS policies are set to allow all operations (suitable for internal networks)
- For public deployment, add authentication (Supabase Auth) and restrictive RLS policies
- Environment variables should never be committed to version control

---

## 📝 License

Internal use only – Radha Soami Satsang Beas, Loni Centre
