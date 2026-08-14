// Sewadar record from LONI DATA sheet
export interface Sewadar {
  id?: string;
  badge_id: string;           // e.g., GB5156GA0011
  sewadar_name: string;       // e.g., DEEPAK KUMAR
  father_husband_name: string;// e.g., MAHENDRA SINGH
  dob: string;                // Age or DOB
  gender: string;             // MALE / FEMALE
  blood_group: string;        // O+, B+, A+, etc.
  badge_status: string;       // PERMANENT, OPEN, CANCELLED, ELDERLY, VSS
  aadhar_number: string;      // XXXXXXXX6555 (masked)
  department: string;         // MAINTENANCE, PANDAL, TRAFFIC, etc.
  address: string;            // Full address
  contact_no: string;         // Primary mobile
  emergency_contact: string;  // Emergency contact
  age: number;                // Numeric age
  created_at?: string;
  updated_at?: string;
}

// Vehicle Entry form (MASTERFILE format)
export interface VehicleEntry {
  id?: string;
  srs_id: string;             // e.g., GZB/UP/175/006/2026814/1
  satsang_place: string;      // e.g., LONI CENTRE
  area: string;               // e.g., GHAZIABAD
  jathedar_name: string;      // e.g., DEEPAK KUMAR
  driver_name: string;        // Name of Driver
  vehicle_type: string;       // BUS, TEMPO, etc.
  vehicle_no: string;         // Vehicle number
  place_of_sewa: string;      // e.g., MORADABAD
  bhati_type: string;         // e.g., FABRICATION
  from_date: string;          // e.g., 15.08.2026
  to_date: string;            // e.g., 17.08.2026
  created_at?: string;
  updated_at?: string;
}

// Vehicle Entry Members
export interface VehicleEntryMember {
  id?: string;
  entry_id: string;
  sr_no: number;
  badge_id: string;
  sewadar_name: string;
  father_husband_name: string;
  gender: string;
  age: number | null;
  aadhar_number: string;
  address: string;
  mobile_no: string;
}

// Form state for the vehicle entry page
export interface VehicleFormState {
  srs_id: string;
  satsang_place: string;
  area: string;
  jathedar_name: string;
  driver_name: string;
  vehicle_type: string;
  vehicle_no: string;
  place_of_sewa: string;
  bhati_type: string;
  from_date: string;
  to_date: string;
  members: MemberRow[];
}

export interface MemberRow {
  sr_no: number;
  badge_id: string;
  sewadar_name: string;
  father_husband_name: string;
  gender: string;
  age: string;
  aadhar_number: string;
  address: string;
  mobile_no: string;
  loading?: boolean;
}
