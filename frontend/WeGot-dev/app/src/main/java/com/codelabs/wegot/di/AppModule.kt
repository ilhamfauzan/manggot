package com.codelabs.wegot.di

import android.content.Context
import com.codelabs.wegot.model.local.data.UserPreferences
import com.codelabs.wegot.model.remote.network.ApiConfig
import com.codelabs.wegot.model.remote.network.MainApiService
import com.codelabs.wegot.model.remote.network.ChatbotApiService
import com.codelabs.wegot.model.remote.network.FlaskApiService
import com.codelabs.wegot.model.remote.response.RemoteDataSource
import com.codelabs.wegot.repository.PrediksiRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    fun provideMainApiService(userPreferences: UserPreferences): MainApiService {
        return ApiConfig.getMainApiService(userPreferences)
    }

    @Provides
    fun provideChatbotApiService(): ChatbotApiService {
        return ApiConfig.getChatbotApiService()
    }

    @Provides
    fun provideFlaskApiService(): FlaskApiService {
        return ApiConfig.getFlaskApiService()
    }

    @Provides
    @Singleton
    fun provideUserPreferences(@ApplicationContext context: Context): UserPreferences =
        UserPreferences(context)

    @Provides
    fun providePrediksiRepository(
        remoteDataSource: RemoteDataSource,
    ): PrediksiRepository {
        return PrediksiRepository(remoteDataSource)
    }
}