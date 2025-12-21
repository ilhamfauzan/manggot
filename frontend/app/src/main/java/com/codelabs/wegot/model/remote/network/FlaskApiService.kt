package com.codelabs.wegot.model.remote.network

import com.codelabs.wegot.model.remote.body.PredictPanenRequest
import com.codelabs.wegot.model.remote.body.PredictPenetasanRequest
import com.codelabs.wegot.model.remote.response.ml.MLHealthResponse
import com.codelabs.wegot.model.remote.response.ml.MLInfoResponse
import com.codelabs.wegot.model.remote.response.ml.PredictPanenResponse
import com.codelabs.wegot.model.remote.response.ml.PredictPenetasanResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface FlaskApiService {
    
    @GET("api/ml/health")
    suspend fun checkHealth(): MLHealthResponse
    
    @GET("api/ml/info")
    suspend fun getModelInfo(): MLInfoResponse
    
    @POST("api/ml/predict/penetasan")
    suspend fun predictPenetasan(
        @Body request: PredictPenetasanRequest
    ): PredictPenetasanResponse
    
    @POST("api/ml/predict/panen")
    suspend fun predictPanen(
        @Body request: PredictPanenRequest
    ): PredictPanenResponse
}