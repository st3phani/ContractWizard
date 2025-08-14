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

// Generate page numbers for pagination controls based on current page position
export function generatePageNumbers(
  currentPage: number, 
  totalPages: number, 
  maxVisible: number = 7
): number[] {
  if (totalPages <= maxVisible) {
    // If total pages is small, show all pages
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const result: number[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Calculate start and end positions
  let start = Math.max(1, currentPage - halfVisible);
  let end = Math.min(totalPages, currentPage + halfVisible);

  // Adjust if we're near the beginning
  if (currentPage <= halfVisible) {
    start = 1;
    end = Math.min(maxVisible, totalPages);
  }

  // Adjust if we're near the end
  if (currentPage > totalPages - halfVisible) {
    start = Math.max(1, totalPages - maxVisible + 1);
    end = totalPages;
  }

  // Generate the range
  for (let i = start; i <= end; i++) {
    result.push(i);
  }

  return result;
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