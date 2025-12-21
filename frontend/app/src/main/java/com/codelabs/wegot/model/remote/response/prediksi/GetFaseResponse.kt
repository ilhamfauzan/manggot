package com.codelabs.wegot.model.remote.response.prediksi

data class GetFaseResponse(
	val data: List<DataGetFase>,
	val success: Boolean
)

data class DataGetFase(
	val createdAt: String,
	val keterangan: String?,
	val siklusId: Int,
	val jenis: String,
	val prediksiPanen: Any?,
	val id: Int,
	val tanggal: String,
	val jumlahMakanan: Double?,
	val jumlahTelur: Int?
)

data class PrediksiPanen(
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

