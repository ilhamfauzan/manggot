package com.codelabs.wegot.model.remote.response.prediksi

data class GetHasilPanenSiklusResponse(
	val data: List<DataItemPanenSiklus>,
	val success: Boolean
)

data class DataItemPanenSiklus(
	val createdAt: String,
	val estimatedValue: Double,
	val feedCost: Double,
	val faseId: Int,
	val hasilGram: Double,
	val id: Int,
	val hasilKg: Double,
	val conversionRate: Double,
	val conversionLabel: String,
	val roiEstimate: Double
)

