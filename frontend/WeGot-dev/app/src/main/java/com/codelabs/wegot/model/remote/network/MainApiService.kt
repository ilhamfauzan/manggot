package com.codelabs.wegot.model.remote.network

import com.codelabs.wegot.model.remote.body.AddFasePembesaranRequest
import com.codelabs.wegot.model.remote.body.AddFaseRequest
import com.codelabs.wegot.model.remote.body.AddSiklusRequest
import com.codelabs.wegot.model.remote.body.ChatBody
import com.codelabs.wegot.model.remote.body.LoginRequest
import com.codelabs.wegot.model.remote.body.RegisterRequest
import com.codelabs.wegot.model.remote.body.addHistoryRequest
import com.codelabs.wegot.model.remote.response.auth.LogoutResponse
import com.codelabs.wegot.model.remote.response.auth.login.LoginResponse
import com.codelabs.wegot.model.remote.response.auth.register.RegisterResponse
import com.codelabs.wegot.model.remote.response.chatbot.ChatbotResponse
import com.codelabs.wegot.model.remote.response.hitoryPencacahan.AddHistoryPencacahanResponse
import com.codelabs.wegot.model.remote.response.hitoryPencacahan.GetHistoryPencacahanResponse
import com.codelabs.wegot.model.remote.response.notification.MarkAsReadResponse
import com.codelabs.wegot.model.remote.response.notification.NotificationResponse
import com.codelabs.wegot.model.remote.response.prediksi.AddFaseResponse
import com.codelabs.wegot.model.remote.response.prediksi.AddSiklusResponse
import com.codelabs.wegot.model.remote.response.prediksi.GetFaseResponse
import com.codelabs.wegot.model.remote.response.prediksi.GetHasilPanenDashboardResponse
import com.codelabs.wegot.model.remote.response.prediksi.GetHasilPanenSiklusResponse
import com.codelabs.wegot.model.remote.response.prediksi.GetSiklusResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface MainApiService {

    @POST("api/auth/register")
    suspend fun register(
        @Body registerRequest: RegisterRequest
    ): RegisterResponse

    @POST("api/auth/login")
    suspend fun login(
        @Body loginRequest: LoginRequest
    ): LoginResponse

    @POST ("api/siklus")
    suspend fun addSiklus(
        @Body siklusRequest: AddSiklusRequest
    ): AddSiklusResponse

    @POST ("api/siklus/{siklusId}/fase")
    suspend fun addFase(
        @Path("siklusId") siklusId: Int,
        @Body faseRequest: AddFaseRequest
    ): AddFaseResponse

    @POST ("api/siklus/{siklusId}/fase")
    suspend fun addFasePembesaran(
        @Path("siklusId") siklusId: Int,
        @Body faseRequest: AddFasePembesaranRequest
    ): AddFaseResponse

    @POST ("api/siklus/{siklusId}/fase")
    suspend fun addFasePanen(
        @Path("siklusId") siklusId: Int,
        @Body faseRequest: AddFaseRequest
    ): AddFaseResponse

    @GET ("api/siklus/{siklusId}/fase")
    suspend fun getFase(
        @Path("siklusId") siklusId: Int,
    ): GetFaseResponse

    @GET("api/siklus")
    suspend fun getSiklus(): GetSiklusResponse

    @POST ("api/pencacahan")
    suspend fun addHistoryPencacahan(
        @Body historyRequest: addHistoryRequest
    ): AddHistoryPencacahanResponse

    @GET("api/pencacahan")
    suspend fun getHistoryPencacahan(): GetHistoryPencacahanResponse

    @GET ("api/prediksi/siklus/{siklusId}")
    suspend fun getHasilPanenSiklus(
        @Path("siklusId") siklusId: Int,
    ): GetHasilPanenSiklusResponse

    @GET ("api/prediksi/total")
    suspend fun getHasilPanenDashboard(): GetHasilPanenDashboardResponse

    @POST("api/auth/logout")
    suspend fun logout(): LogoutResponse

    @GET("api/notifikasi")
    suspend fun getNotifikasi(): NotificationResponse

    @PATCH("api/notifikasi/{id}/read")
    suspend fun markAsRead(
        @Path("id") id: Int
    ): MarkAsReadResponse


}