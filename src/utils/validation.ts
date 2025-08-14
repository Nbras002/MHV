export const validatePassword = (password: string): boolean => {
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasLength && hasUppercase && hasLowercase && hasNumbers && hasSymbols;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateVehiclePlate = (plate: string): boolean => {
  // Saudi vehicle plate format: 4 digits + 3 letters
  const plateRegex = /^\d{4}[A-Z]{3}$/;
  return plateRegex.test(plate);
};

export const validatePermitNumber = (permitNumber: string): boolean => {
  // Format: 3 letters + digits (e.g., MHV0000001)
  const permitRegex = /^[A-Z]{3}\d+$/;
  return permitRegex.test(permitNumber);
};

export const formatVehiclePlate = (plate: string, isArabic: boolean): string => {
  if (plate.length !== 7) return plate;
  
  const digits = plate.substring(0, 4);
  const letters = plate.substring(4, 7);
  
  if (isArabic) {
    // Convert English letters to Arabic equivalents
    const arabicMap: { [key: string]: string } = {
      'A': 'ا', 'B': 'ب', 'J': 'ح', 'D': 'د', 'R': 'ر', 'S': 'س', 
      'X': 'ص', 'T': 'ط', 'E': 'ع', 'G': 'ق', 'K': 'ك', 'L': 'ل', 
      'Z': 'م', 'N': 'ن', 'H': 'هـ', 'U': 'و', 'V': 'ى'
    };
    const arabicLetters = letters.split('').map(letter => arabicMap[letter] || letter).join(' ');
    return `${arabicLetters} ${digits}`;
  } else {
    return `${digits} ${letters.split('').join(' ')}`;
  }
};

export const parseVehiclePlate = (formattedPlate: string): string => {
  // Remove spaces and convert Arabic letters back to English
  const arabicToEnglishMap: { [key: string]: string } = {
    'ا': 'A', 'ب': 'B', 'ح': 'J', 'د': 'D', 'ر': 'R', 'س': 'S',
    'ص': 'X', 'ط': 'T', 'ع': 'E', 'ق': 'G', 'ك': 'K', 'ل': 'L',
    'م': 'Z', 'ن': 'N', 'هـ': 'H', 'و': 'U', 'ى': 'V'
  };
  
  return formattedPlate.replace(/\s/g, '').split('').map(char => 
    arabicToEnglishMap[char] || char
  ).join('');
}