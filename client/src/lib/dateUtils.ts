import { format, parse } from "date-fns";
import { ro } from "date-fns/locale";

export type DateFormat = "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";

export const formatDate = (date: Date | string | null | undefined, dateFormat: DateFormat = "dd/mm/yyyy"): string => {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  switch (dateFormat) {
    case "dd/mm/yyyy":
      return format(dateObj, "dd/MM/yyyy", { locale: ro });
    case "mm/dd/yyyy":
      return format(dateObj, "MM/dd/yyyy", { locale: ro });
    case "yyyy-mm-dd":
      return format(dateObj, "yyyy-MM-dd", { locale: ro });
    default:
      return format(dateObj, "dd/MM/yyyy", { locale: ro });
  }
};

export const parseDate = (dateString: string, dateFormat: DateFormat = "dd/mm/yyyy"): Date | null => {
  if (!dateString) return null;
  
  try {
    switch (dateFormat) {
      case "dd/mm/yyyy":
        return parse(dateString, "dd/MM/yyyy", new Date());
      case "mm/dd/yyyy":
        return parse(dateString, "MM/dd/yyyy", new Date());
      case "yyyy-mm-dd":
        return parse(dateString, "yyyy-MM-dd", new Date());
      default:
        return parse(dateString, "dd/MM/yyyy", new Date());
    }
  } catch {
    return null;
  }
};

export const getDateInputFormat = (dateFormat: DateFormat = "dd/mm/yyyy"): string => {
  switch (dateFormat) {
    case "dd/mm/yyyy":
      return "dd/mm/yyyy";
    case "mm/dd/yyyy":
      return "mm/dd/yyyy";
    case "yyyy-mm-dd":
      return "yyyy-mm-dd";
    default:
      return "dd/mm/yyyy";
  }
};