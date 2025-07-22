// Pagination Utilities
// Reusable pagination logic for tables and lists

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
  startIndex: number;
  endIndex: number;
}

// Apply pagination to any array of items
export function paginateItems<T>(
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
    hasPreviousPage: currentPage > 1,
    startIndex,
    endIndex
  };
}

// Generate page numbers for pagination controls
export function generatePageNumbers(
  currentPage: number, 
  totalPages: number, 
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // Adjust start if we're near the end
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Calculate pagination info text
export function getPaginationInfo(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
): {
  start: number;
  end: number;
  total: number;
  text: string;
} {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  
  return {
    start,
    end,
    total: totalItems,
    text: `${start}-${end} din ${totalItems}`
  };
}

// Validate pagination parameters
export function validatePaginationConfig(config: PaginationConfig): {
  isValid: boolean;
  errors: string[];
  corrected: PaginationConfig;
} {
  const errors: string[] = [];
  let { currentPage, itemsPerPage } = config;

  // Validate itemsPerPage
  if (itemsPerPage <= 0) {
    errors.push('Items per page must be greater than 0');
    itemsPerPage = 10; // Default value
  }
  if (itemsPerPage > 100) {
    errors.push('Items per page cannot exceed 100');
    itemsPerPage = 100; // Max value
  }

  // Validate currentPage
  if (currentPage <= 0) {
    errors.push('Current page must be greater than 0');
    currentPage = 1; // Default value
  }

  return {
    isValid: errors.length === 0,
    errors,
    corrected: { currentPage, itemsPerPage }
  };
}

// Common pagination sizes
export const PAGINATION_SIZES = [5, 10, 20, 50, 100] as const;
export type PaginationSize = typeof PAGINATION_SIZES[number];

// Default pagination config
export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  currentPage: 1,
  itemsPerPage: 10
};