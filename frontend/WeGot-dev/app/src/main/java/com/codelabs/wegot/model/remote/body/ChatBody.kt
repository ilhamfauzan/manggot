package com.codelabs.wegot.model.remote.body

import kotlinx.serialization.Serializable

@Serializable
data class ChatBody(
    val question: String,
)
