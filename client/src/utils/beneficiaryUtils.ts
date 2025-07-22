// Beneficiary Management Utilities
// Contains filtering, pagination, validation and CRUD operations for beneficiaries

import type { Beneficiary, InsertBeneficiary } from "@shared/schema";

// Types for beneficiary operations
export interface BeneficiaryFilters {
  searchQuery: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginationResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BeneficiaryValidationResult {
  isValid: boolean;
  missingFields: string[];
  fieldsToFocus: string[];
}

// Filter beneficiaries based on search query
export function filterBeneficiaries(
  beneficiaries: Beneficiary[], 
  searchQuery: string
): Beneficiary[] {
  if (!searchQuery.trim()) {
    return beneficiaries;
  }

  const query = searchQuery.toLowerCase();
  return beneficiaries.filter(beneficiary =>
    beneficiary.name?.toLowerCase().includes(query) ||
    beneficiary.email?.toLowerCase().includes(query) ||
    beneficiary.companyName?.toLowerCase().includes(query) ||
    beneficiary.cnp?.includes(searchQuery) ||
    beneficiary.companyCui?.includes(searchQuery)
  );
}

// Sort beneficiaries by ID in descending order (newest first)
export function sortBeneficiaries(
  beneficiaries: Beneficiary[], 
  order: 'asc' | 'desc' = 'desc'
): Beneficiary[] {
  return [...beneficiaries].sort((a, b) => 
    order === 'desc' ? b.id - a.id : a.id - b.id
  );
}

// Apply pagination to beneficiaries array
export function paginateBeneficiaries<T>(
  items: T[], 
  config: PaginationConfig
): PaginationResult<T> {
  const { currentPage, itemsPerPage } = config;
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}

// Process beneficiaries with filters and pagination
export function processBeneficiaries(
  beneficiaries: Beneficiary[],
  filters: BeneficiaryFilters,
  pagination: PaginationConfig
): PaginationResult<Beneficiary> {
  // Apply filtering
  const filtered = filterBeneficiaries(beneficiaries, filters.searchQuery);
  
  // Apply sorting
  const sorted = sortBeneficiaries(filtered, filters.sortOrder);
  
  // Apply pagination
  return paginateBeneficiaries(sorted, pagination);
}

// Validate beneficiary form data
export function validateBeneficiaryData(formData: InsertBeneficiary): BeneficiaryValidationResult {
  const missingFields: string[] = [];
  const fieldsToFocus: string[] = [];

  if (formData.isCompany) {
    // Required fields for companies
    if (!formData.companyName) {
      missingFields.push('Nume Companie');
      fieldsToFocus.push('companyName');
    }
    if (!formData.companyAddress) {
      missingFields.push('Adresa Companiei');
      fieldsToFocus.push('companyAddress');
    }
    if (!formData.companyCui) {
      missingFields.push('CUI Companie');
      fieldsToFocus.push('companyCui');
    }
    if (!formData.companyRegistrationNumber) {
      missingFields.push('Nr. Înregistrare');
      fieldsToFocus.push('companyRegistrationNumber');
    }
    if (!formData.cnp) {
      missingFields.push('CNP Reprezentant');
      fieldsToFocus.push('cnp');
    }
  } else {
    // Required fields for individuals
    if (!formData.cnp) {
      missingFields.push('CNP');
      fieldsToFocus.push('cnp');
    }
    if (!formData.address) {
      missingFields.push('Adresa');
      fieldsToFocus.push('address');
    }
  }

  // Common required fields
  if (!formData.name) {
    missingFields.push('Nume Complet');
    fieldsToFocus.push('name');
  }
  if (!formData.email) {
    missingFields.push('Email');
    fieldsToFocus.push('email');
  }
  if (!formData.phone) {
    missingFields.push('Telefon');
    fieldsToFocus.push('phone');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    fieldsToFocus
  };
}

// Apply field validation styling
export function applyFieldValidation(fieldsToFocus: string[]): void {
  fieldsToFocus.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.classList.add('field-error');
    }
  });

  // Focus on first missing field
  if (fieldsToFocus.length > 0) {
    const firstField = document.getElementById(fieldsToFocus[0]);
    if (firstField) {
      firstField.focus();
      firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// Remove field validation styling
export function clearFieldValidation(): void {
  const allFields = [
    'name', 'email', 'phone', 'address', 'cnp', 
    'companyName', 'companyAddress', 'companyCui', 'companyRegistrationNumber'
  ];
  
  allFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.classList.remove('field-error');
    }
  });
}

// Convert Beneficiary to InsertBeneficiary format for editing
export function beneficiaryToFormData(beneficiary: Beneficiary): InsertBeneficiary {
  return {
    name: beneficiary.name,
    email: beneficiary.email,
    phone: beneficiary.phone ?? "",
    address: beneficiary.address ?? "",
    cnp: beneficiary.cnp ?? "",
    companyName: beneficiary.companyName ?? "",
    companyAddress: beneficiary.companyAddress ?? "",
    companyCui: beneficiary.companyCui ?? "",
    companyRegistrationNumber: beneficiary.companyRegistrationNumber ?? "",
    isCompany: beneficiary.isCompany ?? false,
  };
}

// Create empty form data
export function createEmptyFormData(): InsertBeneficiary {
  return {
    name: "",
    email: "",
    phone: "",
    address: "",
    cnp: "",
    companyName: "",
    companyAddress: "",
    companyCui: "",
    companyRegistrationNumber: "",
    isCompany: false,
  };
}

// Generate avatar initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return words[0]?.[0]?.toUpperCase() || '';
}

// Generate avatar color based on name hash
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-lime-500',
    'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-sky-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// Format display information for beneficiary table
export function formatBeneficiaryDisplay(beneficiary: Beneficiary) {
  return {
    displayName: beneficiary.name,
    displayInfo: beneficiary.isCompany 
      ? beneficiary.companyName 
      : beneficiary.address,
    displayIdentifier: beneficiary.isCompany 
      ? beneficiary.companyCui 
      : beneficiary.cnp,
    initials: getInitials(beneficiary.name),
    avatarColor: getAvatarColor(beneficiary.name)
  };
}