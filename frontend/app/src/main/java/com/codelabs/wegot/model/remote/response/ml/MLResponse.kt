package com.codelabs.wegot.model.remote.response.ml

data class MLHealthResponse(
    val success: Boolean,
    val flask_status: FlaskStatus
)

data class FlaskStatus(
    val status: String,
    val timestamp: String,
    val service: String,
    val version: String
)

data class MLInfoResponse(
    val penetasan_model: PenetasanModelInfo,
    val panen_model: PanenModelInfo
)

data class PenetasanModelInfo(
    val name: String,
    val accuracy: String,
    val cv_score: String,
    val num_features: Int,
    val media_options: List<String>,
    val weather_options: List<String>,
    val season_options: List<String>
)

data class PanenModelInfo(
    val name: String,
    val r2_score: String,
    val mae: String,
    val mape: String
)

data class PredictPenetasanResponse(
    val success: Boolean,
    val data: PenetasanPredictionData
)

data class PenetasanPredictionData(
    val prediction: PenetasanPrediction,
    val probabilities: Map<String, Double>,
    val input_summary: Map<String, String>,
    val recommendations: List<String>,
    val timestamp: String
)

data class PenetasanPrediction(
    val lama_penetasan_hari: Int,
    val confidence: Double,
    val confidence_label: String
)

data class PredictPanenResponse(
    val success: Boolean,
    val data: PanenPredictionData
)

data class PanenPredictionData(
    val prediction: PanenPrediction,
    val input_summary: Map<String, String>,
    val business_metrics: BusinessMetrics,
    val recommendations: List<String>,
    val timestamp: String
)

data class PanenPrediction(
    val jumlah_panen_gram: Double,
    val jumlah_panen_kg: Double,
    val conversion_rate: Double,
    val conversion_label: String
)

data class BusinessMetrics(
    val roi_estimate: Double,
    val estimated_value: String,
    val feed_cost: String
)
