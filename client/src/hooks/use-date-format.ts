import { useQuery } from "@tanstack/react-query";
import { formatDate as formatDateWithFormat, type DateFormat } from "@/lib/dateUtils";

export interface SystemSettings {
  id: number;
  updatedAt: string;
  currency: string;
  autoBackup: boolean;
  language: string;
  dateFormat: DateFormat;
}

export function useDateFormat() {
  const { data: systemSettings } = useQuery<SystemSettings>({
    queryKey: ['/api/system-settings'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const dateFormat = systemSettings?.dateFormat || 'dd/mm/yyyy';

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    return formatDateWithFormat(date, dateFormat);
  };

  return {
    dateFormat,
    formatDate,
    systemSettings
  };
}