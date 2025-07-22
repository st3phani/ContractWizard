import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatCurrency(amount: number | string | null | undefined, currency: string = "RON"): string {
  if (!amount) return "0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: currency,
  }).format(num);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "draft":
      return "bg-orange-100 text-orange-800";
    case "sent":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-purple-100 text-purple-800";
    case "reserved":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case "draft":
      return "În Așteptare";
    case "sent":
      return "Trimis";
    case "completed":
      return "Finalizat";
    case "reserved":
      return "Rezervat";
    default:
      return "Necunoscut";
  }
}

export function getInitials(name: string): string {
  if (!name) return "B";
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    // Single name - take first 2 characters
    return parts[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple names - take first letter of first and last name
    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }
}
