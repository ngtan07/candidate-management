import { ALLOWED_CV_TYPES, MAX_CV_SIZE_BYTES } from "./constants.js";

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
};

export const isValidVietnamesePhone = (phone) => {
  if (!phone) return true; // optional
  const cleanPhone = phone.trim().replace(/\s+/g, "");
  // Backend uses isMobilePhone('vi-VN') which checks standard 10-digit formats (03, 05, 07, 08, 09...)
  return /^(0|84|\+84)[35789][0-9]{8}$/.test(cleanPhone) || /^[0-9]{10,11}$/.test(cleanPhone);
};

export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateCvFile = (file) => {
  if (!file) {
    return "Please upload your CV file.";
  }
  const ext = file.name.split('.').pop().toLowerCase();
  const validExtensions = ['pdf', 'doc', 'docx'];
  if (!validExtensions.includes(ext) && !ALLOWED_CV_TYPES.includes(file.type)) {
    return "Only PDF, DOC, and DOCX files are accepted.";
  }
  if (file.size > MAX_CV_SIZE_BYTES) {
    return "CV file size must not exceed 5 MB.";
  }
  return null;
};

