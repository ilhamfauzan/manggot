package com.codelabs.wegot.repository

import com.codelabs.wegot.model.remote.response.RemoteDataSource
import com.codelabs.wegot.model.remote.response.hitoryPencacahan.AddHistoryPencacahanResponse
import com.codelabs.wegot.model.remote.response.hitoryPencacahan.GetHistoryPencacahanResponse
import com.codelabs.wegot.model.remote.response.notification.NotificationResponse
import javax.inject.Inject

class NotificationRepository @Inject constructor(
    private val remoteDataSource: RemoteDataSource
) {
    suspend fun notificationRepository(): NotificationResponse {
        return remoteDataSource.getNotification()
    }

    suspend fun markAsRead(id: Int): Boolean {
        return remoteDataSource.markAsRead(id)
    }

}