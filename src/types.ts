export type EntryType = 
  | "hydration" 
  | "food" 
  | "medication" 
  | "mood" 
  | "energy" 
  | "sleep" 
  | "exercise" 
  | "mindfulness" 
  | "vitals" 
  | "reflection";

export type SourceType = "voice" | "watch" | "shortcut" | "manual" | "healthkit";

export interface Entry {
  id?: string;
  userId: string;
  type: EntryType;
  timestamp: string;
  value: string;
  unit?: string;
  notes?: string;
  source: SourceType;
  confidence?: number;
  rawTranscription?: string;
  createdAt: any;
}

export interface Goal {
  id?: string;
  userId: string;
  type: "hydration" | "medication" | "sleep" | "exercise";
  targetValue: number;
  unit: string;
  frequency: "daily" | "weekly";
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: {
    dailyHydrationGoal?: number;
    dailySleepGoal?: number;
  };
  createdAt: any;
  updatedAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
