import { AnonymousData } from '@/stores/anonymousStore';

// Migration result types
export interface MigrationResult {
  success: boolean;
  migratedSequences: number;
  migratedUsageData: boolean;
  migratedSettings: boolean;
  backupCreated: boolean;
  migrationId: string;
  timestamp: string;
  errors: string[];
  warnings: string[];
}

export interface RollbackResult {
  success: boolean;
  restoredData: boolean;
  rollbackId: string;
  timestamp: string;
  errors: string[];
}

// Migration state tracking
export interface MigrationState {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  startedAt: string;
  completedAt?: string;
  anonymousDataBackup: string; // JSON string backup
  accountId?: string;
  errorLogs: string[];
  progress: {
    sequences: { total: number; completed: number };
    usage: boolean;
    settings: boolean;
  };
}

// Migration storage key
const MIGRATION_STORAGE_KEY = 'spinverse-migration-state';
const BACKUP_STORAGE_PREFIX = 'spinverse-backup';

class DataMigrationManager {
  private static instance: DataMigrationManager | null = null;
  private currentMigration: MigrationState | null = null;

  private constructor() {}

  static getInstance(): DataMigrationManager {
    if (!DataMigrationManager.instance) {
      DataMigrationManager.instance = new DataMigrationManager();
    }
    return DataMigrationManager.instance;
  }

