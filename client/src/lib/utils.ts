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

export function getAvatarColor(name: string): string {
  if (!name) return "bg-gray-500";
  
  // Generate a hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Predefined color palette for consistent, readable colors
  const colors = [
    "bg-blue-500",
    "bg-green-500", 
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-cyan-500",
    "bg-violet-500",
    "bg-rose-500",
    "bg-lime-500",
    "bg-amber-500",
    "bg-sky-500"
  ];
  
  // Use absolute value of hash to get positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
