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

// Generate page numbers for pagination controls with smart ellipsis
export function generatePageNumbers(
  currentPage: number, 
  totalPages: number, 
  maxVisible: number = 5
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    // If total pages is small (7 or less), show all pages
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const result: (number | 'ellipsis')[] = [];

  // Always show first 3 pages
  result.push(1, 2, 3);

  // Check if current page is in the first group
  if (currentPage <= 3) {
    // Current page is in first 3, just add ellipsis and last 3
    result.push('ellipsis');
  }
  // Check if current page is close to first group (4, 5, 6)
  else if (currentPage >= 4 && currentPage <= 6) {
    // Extend first group to include current page
    for (let i = 4; i <= Math.min(6, currentPage + 1); i++) {
      result.push(i);
    }
    // Add ellipsis before last 3 if there's space
    if (totalPages > 9) {
      result.push('ellipsis');
    }
  }
  // Check if current page is close to last group
  else if (currentPage > totalPages - 6 && currentPage <= totalPages - 3) {
    // Add ellipsis after first 3
    result.push('ellipsis');
    // Add pages around current page that don't overlap with last 3
    const start = Math.max(4, totalPages - 5);
    const end = totalPages - 3;
    for (let i = start; i <= end; i++) {
      if (!result.includes(i)) {
        result.push(i);
      }
    }
  }
  // Current page is in the middle
  else {
    result.push('ellipsis');
    
    // Add current page with one page before and after
    const start = currentPage - 1;
    const end = currentPage + 1;
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    
    result.push('ellipsis');
  }

  // Always show last 3 pages
  if (totalPages > 2) {
    const lastThree = [totalPages - 2, totalPages - 1, totalPages];
    for (const page of lastThree) {
      if (!result.includes(page)) {
        result.push(page);
      }
    }
  }

  // Remove duplicates while preserving order
  const seen = new Set<number | 'ellipsis'>();
  const final: (number | 'ellipsis')[] = [];
  
  for (const item of result) {
    if (!seen.has(item)) {
      seen.add(item);
      final.push(item);
    }
  }

  return final;
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