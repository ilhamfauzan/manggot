package com.codelabs.wegot.model.remote.body

data class AddSiklusRequest(
    val tanggalMulai: String,
    val jumlahTelur: Int,
    val mediaTelur: String,
    val catatan: String
)
