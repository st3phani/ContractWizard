import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CACHE_FILE_PATH = join(process.cwd(), 'system-settings-cache.json');

export interface SystemSettingsCache {
  id: number;
  updatedAt: string;
  currency: string;
  autoBackup: boolean;
  language: string;
  dateFormat: string;
}

export function saveSettingsToCache(settings: SystemSettingsCache): void {
  try {
    writeFileSync(CACHE_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
    console.log('📄 System settings saved to cache file');
  } catch (error) {
    console.error('Failed to save settings cache:', error);
  }
}

export function loadSettingsFromCache(): SystemSettingsCache | null {
  try {
    if (!existsSync(CACHE_FILE_PATH)) {
      console.log('📄 No settings cache file found');
      return null;
    }
    
    const data = readFileSync(CACHE_FILE_PATH, 'utf-8');
    const settings = JSON.parse(data) as SystemSettingsCache;
    console.log('📄 System settings loaded from cache file');
    return settings;
  } catch (error) {
    console.error('Failed to load settings cache:', error);
    return null;
  }
}

export function clearSettingsCache(): void {
  try {
    if (existsSync(CACHE_FILE_PATH)) {
      require('fs').unlinkSync(CACHE_FILE_PATH);
      console.log('📄 Settings cache file cleared');
    }
  } catch (error) {
    console.error('Failed to clear settings cache:', error);
  }
}