// repositories/LevelRepository.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChapterProgressPayload, LevelData, LevelProgress } from '../types/level.types';

export interface LevelCheckpoint {
  userId: string;
  levelId: string;
  sceneIndex: number;
  stepIndex: number;
  starsEarned: number;
  answers: any[];
  timestamp: Date;
}

export class LevelRepository {
  // Cache: Think of this as a "sticky note" - stores recently used levels
  // Key: level ID (like "level_123")
  // Value: the actual level data
  private levelCache: Map<string, LevelData> = new Map();
  private chapterCache: Map<string, LevelData[]> = new Map(); // Cache for chapter levels
  private progressCache: Map<string, LevelProgress> = new Map(); // Cache for user progress
  
  // Cache duration: 5 minutes (in milliseconds)
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  
  // Track when each level was cached
  private cacheTimestamps: Map<string, number> = new Map();
  
  // API URL from environment variables (works in both dev and production)
  private apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api` ||'http://localhost:5000/api';

  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      const token = await AsyncStorage.getItem('token'); // or 'userToken'
      return token 
        ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        : { 'Content-Type': 'application/json' };
    } catch (error) {
      console.warn('Failed to get auth token');
      return { 'Content-Type': 'application/json' };
    }
  }

  // ──────────────────────────────────────────────────────────
  // 1. GET LEVEL BY ID - Most important method
  // ──────────────────────────────────────────────────────────
  async getLevelById(levelId: string): Promise<LevelData> {
    // // STEP 1: Check if we have this level in cache
    // if (this.isCacheValid(levelId)) {
    //   console.log(`✅ Cache hit: Returning ${levelId} from cache`);
    //   return this.levelCache.get(levelId)!;
    // }

    // // STEP 2: Not in cache? Try AsyncStorage (persistent storage)
    // const cachedLevel = await this.getFromAsyncStorage(levelId);
    // if (cachedLevel) {
    //   console.log(`💾 AsyncStorage hit: ${levelId} found in persistent storage`);
    //   this.updateLevelCache(levelId, cachedLevel);
    //   return cachedLevel;
    // }

    // STEP 3: Not in any cache? Fetch from API
    try {
      console.log(`🌐 API fetch: Getting ${levelId} from backend`);
      const level = await this.fetchFromAPI(levelId);
      
      // Save to both caches for next time
      this.updateLevelCache(levelId, level);
      await this.saveToAsyncStorage(levelId, level);
      
      return level;
    } catch (error) {
      console.error(`❌ Failed to load level ${levelId}:`, error);
      throw new Error(`Unable to load level: ${levelId}`);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 2. GET ALL LEVELS IN A CHAPTER
  // ──────────────────────────────────────────────────────────
  async getLevelsByChapter(chapterId: string): Promise<LevelData[]> {
    // Create a cache key for the chapter
    const cacheKey = `chapter_${chapterId}`;
    
    // Check chapter cache
    if (this.isCacheValid(cacheKey)) {
      return this.chapterCache.get(cacheKey) as LevelData[];
    }
    
    // Check AsyncStorage
    const cached = await this.getFromAsyncStorage(cacheKey);
    if (cached) {
      this.updateChapterCache(cacheKey, cached);
      return cached;
    }
    
    // Fetch from API
    const response = await fetch(`${this.apiUrl}/levels?chapterId=${chapterId}&sort=order`);
    if (!response.ok) throw new Error('Failed to fetch chapter levels');
    
    const data = await response.json();
    const levels = data.levels || data;
    
    // Cache the entire chapter
    this.updateChapterCache(cacheKey, levels);
    await this.saveToAsyncStorage(cacheKey, levels);
    
    return levels;
  }

  // ──────────────────────────────────────────────────────────
  // 3. SAVE PLAYER PROGRESS
  // ──────────────────────────────────────────────────────────
  async saveProgress(progress: LevelProgress): Promise<void> {
    try {
    const headers = await this.getAuthHeaders();
      // Save to backend
      const response = await fetch(`${this.apiUrl}/progress/level`, {
        method: 'POST',
        headers,
        body: JSON.stringify(progress),
      });
      
      if (!response.ok) throw new Error('Failed to save progress');
      
      // Also save progress locally for offline access
      await this.saveToAsyncStorage(`progress_${progress.userId}_${progress.levelId}`, progress);
      
      // Invalidate any cached levels that might have been affected
      this.invalidateCache(progress.levelId);
      
      console.log(`💾 Progress saved for level ${progress.levelId}`);
    } catch (error) {
      console.error('Error saving progress:', error);
      // Don't throw - we'll retry later
      await this.queueForRetry(progress);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 4. GET USER PROGRESS FOR A LEVEL
  // ──────────────────────────────────────────────────────────
  async getUserProgress(userId: string, levelId: string): Promise<LevelProgress | null> {
    const cacheKey = `progress_${userId}_${levelId}`;
    
    // Try memory cache
    if (this.isCacheValid(cacheKey)) {
      return this.progressCache.get(cacheKey) as LevelProgress;
    }
    
    // Try AsyncStorage
    const cached = await this.getFromAsyncStorage(cacheKey);
    if (cached) {
      this.updateProgressCache(cacheKey, cached);
      return cached;
    }
    
    // Fetch from API
    try {
      const response = await fetch(`${this.apiUrl}/progress/${userId}/${levelId}`);
      if (response.status === 404) return null; // No progress yet
      if (!response.ok) throw new Error('Failed to fetch progress');
      
      const progress = await response.json();
      this.updateProgressCache(cacheKey, progress);
      await this.saveToAsyncStorage(cacheKey, progress);
      
      return progress;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  // ──────────────────────────────────────────────────────────
  // 5. PRELOAD NEXT LEVELS (for smooth gameplay)
  // ──────────────────────────────────────────────────────────
  async preloadNextLevels(currentLevelId: string, chapterId: string): Promise<void> {
    try {
      // Get all levels in chapter
      const levels = await this.getLevelsByChapter(chapterId);
      
      // Find current level index
      const currentIndex = levels.findIndex(l => l._id === currentLevelId);
      
      // Preload next 2 levels
      const nextLevels = levels.slice(currentIndex + 1, currentIndex + 3);
      
      // Load them in background (don't await - let them load silently)
      nextLevels.forEach(level => {
        this.getLevelById(level._id).catch(err => 
          console.warn(`Failed to preload ${level._id}:`, err)
        );
      });
      
      console.log(`🔄 Preloading next ${nextLevels.length} levels`);
    } catch (error) {
      console.error('Failed to preload levels:', error);
    }
  }

  // -----------------------------------------
  // CHECKPOINTS - For saving mid-level progress
  // -----------------------------------------
   async saveCheckpoint(checkpoint: LevelCheckpoint): Promise<void> {
    const cacheKey = `checkpoint_${checkpoint.userId}_${checkpoint.levelId}`;
    
    try {
      // Save to memory cache
      this.updateCheckpointCache(cacheKey, checkpoint);
      
      // Save to AsyncStorage
      await this.saveToAsyncStorage(cacheKey, checkpoint);
      
      // Optionally save to backend
      await this.saveCheckpointToAPI(checkpoint);
      
      console.log(`💾 Checkpoint saved for ${checkpoint.levelId}`);
    } catch (error) {
      console.error('Error saving checkpoint:', error);
      // Don't throw - checkpoint is not critical
    }
  }

  //save chapter progress

  async saveChapterProgress(payload: ChapterProgressPayload): Promise<{ allPassed: boolean; rewardUnlocked: any }> {
  const headers = await this.getAuthHeaders(); // add this
  const res = await fetch(`${this.apiUrl}/progress/chapter`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return res.json(); 
}

  async getCheckpoint(userId: string, levelId: string): Promise<LevelCheckpoint | null> {
    const cacheKey = `checkpoint_${userId}_${levelId}`;
    
    // Try memory cache
    if (this.isCacheValid(cacheKey)) {
      return this.checkpointCache?.get(cacheKey) || null;
    }
    
    // Try AsyncStorage
    const cached = await this.getFromAsyncStorage(cacheKey);
    if (cached) {
      this.updateCheckpointCache(cacheKey, cached);
      return cached;
    }
    
    return null;
  }

  private checkpointCache: Map<string, LevelCheckpoint> = new Map();

  private updateCheckpointCache(key: string, data: LevelCheckpoint): void {
    this.checkpointCache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  private async saveCheckpointToAPI(checkpoint: LevelCheckpoint): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/progress/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkpoint)
      });
      
      if (!response.ok) {
        console.warn('Failed to save checkpoint to API');
      }
    } catch (error) {
      console.error('API checkpoint save error:', error);
    }
  }

  // ──────────────────────────────────────────────────────────
  // PRIVATE METHODS - Cache Management
  // ──────────────────────────────────────────────────────────
  
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_DURATION;
  }
  
  private updateLevelCache(key: string, data: any): void {
    this.levelCache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  private updateChapterCache(key: string, data: LevelData[]): void {
    this.chapterCache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }

  private updateProgressCache(key: string, data: LevelProgress): void {
    this.progressCache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
    console.log(`📦 Cached progress: ${key}`);
  }
  
  private invalidateCache(key: string): void {
    this.levelCache.delete(key);
    this.chapterCache.delete(key);
    this.progressCache.delete(key);
    this.cacheTimestamps.delete(key);
  }
  
  private clearExpiredCache(): void {
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        this.levelCache.delete(key);
        this.chapterCache.delete(key);
        this.progressCache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }
  
  // ──────────────────────────────────────────────────────────
  // PRIVATE METHODS - Storage
  // ──────────────────────────────────────────────────────────
  
  private async getFromAsyncStorage(key: string): Promise<any | null> {
    try {
      const value = await AsyncStorage.getItem(`level_${key}`);
      if (value) {
        const parsed = JSON.parse(value);
        // Check if cached data is still fresh
        if (parsed._cachedAt && Date.now() - parsed._cachedAt < this.CACHE_DURATION) {
          return parsed.data;
        }
      }
      return null;
    } catch (error) {
      console.error('AsyncStorage read error:', error);
      return null;
    }
  }
  
  private async saveToAsyncStorage(key: string, data: any): Promise<void> {
    try {
      const toStore = {
        data: data,
        _cachedAt: Date.now(),
        _version: '1.0'
      };
      await AsyncStorage.setItem(`level_${key}`, JSON.stringify(toStore));
    } catch (error) {
      console.error('AsyncStorage write error:', error);
    }
  }
  
  // ──────────────────────────────────────────────────────────
  // PRIVATE METHODS - API
  // ──────────────────────────────────────────────────────────
  
  private async fetchFromAPI(levelId: string): Promise<LevelData> {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const headers = await this.getAuthHeaders();
      console.log(headers);
      const response = await fetch(`${this.apiUrl}/levels/${levelId}`, {
        signal: controller.signal,
        headers
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Level ${levelId} not found`);
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      // Handle both response formats: { level: {...} } or just {...}
      return data.level || data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  private async queueForRetry(progress: LevelProgress): Promise<void> {
    try {
      // Get existing retry queue
      const queue = await this.getFromAsyncStorage('progress_retry_queue') || [];
      queue.push({
        progress,
        retryCount: 0,
        lastAttempt: Date.now()
      });
      await this.saveToAsyncStorage('progress_retry_queue', queue);
      
      // Start retry processor if not already running
      this.processRetryQueue();
    } catch (error) {
      console.error('Failed to queue progress for retry:', error);
    }
  }
  
  private async processRetryQueue(): Promise<void> {
    // Implementation for retrying failed saves
    // This would run in background and retry every few minutes
  }
}

// Export a single instance (Singleton pattern)
export const levelRepository = new LevelRepository();