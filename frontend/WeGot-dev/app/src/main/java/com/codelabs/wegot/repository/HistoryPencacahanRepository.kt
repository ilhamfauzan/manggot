package com.codelabs.wegot.repository

import com.codelabs.wegot.model.remote.body.addHistoryRequest
import com.codelabs.wegot.model.remote.response.RemoteDataSource
import com.codelabs.wegot.model.remote.response.hitoryPencacahan.AddHistoryPencacahanResponse
import com.codelabs.wegot.model.remote.response.hitoryPencacahan.GetHistoryPencacahanResponse
import javax.inject.Inject

class HistoryPencacahanRepository @Inject constructor(
    private val remoteDataSource: RemoteDataSource
) {
    suspend fun addHistoryPencacahan(
        tanggalWaktu: String,
        totalSampah: Double,
        catatan: String
    ): AddHistoryPencacahanResponse {
        return remoteDataSource.addHistoryPencacahan(tanggalWaktu, totalSampah, catatan)
    }

    suspend fun getHistoryPencacahan(): GetHistoryPencacahanResponse {
        return remoteDataSource.getHistoryPencacahan()
    }
}
