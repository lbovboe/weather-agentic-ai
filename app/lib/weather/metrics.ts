import { RelevanceLevel, RelevanceResult } from "./relevanceClassifier";

// Metrics data structures
export interface RelevanceMetrics {
  totalQueries: number;
  relevantQueries: number;
  irrelevantQueries: number;
  classificationTimeMs: number;
  confidenceScores: number[];
  levelDistribution: Record<RelevanceLevel, number>;
  falsePositives: number; // Non-weather classified as weather
  falseNegatives: number; // Weather classified as non-weather
  userCorrections: number; // User indicated classification was wrong
}

export interface PerformanceMetrics {
  responseTimeMs: number;
  toolCallsExecuted: number;
  tokensUsed: number;
  userSatisfaction?: number; // 1-5 scale if feedback available
  completedSuccessfully: boolean;
}

export interface ConversationMetrics {
  sessionId: string;
  timestamp: Date;
  userQuery: string;
  relevanceClassification: RelevanceResult;
  performanceMetrics: PerformanceMetrics;
  weatherDataRetrieved: boolean;
  errorOccurred: boolean;
  userFeedback?: {
    helpful: boolean;
    accurate: boolean;
    appropriate: boolean;
    comments?: string;
  };
}

// Type definitions for method return types
export type EnhancedRelevanceMetrics = RelevanceMetrics & {
  accuracyRate: number;
  averageConfidence: number;
  rejectionRate: number;
};

export type PerformanceSummary = {
  averageResponseTime: number;
  successRate: number;
  averageTokensUsed: number;
  totalInteractions: number;
};

export type MetricsExport = {
  relevanceStats: EnhancedRelevanceMetrics;
  performanceStats: PerformanceSummary;
  recentInteractions: ConversationMetrics[];
};

// In-memory metrics store (in production, use Redis or database)
class MetricsStore {
  private metrics: ConversationMetrics[] = [];
  private relevanceStats: RelevanceMetrics = {
    totalQueries: 0,
    relevantQueries: 0,
    irrelevantQueries: 0,
    classificationTimeMs: 0,
    confidenceScores: [],
    levelDistribution: {
      [RelevanceLevel.HIGHLY_RELEVANT]: 0,
      [RelevanceLevel.RELEVANT]: 0,
      [RelevanceLevel.NEUTRAL]: 0,
      [RelevanceLevel.IRRELEVANT]: 0,
    },
    falsePositives: 0,
    falseNegatives: 0,
    userCorrections: 0,
  };

  // Record a new conversation interaction
  recordInteraction(interaction: ConversationMetrics): void {
    this.metrics.push(interaction);
    this.updateRelevanceStats(interaction.relevanceClassification);

    // Keep only last 1000 interactions in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log detailed interaction for debugging
    console.log("📊 Interaction Recorded:", {
      timestamp: interaction.timestamp.toISOString(),
      query: interaction.userQuery.substring(0, 50) + "...",
      relevant: interaction.relevanceClassification.isRelevant,
      level: interaction.relevanceClassification.level,
      confidence: interaction.relevanceClassification.confidence,
      responseTime: interaction.performanceMetrics.responseTimeMs,
      success: interaction.performanceMetrics.completedSuccessfully,
    });
  }

  // Update relevance statistics
  private updateRelevanceStats(classification: RelevanceResult): void {
    this.relevanceStats.totalQueries++;
    this.relevanceStats.confidenceScores.push(classification.confidence);
    this.relevanceStats.levelDistribution[classification.level]++;

    if (classification.isRelevant) {
      this.relevanceStats.relevantQueries++;
    } else {
      this.relevanceStats.irrelevantQueries++;
    }
  }

  // Record user feedback about classification accuracy
  recordUserCorrection(isClassificationWrong: boolean, actuallyWeatherRelated: boolean): void {
    this.relevanceStats.userCorrections++;

    if (isClassificationWrong) {
      if (actuallyWeatherRelated) {
        this.relevanceStats.falseNegatives++; // We rejected weather query
      } else {
        this.relevanceStats.falsePositives++; // We accepted non-weather query
      }
    }

    console.log("🔄 User Correction Recorded:", {
      wrong: isClassificationWrong,
      actuallyWeather: actuallyWeatherRelated,
      falsePositives: this.relevanceStats.falsePositives,
      falseNegatives: this.relevanceStats.falseNegatives,
    });
  }

  // Get current relevance statistics
  getRelevanceStats(): EnhancedRelevanceMetrics {
    const avgConfidence =
      this.relevanceStats.confidenceScores.length > 0
        ? this.relevanceStats.confidenceScores.reduce((a, b) => a + b, 0) / this.relevanceStats.confidenceScores.length
        : 0;

    const totalErrors = this.relevanceStats.falsePositives + this.relevanceStats.falseNegatives;
    const accuracyRate =
      this.relevanceStats.totalQueries > 0
        ? (this.relevanceStats.totalQueries - totalErrors) / this.relevanceStats.totalQueries
        : 1;

    const rejectionRate =
      this.relevanceStats.totalQueries > 0
        ? this.relevanceStats.irrelevantQueries / this.relevanceStats.totalQueries
        : 0;

    return {
      ...this.relevanceStats,
      accuracyRate,
      averageConfidence: avgConfidence,
      rejectionRate,
    };
  }

