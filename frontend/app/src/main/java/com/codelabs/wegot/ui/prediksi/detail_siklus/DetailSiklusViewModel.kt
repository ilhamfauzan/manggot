package com.codelabs.wegot.ui.prediksi.detail_siklus

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.codelabs.wegot.model.remote.network.ApiResponse
import com.codelabs.wegot.model.remote.response.prediksi.GetFaseResponse
import com.codelabs.wegot.repository.PrediksiRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DetailSiklusViewModel @Inject constructor(
    private val repository: PrediksiRepository
) : ViewModel() {

    private val _faseData = MutableLiveData<ApiResponse<GetFaseResponse>>()
    val faseData: LiveData<ApiResponse<GetFaseResponse>> = _faseData

    fun getFase(siklusId: Int) {
        viewModelScope.launch {
            _faseData.value = ApiResponse.Empty
            val result = repository.getFase(siklusId)
            
            // ✅ DEBUG: Log response
            if (result is ApiResponse.Success) {
                Log.d("DetailSiklusVM", "=== GET FASE SUCCESS ===")
                result.data.data.forEach { fase ->
                    Log.d("DetailSiklusVM", "Fase: ${fase.jenis}, ID: ${fase.id}")
                    Log.d("DetailSiklusVM", "  prediksiPanen: ${fase.prediksiPanen}")
                    Log.d("DetailSiklusVM", "  prediksiPanen null? ${fase.prediksiPanen == null}")
                }
            } else if (result is ApiResponse.Error) {
                Log.e("DetailSiklusVM", "❌ GET FASE ERROR: ${result.errorMessage}")
            }
            
            _faseData.value = result
        }
    }
}
