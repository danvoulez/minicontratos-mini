// CEREBRO Memory System - Main Export
// Export all memory system components for easy import

export { MemoryManager } from "./manager";
export type { WorkingSetRequest } from "./manager";

export { RAGManager } from "./rag-manager";
export type { RAGSource, RAGSnippet, RAGCitation, RAGResult } from "./rag-manager";

export { getMetricsCollector, withMetrics } from "./metrics";
export type { MetricName } from "./metrics";

export { getAutoTuner } from "./autotuner";
export type { CacheConfig, PromotionConfig } from "./autotuner";

export { CerebroJobs } from "./jobs";

export { hasPermission, canPromote, getRolePermissions } from "./rbac";
export type { Role, Permission } from "./rbac";

export { encrypt, decrypt, shouldEncrypt } from "./encryption";
export type { SensitivityLevel } from "./encryption";

export { detectSchemaId, validateMemoryContent, getAvailableSchemas } from "./schema-registry";
export type { SchemaId } from "./schema-registry";

export {
  CEREBRO_V1,
  CEREBRO_TOKEN_BUDGET_TOTAL,
  CEREBRO_TOKEN_BUDGET_MODEL_RESERVE,
  CEREBRO_TTL_CONTEXT_MINUTES,
  CEREBRO_TTL_TEMPORARY_DAYS,
} from "./env";
