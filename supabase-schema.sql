-- =============================================
-- BHATI JATHA PORTAL - Database Schema
-- RSSB Loni Centre
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: sewadars (from LONI DATA sheet)
-- =============================================
CREATE TABLE IF NOT EXISTS sewadars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  badge_id VARCHAR(50) UNIQUE NOT NULL,
  sewadar_name VARCHAR(200) NOT NULL,
  father_husband_name VARCHAR(200),
  dob VARCHAR(50),
  gender VARCHAR(10),
  blood_group VARCHAR(10),
  badge_status VARCHAR(30),
  aadhar_number VARCHAR(20),
  department VARCHAR(100),
  address TEXT,
  contact_no VARCHAR(15),
  emergency_contact VARCHAR(15),
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vehicle_entries (MASTERFILE format)
-- =============================================
CREATE TABLE IF NOT EXISTS vehicle_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  srs_id VARCHAR(100),
  satsang_place VARCHAR(200),
  area VARCHAR(100),
  jathedar_name VARCHAR(200) NOT NULL,
  driver_name VARCHAR(200),
  vehicle_type VARCHAR(100),
  vehicle_no VARCHAR(50),
  place_of_sewa VARCHAR(200) NOT NULL,
  bhati_type VARCHAR(100),
  from_date VARCHAR(50) NOT NULL,
  to_date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vehicle_entry_members
-- =============================================
CREATE TABLE IF NOT EXISTS vehicle_entry_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES vehicle_entries(id) ON DELETE CASCADE,
  sr_no INTEGER NOT NULL,
  badge_id VARCHAR(50),
  sewadar_name VARCHAR(200) NOT NULL,
  father_husband_name VARCHAR(200),
  gender VARCHAR(10),
  age INTEGER,
  aadhar_number VARCHAR(20),
  address TEXT,
  mobile_no VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sewadars_badge_id ON sewadars(badge_id);
CREATE INDEX IF NOT EXISTS idx_sewadars_name ON sewadars(sewadar_name);
CREATE INDEX IF NOT EXISTS idx_vehicle_entries_created ON vehicle_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_entry_members_entry ON vehicle_entry_members(entry_id);

-- RLS (open for internal use)
ALTER TABLE sewadars ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_entry_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on sewadars" ON sewadars FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vehicle_entries" ON vehicle_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vehicle_entry_members" ON vehicle_entry_members FOR ALL USING (true) WITH CHECK (true);
