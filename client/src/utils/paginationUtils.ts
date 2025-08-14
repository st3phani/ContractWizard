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

  const pages: (number | 'ellipsis')[] = [];
  
  // Always show first 3 pages
  pages.push(1, 2, 3);

  // Check if we need ellipsis after first 3
  if (currentPage > 6) {
    pages.push('ellipsis');
  }

  // Add pages around current page if it's not near the beginning or end
  if (currentPage > 3 && currentPage <= totalPages - 3) {
    // Only add current page area if it doesn't overlap with first 3 or last 3
    if (currentPage > 6 && currentPage < totalPages - 5) {
      const start = currentPage - 1;
      const end = currentPage + 1;
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      pages.push('ellipsis');
    }
  }

  // Check if we need ellipsis before last 3
  if (currentPage < totalPages - 5) {
    // Only add ellipsis if it's not already there
    if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  // Always show last 3 pages
  if (totalPages > 2) {
    const lastThree = [totalPages - 2, totalPages - 1, totalPages];
    lastThree.forEach(page => {
      if (!pages.includes(page)) {
        pages.push(page);
      }
    });
  }

  // Clean up and remove any duplicates while preserving order
  const result: (number | 'ellipsis')[] = [];
  let lastAdded: number | 'ellipsis' | null = null;
  
  for (const page of pages) {
    if (page !== lastAdded) {
      result.push(page);
      lastAdded = page;
    }
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