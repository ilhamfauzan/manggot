package com.codelabs.wegot.model.remote.body

data class RegisterRequest(
    val username: String,
    val rw: String,
    val password: String
)