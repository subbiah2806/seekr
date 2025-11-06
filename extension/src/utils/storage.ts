/**
 * StorageManager Class
 * Provides unified storage interface that works in both Chrome extension and web contexts
 * Automatically falls back from Chrome storage API to localStorage
 */

import { StorageData, TailoredResume, DEFAULT_STORAGE_DATA } from './schemas';

const STORAGE_KEY = 'seekr_data';
const STORAGE_VERSION = '1.0';

class StorageManager {
  /**
   * Check if we're in a Chrome extension context
   */
  private isExtensionContext(): boolean {
    try {
      return (
        typeof chrome !== 'undefined' &&
        typeof chrome.storage !== 'undefined' &&
        typeof chrome.storage.local !== 'undefined'
      );
    } catch {
      return false;
    }
  }

  /**
   * Get data from storage (Chrome storage or localStorage)
   */
  async getData(): Promise<StorageData> {
    try {
      let rawData: string | null = null;

      if (this.isExtensionContext()) {
        // Use Chrome storage API
        const result = await chrome.storage.local.get(STORAGE_KEY);
        rawData = (result[STORAGE_KEY] as string | undefined) || null;
      } else {
        // Use localStorage for web version
        rawData = localStorage.getItem(STORAGE_KEY);
      }

      if (!rawData) {
        return { ...DEFAULT_STORAGE_DATA };
      }

      const parsed = JSON.parse(rawData);
      return { ...DEFAULT_STORAGE_DATA, ...parsed };
    } catch (error) {
      console.error('Error reading from storage:', error);
      return { ...DEFAULT_STORAGE_DATA };
    }
  }

  /**
   * Save data to storage
   */
  async setData(data: Partial<StorageData>): Promise<void> {
    try {
      const currentData = await this.getData();
      const mergedData = { ...currentData, ...data };
      const serialized = JSON.stringify(mergedData);

      if (this.isExtensionContext()) {
        await chrome.storage.local.set({ [STORAGE_KEY]: serialized });
      } else {
        localStorage.setItem(STORAGE_KEY, serialized);
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  /**
   * Get tailored resumes from storage
   */
  async getTailoredResumes(): Promise<TailoredResume[]> {
    const data = await this.getData();
    return data.tailoredResumes || [];
  }

  /**
   * Add tailored resume to storage
   */
  async addTailoredResume(resume: TailoredResume): Promise<void> {
    const resumes = await this.getTailoredResumes();
    const updated = [{ ...resume, createdAt: new Date().toISOString() }, ...resumes].slice(0, 50);
    await this.setData({ tailoredResumes: updated });
  }

  /**
   * Clear all tailored resumes
   */
  async clearTailoredResumes(): Promise<void> {
    await this.setData({ tailoredResumes: [] });
  }

  /**
   * Get API URL from settings
   */
  async getApiUrl(): Promise<string> {
    const data = await this.getData();
    return data.settings?.apiUrl || 'http://localhost:8000';
  }

  /**
   * Save API URL to settings
   */
  async saveApiUrl(apiUrl: string): Promise<void> {
    const data = await this.getData();
    await this.setData({
      settings: {
        ...data.settings,
        apiUrl,
      },
    });
  }

  /**
   * Get theme from settings
   */
  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    const data = await this.getData();
    return data.settings?.theme || 'system';
  }

  /**
   * Save theme to settings
   */
  async saveTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    const data = await this.getData();
    await this.setData({
      settings: {
        ...data.settings,
        theme,
      },
    });
  }

  /**
   * Get storage usage (approximate size in bytes)
   */
  async getStorageSize(): Promise<number> {
    const data = await this.getData();
    const serialized = JSON.stringify(data);
    return new Blob([serialized]).size;
  }

  /**
   * Clear all data (reset to default state)
   */
  async clearAll(): Promise<void> {
    if (this.isExtensionContext()) {
      await chrome.storage.local.remove(STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /**
   * Get storage version
   */
  getVersion(): string {
    return STORAGE_VERSION;
  }
}

// Export singleton instance
export const storageManager = new StorageManager();
export default storageManager;
