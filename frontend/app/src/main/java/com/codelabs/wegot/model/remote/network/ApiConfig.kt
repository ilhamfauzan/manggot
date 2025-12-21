package com.codelabs.wegot.model.remote.network

import com.codelabs.wegot.model.local.data.UserPreferences
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class ApiConfig {
    companion object {
        // Production URL
        private const val BASE_URL = "https://maggot-api.onrender.com/"

        // Development URL (uncomment for local testing)
        // private const val BASE_URL = "http://10.0.2.2:5001/"

        private fun createOkHttpClient(userPreferences: UserPreferences): OkHttpClient {
            val loggingInterceptor = HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY)

            val authInterceptor = Interceptor { chain ->
                val original = chain.request()
                val token = runBlocking { userPreferences.getAuthToken().firstOrNull().orEmpty() }

                val requestBuilder = original.newBuilder()
                    .addHeader("Content-Type", "application/json")
                if (token.isNotEmpty()) {
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }

                val request = requestBuilder.build()
                chain.proceed(request)
            }

            return OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .addInterceptor(authInterceptor)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()
        }

        fun getMainApiService(userPreferences: UserPreferences): MainApiService {
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .client(createOkHttpClient(userPreferences))
                .build()

            return retrofit.create(MainApiService::class.java)
        }

        fun getChatbotApiService(userPreferences: UserPreferences): ChatbotApiService {
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .client(createOkHttpClient(userPreferences))
                .build()

            return retrofit.create(ChatbotApiService::class.java)
        }

        fun getFlaskApiService(userPreferences: UserPreferences): FlaskApiService {
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .client(createOkHttpClient(userPreferences))
                .build()

            return retrofit.create(FlaskApiService::class.java)
        }
    }
}
