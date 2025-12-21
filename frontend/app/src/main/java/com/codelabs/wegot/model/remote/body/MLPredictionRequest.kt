package com.codelabs.wegot.model.remote.body

data class PredictPenetasanRequest(
    val jumlah_telur_gram: Double,
    val media_telur: String,
    val temp: Double,
    val humidity: Double,
    val temp_max: Double,
    val weather_main: String,
    val season: String
)

data class PredictPanenRequest(
    val jumlah_telur_gram: Double,
    val makanan_gram: Double
)
