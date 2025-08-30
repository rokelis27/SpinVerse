// Database types for SpinVerse authentication and subscription system

export interface DatabaseUser {
  id: string;
  clerk_user_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  subscription_tier: 'FREE' | 'PRO';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_start_date?: string;
  subscription_end_date?: string;
  total_spins: number;
  daily_ai_generations: number;
  last_ai_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserSequence {
  id: string;
  user_id: string;
  sequence_data: any; // JSONB - flexible sequence data
  name: string;
  description?: string;
  is_public: boolean;
  base_template?: string;
  version: string;
  play_count: number;
  last_played_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserStats {
  id: string;
  user_id: string;
  date: string;
  spins_count: number;
  sequences_completed: number;
  ai_stories_generated: number;
  time_spent_minutes: number;
  sequences_created: number;
  sequences_played: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSubscriptionFeature {
  id: string;
  tier: 'FREE' | 'PRO';
  feature_name: string;
  limit_value?: number; // null means unlimited
  description?: string;
  created_at: string;
}

export interface DatabaseSequencePlay {
  id: string;
  user_id: string;
  sequence_id: string;
  results: any; // JSONB - complete play results
  narrative?: string;
  completion_status: 'completed' | 'abandoned' | 'error';
  total_time_seconds?: number;
  steps_completed: number;
  total_steps: number;
  started_at: string;
  completed_at?: string;
}

export interface DatabaseBillingEvent {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  event_type: string;
  event_data?: any; // JSONB - raw Stripe event data
  amount?: number; // in cents
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  processed_at?: string;
}

export interface DatabaseFeatureUsageLog {
  id: string;
  user_id: string;
  feature_name: string;
  action: string;
  resource_id?: string;
  metadata?: any; // JSONB - additional context
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// View types (computed/aggregated data)
export interface UserSummaryView {
  id: string;
  clerk_user_id: string;
  email: string;
  name?: string;
  subscription_tier: 'FREE' | 'PRO';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  total_spins: number;
  daily_ai_generations: number;
  created_at: string;
  saved_sequences_count: number;
  total_plays: number;
  total_time_spent: number;
}

export interface PopularSequenceView {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  play_count: number;
  created_at: string;
  creator_name?: string;
  detailed_play_count: number;
  avg_play_time?: number;
}

// API request/response types
export interface CreateUserRequest {
  clerk_user_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar_url?: string;
  subscription_tier?: 'FREE' | 'PRO';
  subscription_status?: 'active' | 'inactive' | 'cancelled';
}

export interface CreateSequenceRequest {
  sequence_data: any;
  name: string;
  description?: string;
  is_public?: boolean;
  base_template?: string;
}

export interface UpdateSequenceRequest {
  sequence_data?: any;
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface RecordPlayRequest {
  sequence_id: string;
  results: any;
  narrative?: string;
  completion_status: 'completed' | 'abandoned' | 'error';
  total_time_seconds?: number;
  steps_completed: number;
  total_steps: number;
}

export interface LogFeatureUsageRequest {
  feature_name: string;
  action: string;
  resource_id?: string;
  metadata?: any;
}

// Feature limits mapping
export const FEATURE_LIMITS = {
  FREE: {
    max_sequence_steps: 10,
    max_saved_sequences: 5,
    max_wheel_options: 20,
    daily_ai_generations: 3,
    export_formats: 1,
  },
  PRO: {
    max_sequence_steps: 50,
    max_saved_sequences: 100,
    max_wheel_options: 100,
    daily_ai_generations: 50, // 50 per day
    export_formats: null, // unlimited
    collaboration_features: true,
    advanced_analytics: true,
    priority_support: true,
  }
} as const;

// Utility types
export type SubscriptionTier = 'FREE' | 'PRO';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled';
export type PlayCompletionStatus = 'completed' | 'abandoned' | 'error';
export type BillingEventStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Type guards
export function isValidSubscriptionTier(tier: string): tier is SubscriptionTier {
  return ['FREE', 'PRO'].includes(tier);
}

export function isValidSubscriptionStatus(status: string): status is SubscriptionStatus {
  return ['active', 'inactive', 'cancelled'].includes(status);
}

export function isValidPlayCompletionStatus(status: string): status is PlayCompletionStatus {
  return ['completed', 'abandoned', 'error'].includes(status);
}