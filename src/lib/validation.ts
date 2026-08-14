/**
 * Validates Aadhaar number (12 digits)
 */
export function validateAadhaar(aadhaar: string): { valid: boolean; message: string } {
  if (!aadhaar) return { valid: true, message: '' }; // Optional field
  
  const cleaned = aadhaar.replace(/\s/g, '');
  
  if (!/^\d{12}$/.test(cleaned)) {
    return { valid: false, message: 'Aadhaar number must be exactly 12 digits' };
  }
  
  // First digit cannot be 0 or 1
  if (cleaned[0] === '0' || cleaned[0] === '1') {
    return { valid: false, message: 'Aadhaar number cannot start with 0 or 1' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validates Indian vehicle registration number
 * Format: XX-00-XX-0000 or XX00XX0000 (with or without hyphens)
 */
export function validateVehicleNumber(vehicleNo: string): { valid: boolean; message: string } {
  if (!vehicleNo) return { valid: false, message: 'Vehicle number is required' };
  
  const cleaned = vehicleNo.replace(/[\s-]/g, '').toUpperCase();
  
  // Standard format: 2 letters (state) + 2 digits (district) + 1-2 letters (series) + 4 digits
  // Examples: DL01AB1234, UP14CD5678, HR26DK9876
  const pattern = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/;
  
  if (!pattern.test(cleaned)) {
    return { valid: false, message: 'Invalid vehicle number format (e.g., DL01AB1234)' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validates mobile number (10 digits, starts with 6-9)
 */
export function validateMobile(mobile: string): { valid: boolean; message: string } {
  if (!mobile) return { valid: true, message: '' }; // Optional field
  
  const cleaned = mobile.replace(/[\s+\-]/g, '');
  
  // Remove country code if present
  const number = cleaned.startsWith('91') && cleaned.length === 12 
    ? cleaned.substring(2) 
    : cleaned;
  
  if (!/^[6-9]\d{9}$/.test(number)) {
    return { valid: false, message: 'Mobile number must be 10 digits starting with 6-9' };
  }
  
  return { valid: true, message: '' };
}

/**
 * Checks for duplicate Badge IDs within member list
 */
export function checkDuplicateBadgeIds(badgeIds: string[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  
  for (const id of badgeIds) {
    if (id && id.trim()) {
      const trimmed = id.trim();
      if (seen.has(trimmed)) {
        duplicates.push(trimmed);
      } else {
        seen.add(trimmed);
      }
    }
  }
  
  return duplicates;
}

/**
 * Validates the entire vehicle entry form
 */
export function validateVehicleForm(form: {
  jathedar_name: string;
  vehicle_type: string;
  place_of_sewa: string;
  driver_name: string;
  vehicle_number: string;
  from_date: string;
  to_date: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!form.jathedar_name.trim()) errors.jathedar_name = 'Jathedar name is required';
  if (!form.vehicle_type.trim()) errors.vehicle_type = 'Vehicle type is required';
  if (!form.place_of_sewa.trim()) errors.place_of_sewa = 'Place of Sewa is required';
  if (!form.driver_name.trim()) errors.driver_name = 'Driver name is required';
  
  const vehicleValidation = validateVehicleNumber(form.vehicle_number);
  if (!vehicleValidation.valid) errors.vehicle_number = vehicleValidation.message;
  
  if (!form.from_date) errors.from_date = 'From date is required';
  if (!form.to_date) errors.to_date = 'To date is required';
  
  if (form.from_date && form.to_date && new Date(form.from_date) > new Date(form.to_date)) {
    errors.to_date = 'To date must be after From date';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
}
