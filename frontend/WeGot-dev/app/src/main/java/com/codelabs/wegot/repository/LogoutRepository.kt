package com.codelabs.wegot.repository

import com.codelabs.wegot.model.local.data.UserPreferences
import com.codelabs.wegot.model.remote.network.ApiResponse
import com.codelabs.wegot.model.remote.network.MainApiService
import javax.inject.Inject

class LogoutRepository @Inject constructor(
    private val api: MainApiService,
    private val userPreferences: UserPreferences
) {

    suspend fun logout(): ApiResponse<Unit> {
        return try {
            api.logout()
            userPreferences.clear()
            ApiResponse.Success(Unit)
        } catch (e: Exception) {
            ApiResponse.Error(e.message ?: "Unknown error")
        }
    }
}
