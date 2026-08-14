export interface Database {
  public: {
    Tables: {
      sewadars: {
        Row: Sewadar;
        Insert: SewadarInsert;
        Update: SewadarUpdate;
      };
      vehicle_entries: {
        Row: VehicleEntry;
        Insert: VehicleEntryInsert;
        Update: VehicleEntryUpdate;
      };
      vehicle_entry_members: {
        Row: VehicleEntryMember;
        Insert: VehicleEntryMemberInsert;
        Update: VehicleEntryMemberUpdate;
      };
    };
  };
}

export interface Sewadar {
  id: string;
  badge_id: string;
  srs_id: string | null;
  name: string;
  father_husband_name: string | null;
  gender: string | null;
  age: number | null;
  aadhar_no: string | null;
  address: string | null;
  mobile_no: string | null;
  created_at: string;
  updated_at: string;
}

export interface SewadarInsert {
  id?: string;
  badge_id: string;
  srs_id?: string | null;
  name: string;
  father_husband_name?: string | null;
  gender?: string | null;
  age?: number | null;
  aadhar_no?: string | null;
  address?: string | null;
  mobile_no?: string | null;
}

export interface SewadarUpdate {
  badge_id?: string;
  srs_id?: string | null;
  name?: string;
  father_husband_name?: string | null;
  gender?: string | null;
  age?: number | null;
  aadhar_no?: string | null;
  address?: string | null;
  mobile_no?: string | null;
}

export interface VehicleEntry {
  id: string;
  jathedar_name: string;
  vehicle_type: string;
  place_of_sewa: string;
  driver_name: string;
  vehicle_number: string;
  from_date: string;
  to_date: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleEntryInsert {
  id?: string;
  jathedar_name: string;
  vehicle_type: string;
  place_of_sewa: string;
  driver_name: string;
  vehicle_number: string;
  from_date: string;
  to_date: string;
}

export interface VehicleEntryUpdate {
  jathedar_name?: string;
  vehicle_type?: string;
  place_of_sewa?: string;
  driver_name?: string;
  vehicle_number?: string;
  from_date?: string;
  to_date?: string;
}

export interface VehicleEntryMember {
  id: string;
  entry_id: string;
  sr_no: number;
  badge_id: string | null;
  srs_id: string | null;
  name: string;
  father_husband_name: string | null;
  gender: string | null;
  age: number | null;
  aadhar_no: string | null;
  address: string | null;
  mobile_no: string | null;
  created_at: string;
}

export interface VehicleEntryMemberInsert {
  id?: string;
  entry_id: string;
  sr_no: number;
  badge_id?: string | null;
  srs_id?: string | null;
  name: string;
  father_husband_name?: string | null;
  gender?: string | null;
  age?: number | null;
  aadhar_no?: string | null;
  address?: string | null;
  mobile_no?: string | null;
}

export interface VehicleEntryMemberUpdate {
  sr_no?: number;
  badge_id?: string | null;
  srs_id?: string | null;
  name?: string;
  father_husband_name?: string | null;
  gender?: string | null;
  age?: number | null;
  aadhar_no?: string | null;
  address?: string | null;
  mobile_no?: string | null;
}

// Form types used in the frontend
export interface VehicleFormData {
  jathedar_name: string;
  vehicle_type: string;
  place_of_sewa: string;
  driver_name: string;
  vehicle_number: string;
  from_date: string;
  to_date: string;
  members: MemberFormData[];
}

export interface MemberFormData {
  sr_no: number;
  badge_id: string;
  srs_id: string;
  name: string;
  father_husband_name: string;
  gender: string;
  age: string;
  aadhar_no: string;
  address: string;
  mobile_no: string;
}
