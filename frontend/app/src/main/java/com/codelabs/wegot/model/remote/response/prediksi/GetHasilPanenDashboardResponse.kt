package com.codelabs.wegot.model.remote.response.prediksi

data class GetHasilPanenDashboardResponse(
	val success: Boolean,
	val totalGram: Double,
	val totalKg: Double,
	val jumlahPrediksi: Int
)

