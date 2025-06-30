import { NextRequest, NextResponse } from "next/server";
import { metricsStore, evaluateClassificationPerformance } from "../../lib/weather";

// Type for the metrics API response
type MetricsApiResponse = {
  timestamp: string;
  relevance: {
    totalQueries: number;
    relevantQueries: number;
    irrelevantQueries: number;
    accuracyRate: number;
    rejectionRate: number;
    averageConfidence: number;
    falsePositives: number;
    falseNegatives: number;
    levelDistribution: Record<string, number>;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    averageTokensUsed: number;
    totalInteractions: number;
  };
  evaluation: {
    alertLevel: string;
    issues: string[];
    recommendation: string;
  };
  recentInteractions?: Array<{
    timestamp: string;
    query: string;
    relevanceLevel: string;
    confidence: number;
    responseTime: number;
    success: boolean;
    weatherDataRetrieved: boolean;
    errorOccurred: boolean;
  }>;
};

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get("hours") || "24");
    const detailed = searchParams.get("detailed") === "true";

    // Get basic metrics
    const relevanceStats = metricsStore.getRelevanceStats();
    const performanceStats = metricsStore.getPerformanceSummary();
    const evaluation = evaluateClassificationPerformance();

    // Prepare response data
    const metricsData: MetricsApiResponse = {
      timestamp: new Date().toISOString(),
      relevance: {
        totalQueries: relevanceStats.totalQueries,
        relevantQueries: relevanceStats.relevantQueries,
        irrelevantQueries: relevanceStats.irrelevantQueries,
        accuracyRate: Math.round(relevanceStats.accuracyRate * 100),
        rejectionRate: Math.round(relevanceStats.rejectionRate * 100),
        averageConfidence: Math.round(relevanceStats.averageConfidence * 100),
        falsePositives: relevanceStats.falsePositives,
        falseNegatives: relevanceStats.falseNegatives,
        levelDistribution: relevanceStats.levelDistribution,
      },
      performance: {
        averageResponseTime: performanceStats.averageResponseTime,
        successRate: Math.round(performanceStats.successRate * 100),
        averageTokensUsed: performanceStats.averageTokensUsed,
        totalInteractions: performanceStats.totalInteractions,
      },
      evaluation: {
        alertLevel: evaluation.alertLevel,
        issues: evaluation.issues,
        recommendation: evaluation.recommendation,
      },
    };

    // Add detailed data if requested
    if (detailed) {
      const recentMetrics = metricsStore.getRecentMetrics(hours);
      metricsData.recentInteractions = recentMetrics.map((m) => ({
        timestamp: m.timestamp.toISOString(),
        query: m.userQuery.substring(0, 100) + (m.userQuery.length > 100 ? "..." : ""),
        relevanceLevel: m.relevanceClassification.level,
        confidence: Math.round(m.relevanceClassification.confidence * 100),
        responseTime: m.performanceMetrics.responseTimeMs,
        success: m.performanceMetrics.completedSuccessfully,
        weatherDataRetrieved: m.weatherDataRetrieved,
        errorOccurred: m.errorOccurred,
      }));
    }

    return NextResponse.json(metricsData);
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json({ error: "Failed to retrieve metrics" }, { status: 500 });
  }
}

// POST endpoint for recording user feedback about classification accuracy
export async function POST(request: NextRequest) {
  try {
    const { isClassificationWrong, actuallyWeatherRelated } = await request.json();

    if (typeof isClassificationWrong !== "boolean" || typeof actuallyWeatherRelated !== "boolean") {
      return NextResponse.json({ error: "Invalid feedback data. Expected boolean values." }, { status: 400 });
    }

    // Record the user correction
    metricsStore.recordUserCorrection(isClassificationWrong, actuallyWeatherRelated);

    return NextResponse.json({
      success: true,
      message: "Feedback recorded successfully",
    });
  } catch (error) {
    console.error("Metrics feedback API error:", error);
    return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
