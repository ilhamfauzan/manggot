package com.codelabs.wegot.model.remote.network

import com.codelabs.wegot.model.remote.body.ChatBody
import com.codelabs.wegot.model.remote.response.chatbot.ChatbotResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface ChatbotApiService {

    @POST ("api/chatbot/chat")
    suspend fun getChatResponse(
        @Body chatBody: ChatBody
    ): ChatbotResponse

}