  // Get recent conversation metrics
  getRecentMetrics(hours: number = 24): ConversationMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp >= cutoff);
  }

  // Get performance summary
  getPerformanceSummary(): PerformanceSummary {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 0,
        averageTokensUsed: 0,
        totalInteractions: 0,
      };
    }

    const avgResponseTime =
      this.metrics.reduce((sum, m) => sum + m.performanceMetrics.responseTimeMs, 0) / this.metrics.length;
    const successCount = this.metrics.filter((m) => m.performanceMetrics.completedSuccessfully).length;
    const successRate = successCount / this.metrics.length;
    const avgTokens = this.metrics.reduce((sum, m) => sum + m.performanceMetrics.tokensUsed, 0) / this.metrics.length;

    return {
      averageResponseTime: Math.round(avgResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      averageTokensUsed: Math.round(avgTokens),
      totalInteractions: this.metrics.length,
    };
  }

  // Export metrics for analysis
  exportMetrics(): MetricsExport {
    return {
      relevanceStats: this.getRelevanceStats(),
      performanceStats: this.getPerformanceSummary(),
      recentInteractions: this.getRecentMetrics(24),
    };
  }
}

// Global metrics instance
export const metricsStore = new MetricsStore();

// Helper function to create interaction record
export function createInteractionRecord(
  sessionId: string,
  userQuery: string,
  relevanceClassification: RelevanceResult,
  performanceMetrics: PerformanceMetrics,
  weatherDataRetrieved: boolean = false,
  errorOccurred: boolean = false
): ConversationMetrics {
  return {
    sessionId,
    timestamp: new Date(),
    userQuery,
    relevanceClassification,
    performanceMetrics,
    weatherDataRetrieved,
    errorOccurred,
  };
}

// Metrics evaluation functions
export function evaluateClassificationPerformance(): {
  recommendation: string;
  alertLevel: "low" | "medium" | "high";
  issues: string[];
} {
  const stats = metricsStore.getRelevanceStats();
  const issues: string[] = [];
  let alertLevel: "low" | "medium" | "high" = "low";

  // Check accuracy rate
  if (stats.accuracyRate < 0.9) {
    issues.push(`Classification accuracy is ${(stats.accuracyRate * 100).toFixed(1)}% (target: >90%)`);
    alertLevel = "high";
  }

  // Check false positive rate
  const fpRate = stats.totalQueries > 0 ? stats.falsePositives / stats.totalQueries : 0;
  if (fpRate > 0.05) {
    issues.push(`High false positive rate: ${(fpRate * 100).toFixed(1)}% (target: <5%)`);
    if (alertLevel !== "high") alertLevel = "medium";
  }

  // Check confidence levels
  if (stats.averageConfidence < 0.8) {
    issues.push(`Low average confidence: ${(stats.averageConfidence * 100).toFixed(1)}% (target: >80%)`);
    if (alertLevel === "low") alertLevel = "medium";
  }

  // Check rejection rate
  if (stats.rejectionRate > 0.3) {
    issues.push(`High rejection rate: ${(stats.rejectionRate * 100).toFixed(1)}% (may be too strict)`);
    if (alertLevel === "low") alertLevel = "medium";
  }

  let recommendation = "Classification performance is optimal.";
  if (issues.length > 0) {
    recommendation = "Consider adjusting classification parameters or retraining with more examples.";
  }

  return {
    recommendation,
    alertLevel,
    issues,
  };
}

// Log metrics summary periodically
export function logMetricsSummary(): void {
  const relevanceStats = metricsStore.getRelevanceStats();
  const performanceStats = metricsStore.getPerformanceSummary();
  const evaluation = evaluateClassificationPerformance();

  console.log("📈 Weather Assistant Metrics Summary:", {
    relevance: {
      totalQueries: relevanceStats.totalQueries,
      accuracyRate: `${(relevanceStats.accuracyRate * 100).toFixed(1)}%`,
      rejectionRate: `${(relevanceStats.rejectionRate * 100).toFixed(1)}%`,
      avgConfidence: `${(relevanceStats.averageConfidence * 100).toFixed(1)}%`,
    },
    performance: {
      avgResponseTime: `${performanceStats.averageResponseTime}ms`,
      successRate: `${(performanceStats.successRate * 100).toFixed(1)}%`,
      totalInteractions: performanceStats.totalInteractions,
    },
    evaluation: {
      alertLevel: evaluation.alertLevel,
      issues: evaluation.issues,
    },
    timestamp: new Date().toISOString(),
  });
}
