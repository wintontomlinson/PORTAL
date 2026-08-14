-- =============================================
-- Bhati Jatha Management System - Database Schema
-- Radha Soami Satsang Beas – Loni Centre
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: sewadars
-- Stores all sewadar/sewadarni records
-- =============================================
CREATE TABLE IF NOT EXISTS sewadars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  badge_id VARCHAR(50) UNIQUE NOT NULL,
  srs_id VARCHAR(50) UNIQUE,
  name VARCHAR(200) NOT NULL,
  father_husband_name VARCHAR(200),
  gender VARCHAR(10) CHECK (gender IN ('M', 'F', 'Other')),
  age INTEGER CHECK (age > 0 AND age < 150),
  aadhar_no VARCHAR(12),
  address TEXT,
  mobile_no VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vehicle_entries
-- Stores vehicle entry form header data
-- =============================================
CREATE TABLE IF NOT EXISTS vehicle_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  jathedar_name VARCHAR(200) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  place_of_sewa VARCHAR(300) NOT NULL,
  driver_name VARCHAR(200) NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Table: vehicle_entry_members
-- Stores sewadar members for each vehicle entry
-- =============================================
CREATE TABLE IF NOT EXISTS vehicle_entry_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES vehicle_entries(id) ON DELETE CASCADE,
  sr_no INTEGER NOT NULL,
  badge_id VARCHAR(50),
  srs_id VARCHAR(50),
  name VARCHAR(200) NOT NULL,
  father_husband_name VARCHAR(200),
  gender VARCHAR(10),
  age INTEGER,
  aadhar_no VARCHAR(12),
  address TEXT,
  mobile_no VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes for fast lookups
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sewadars_badge_id ON sewadars(badge_id);
CREATE INDEX IF NOT EXISTS idx_sewadars_srs_id ON sewadars(srs_id);
CREATE INDEX IF NOT EXISTS idx_sewadars_name ON sewadars(name);
CREATE INDEX IF NOT EXISTS idx_vehicle_entries_created_at ON vehicle_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_entry_members_entry_id ON vehicle_entry_members(entry_id);

-- =============================================
-- Row Level Security (RLS) - Disabled for internal use
-- =============================================
ALTER TABLE sewadars ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_entry_members ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon users (internal app)
CREATE POLICY "Allow all operations on sewadars" ON sewadars
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on vehicle_entries" ON vehicle_entries
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on vehicle_entry_members" ON vehicle_entry_members
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Function to update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_sewadars_updated_at
  BEFORE UPDATE ON sewadars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_entries_updated_at
  BEFORE UPDATE ON vehicle_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