  // Generate unique migration ID
  private generateMigrationId(): string {
    return `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save migration state to localStorage
  private saveMigrationState(state: MigrationState): void {
    try {
      localStorage.setItem(MIGRATION_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save migration state:', error);
    }
  }

  // Load migration state from localStorage
  private loadMigrationState(): MigrationState | null {
    try {
      const stored = localStorage.getItem(MIGRATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load migration state:', error);
      return null;
    }
  }

  // Create comprehensive backup of anonymous data
  private createBackup(anonymousData: AnonymousData): string {
    const backupId = `${BACKUP_STORAGE_PREFIX}_${Date.now()}`;
    
    const backup = {
      id: backupId,
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: anonymousData,
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        storageSize: this.calculateStorageSize(JSON.stringify(anonymousData)),
      },
    };

    try {
      const backupString = JSON.stringify(backup);
      
      // Store primary backup
      localStorage.setItem(backupId, backupString);
      
      // Store secondary backup with different key
      localStorage.setItem(`${backupId}_secondary`, backupString);
      
      // Store backup index for easier recovery
      const backupIndex = this.getBackupIndex();
      backupIndex.push({
        id: backupId,
        timestamp: backup.timestamp,
        size: backupString.length,
      });
      localStorage.setItem('spinverse-backup-index', JSON.stringify(backupIndex));
      
      return backupId;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Backup creation failed');
    }
  }

  // Get list of available backups
  private getBackupIndex(): Array<{id: string; timestamp: string; size: number}> {
    try {
      const stored = localStorage.getItem('spinverse-backup-index');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load backup index:', error);
      return [];
    }
  }

  // Calculate storage size in bytes
  private calculateStorageSize(data: string): number {
    return new Blob([data]).size;
  }

  // Validate anonymous data before migration
  private validateAnonymousData(data: AnonymousData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Invalid data structure');
      return { isValid: false, errors };
    }

    // Validate version
    if (typeof data.version !== 'number') {
      errors.push('Missing or invalid version number');
    }

    // Validate sequences
    if (!Array.isArray(data.sequences)) {
      errors.push('Invalid sequences array');
    } else {
      data.sequences.forEach((seq, index) => {
        if (!seq.id || !seq.name || !seq.sequenceData) {
          errors.push(`Invalid sequence at index ${index}`);
        }
      });
    }

    // Validate usage data
    if (!data.usage || typeof data.usage !== 'object') {
      errors.push('Invalid usage data');
    } else {
      const requiredUsageFields = ['dailyAiGenerations', 'totalSpins', 'sequencesCreated'];
      requiredUsageFields.forEach(field => {
        if (typeof data.usage[field as keyof typeof data.usage] !== 'number') {
          errors.push(`Invalid usage field: ${field}`);
        }
      });
    }

    // Validate settings
    if (!data.settings || typeof data.settings !== 'object') {
      errors.push('Invalid settings data');
    }

    // Validate metadata
    if (!data.metadata || !data.metadata.firstVisit || !data.metadata.deviceId) {
      errors.push('Invalid metadata');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Simulate API call to create account (replace with actual implementation)
  private async createProAccount(anonymousData: AnonymousData): Promise<string> {
    // This is a placeholder - implement actual account creation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure
        if (Math.random() > 0.1) { // 90% success rate
          const accountId = `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          resolve(accountId);
        } else {
          reject(new Error('Account creation failed'));
        }
      }, 1000);
    });
  }

  // Simulate API call to migrate sequences (replace with actual implementation)
  private async migrateSequencesToAccount(accountId: string, sequences: any[]): Promise<void> {
    // This is a placeholder - implement actual sequence migration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) { // 95% success rate
          resolve();
        } else {
          reject(new Error('Sequence migration failed'));
        }
      }, sequences.length * 200); // Simulate processing time per sequence
    });
  }

  // Start migration process
  async startMigration(anonymousData: AnonymousData): Promise<MigrationResult> {
    const migrationId = this.generateMigrationId();
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    const result: MigrationResult = {
      success: false,
      migratedSequences: 0,
      migratedUsageData: false,
      migratedSettings: false,
      backupCreated: false,
      migrationId,
      timestamp,
      errors: [],
      warnings: [],
    };

    try {
      // Step 1: Validate anonymous data
      console.log('Step 1: Validating anonymous data...');
      const validation = this.validateAnonymousData(anonymousData);
      if (!validation.isValid) {
        result.errors.push(...validation.errors);
        return result;
      }

      // Step 2: Create backup
      console.log('Step 2: Creating backup...');
      const backupId = this.createBackup(anonymousData);
      result.backupCreated = true;

      // Step 3: Initialize migration state
      this.currentMigration = {
        id: migrationId,
        status: 'in_progress',
        startedAt: timestamp,
        anonymousDataBackup: backupId,
        errorLogs: [],
        progress: {
          sequences: { total: anonymousData.sequences.length, completed: 0 },
          usage: false,
          settings: false,
        },
      };
      this.saveMigrationState(this.currentMigration);

      // Step 4: Create PRO account
      console.log('Step 3: Creating PRO account...');
      const accountId = await this.createProAccount(anonymousData);
      this.currentMigration.accountId = accountId;
      this.saveMigrationState(this.currentMigration);

      // Step 5: Migrate sequences
      console.log('Step 4: Migrating sequences...');
      if (anonymousData.sequences.length > 0) {
        try {
          await this.migrateSequencesToAccount(accountId, anonymousData.sequences);
          result.migratedSequences = anonymousData.sequences.length;
          this.currentMigration.progress.sequences.completed = anonymousData.sequences.length;
        } catch (error) {
          result.errors.push(`Sequence migration failed: ${error}`);
          result.warnings.push('Some sequences may not have been migrated');
        }
      }

      // Step 6: Migrate usage data
      console.log('Step 5: Migrating usage data...');
      try {
        // Placeholder for usage data migration
        result.migratedUsageData = true;
        this.currentMigration.progress.usage = true;
      } catch (error) {
        result.errors.push(`Usage data migration failed: ${error}`);
      }

      // Step 7: Migrate settings
      console.log('Step 6: Migrating settings...');
      try {
        // Placeholder for settings migration
        result.migratedSettings = true;
        this.currentMigration.progress.settings = true;
      } catch (error) {
        result.errors.push(`Settings migration failed: ${error}`);
      }

      // Step 8: Finalize migration
      const endTime = Date.now();
      this.currentMigration.status = result.errors.length === 0 ? 'completed' : 'failed';
      this.currentMigration.completedAt = new Date().toISOString();
      this.saveMigrationState(this.currentMigration);

      result.success = result.errors.length === 0;
      
      console.log(`Migration ${result.success ? 'completed successfully' : 'completed with errors'} in ${endTime - startTime}ms`);
      
      return result;

    } catch (error: any) {
      console.error('Migration failed:', error);
      
      result.errors.push(`Migration failed: ${error.message}`);
      
      if (this.currentMigration) {
        this.currentMigration.status = 'failed';
        this.currentMigration.completedAt = new Date().toISOString();
        this.currentMigration.errorLogs.push(error.message);
        this.saveMigrationState(this.currentMigration);
      }

      return result;
    }
  }

  // Rollback migration
  async rollbackMigration(migrationId?: string): Promise<RollbackResult> {
    const rollbackId = `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    const result: RollbackResult = {
      success: false,
      restoredData: false,
      rollbackId,
      timestamp,
      errors: [],
    };

    try {
      // Load migration state
      const migrationState = migrationId ? 
        this.loadMigrationStateById(migrationId) : 
        this.loadMigrationState();

      if (!migrationState) {
        result.errors.push('No migration state found');
        return result;
      }

      // Load backup data
      const backupData = this.loadBackup(migrationState.anonymousDataBackup);
      if (!backupData) {
        result.errors.push('Backup data not found');
        return result;
      }

      // Restore anonymous data
      console.log('Restoring anonymous data from backup...');
      localStorage.setItem('spinverse-anonymous', JSON.stringify(backupData.data));
      result.restoredData = true;

      // Update migration state
      migrationState.status = 'rolled_back';
      this.saveMigrationState(migrationState);

      result.success = true;
      console.log('Rollback completed successfully');
      
      return result;

    } catch (error: any) {
      console.error('Rollback failed:', error);
      result.errors.push(`Rollback failed: ${error.message}`);
      return result;
    }
  }

  // Load migration state by ID
  private loadMigrationStateById(migrationId: string): MigrationState | null {
    // In a production system, this would query a database
    // For now, we'll check if the current migration matches
    const currentState = this.loadMigrationState();
    return currentState?.id === migrationId ? currentState : null;
  }

  // Load backup data
  private loadBackup(backupId: string): any {
    try {
      // Try primary backup first
      let backup = localStorage.getItem(backupId);
      
      // Try secondary backup if primary fails
      if (!backup) {
        backup = localStorage.getItem(`${backupId}_secondary`);
      }

      return backup ? JSON.parse(backup) : null;
    } catch (error) {
      console.error('Failed to load backup:', error);
      return null;
    }
  }

  // Get migration progress
  getMigrationProgress(): MigrationState | null {
    return this.loadMigrationState();
  }

  // Clean up old backups
  cleanupOldBackups(maxAge: number = 30 * 24 * 60 * 60 * 1000): void { // 30 days default
    try {
      const backupIndex = this.getBackupIndex();
      const now = Date.now();
      const updatedIndex: Array<{id: string; timestamp: string; size: number}> = [];

      backupIndex.forEach(backup => {
        const backupTime = new Date(backup.timestamp).getTime();
        if (now - backupTime > maxAge) {
          // Remove old backups
          localStorage.removeItem(backup.id);
          localStorage.removeItem(`${backup.id}_secondary`);
        } else {
          updatedIndex.push(backup);
        }
      });

      localStorage.setItem('spinverse-backup-index', JSON.stringify(updatedIndex));
      
      console.log(`Cleaned up ${backupIndex.length - updatedIndex.length} old backups`);
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  // Get backup statistics
  getBackupStats(): { totalBackups: number; totalSize: number; oldestBackup: string | null } {
    const backupIndex = this.getBackupIndex();
    const totalBackups = backupIndex.length;
    const totalSize = backupIndex.reduce((sum, backup) => sum + backup.size, 0);
    const oldestBackup = backupIndex.length > 0 ? 
      backupIndex.reduce((oldest, current) => 
        new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest
      ).timestamp : null;

    return { totalBackups, totalSize, oldestBackup };
  }
}

// Export singleton instance
export const dataMigrationManager = DataMigrationManager.getInstance();

// Helper functions for component usage
export async function migrateAnonymousToAccount(anonymousData: AnonymousData): Promise<MigrationResult> {
  return dataMigrationManager.startMigration(anonymousData);
}

export async function rollbackToAnonymous(migrationId?: string): Promise<RollbackResult> {
  return dataMigrationManager.rollbackMigration(migrationId);
}

export function getMigrationProgress(): MigrationState | null {
  return dataMigrationManager.getMigrationProgress();
}

export function cleanupOldMigrationBackups(maxAgeDays: number = 30): void {
  dataMigrationManager.cleanupOldBackups(maxAgeDays * 24 * 60 * 60 * 1000);
}

export function getMigrationBackupStats() {
  return dataMigrationManager.getBackupStats();
}

export type { MigrationResult, RollbackResult, MigrationState };