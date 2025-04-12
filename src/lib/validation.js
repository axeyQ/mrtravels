export function isValidLicenseNumber(licenseNumber) {
    // Only allow alphanumeric characters (letters and numbers)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(licenseNumber);
  }
  
  // This error message can be used in forms
  export const LICENSE_ERROR_MESSAGE = "License number must contain only letters and numbers (no spaces or special characters)";