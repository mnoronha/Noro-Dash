export interface AiInsightInput {
  accountName: string;
  periodLabel: string;
  metrics: Record<string, number | string | null>;
}

export interface AiInsight {
  title: string;
  body: string;
  severity?: "info" | "warning" | "critical";
}
