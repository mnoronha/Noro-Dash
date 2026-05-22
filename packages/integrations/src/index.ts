export interface AuthResult {
  externalAccountId: string;
  externalAccountName?: string;
  scopes: string[];
}

export interface TokenResult {
  tokenVaultKey: string;
  expiresAt?: string;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface SyncResult {
  rowsRead: number;
  rowsWritten: number;
}

export interface HealthStatus {
  status: "active" | "warning" | "expired" | "revoked" | "error";
  message?: string;
}

export interface IntegrationConnector {
  authenticate(): Promise<AuthResult>;
  refreshToken(): Promise<TokenResult>;
  syncIncremental(dateRange: DateRange): Promise<SyncResult>;
  backfill(daysBack: number): Promise<string>;
  healthCheck(): Promise<HealthStatus>;
  handleWebhook?(payload: unknown): Promise<void>;
}
