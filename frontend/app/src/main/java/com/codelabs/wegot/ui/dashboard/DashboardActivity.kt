package com.codelabs.wegot.ui.dashboard

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.codelabs.wegot.R
import com.codelabs.wegot.databinding.ActivityDashboardBinding
import com.codelabs.wegot.model.remote.network.MainApiService
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

@AndroidEntryPoint
class DashboardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityDashboardBinding
    private var currentTimeRange: String = "all"
    
    @Inject
    lateinit var apiService: MainApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        supportActionBar?.hide()

        setupToolbar()
        setupFilterChips()
        loadDashboardData()
    }

    private fun setupToolbar() {
        binding.topAppBar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun setupFilterChips() {
        binding.chipGroupFilter.setOnCheckedStateChangeListener { group, checkedIds ->
            if (checkedIds.isNotEmpty()) {
                currentTimeRange = when (checkedIds[0]) {
                    binding.chip7d.id -> "7d"
                    binding.chip30d.id -> "30d"
                    binding.chip90d.id -> "90d"
                    else -> "all"
                }
                loadDashboardData()
            }
        }
    }

    private fun loadDashboardData() {
        binding.progressAI.visibility = View.VISIBLE
        binding.tvRekomendasi.text = "Memuat analisis..."

        lifecycleScope.launch {
            try {
                val response = apiService.getDashboardSummary(currentTimeRange)

                // Update metrics
                binding.tvTotalPanen.text = "${String.format("%.1f", response.totalYield)} kg"
                binding.tvSampahDiolah.text = "${String.format("%.1f", response.totalWaste)} kg"
                binding.tvSiklusAktif.text = "${response.activeCycles}"
                binding.tvSiklusSelesai.text = "${response.completedCycles}"

                // Update AI recommendation
                binding.tvRekomendasi.text = response.aiRecommendation
                binding.progressAI.visibility = View.GONE

                // Update chart subtitle
                val subtitle = when (currentTimeRange) {
                    "7d" -> "7 Hari Terakhir"
                    "30d" -> "30 Hari Terakhir"
                    "90d" -> "90 Hari Terakhir"
                    else -> "7 Siklus Terakhir"
                }
                binding.tvChartSubtitle.text = subtitle

                // Setup chart
                setupChart(response.yieldChart)
                
                // Setup efficiency chart
                setupEfficiencyChart(response.efficiencyChart)

            } catch (e: Exception) {
                Toast.makeText(this@DashboardActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                binding.progressAI.visibility = View.GONE
                binding.tvRekomendasi.text = "Gagal memuat analisis. Silakan coba lagi."
                android.util.Log.e("DashboardActivity", "Error loading dashboard", e)
            }
        }
    }

    private fun setupChart(chartData: List<com.codelabs.wegot.model.remote.response.dashboard.ChartItem>) {
        val lineChart = binding.lineChart
        
        if (chartData.isEmpty()) {
            lineChart.visibility = View.GONE
            binding.tvChartSubtitle.text = "Belum ada data panen pada periode ini"
            return
        }
        
        lineChart.visibility = View.VISIBLE
        
        val chartMap = LinkedHashMap<String, Float>()
        chartData.forEach { item ->
            chartMap[item.label] = item.value.toFloat()
        }

        if (chartMap.isNotEmpty()) {
            try {
                lineChart.gradientFillColors = intArrayOf(
                    getColor(R.color.green),
                    getColor(android.R.color.transparent)
                )
                lineChart.animation.duration = 1000L
                lineChart.labelsFormatter = { value -> String.format("%.1f", value) }
                lineChart.animate(chartMap)
            } catch (e: Exception) {
                android.util.Log.e("DashboardActivity", "Chart error: ${e.message}")
                lineChart.visibility = View.GONE
            }
        }
    }

    private fun setupEfficiencyChart(chartData: List<com.codelabs.wegot.model.remote.response.dashboard.EfficiencyItem>?) {
        val lineChart = binding.lineChartEfficiency
        
        if (chartData.isNullOrEmpty()) {
            lineChart.visibility = View.GONE
            binding.tvEfficiencySubtitle.text = "Belum ada data efisiensi"
            return
        }
        
        lineChart.visibility = View.VISIBLE
        
        val chartMap = LinkedHashMap<String, Float>()
        chartData.forEach { item ->
            chartMap[item.label] = item.ratio
        }

        if (chartMap.isNotEmpty()) {
            try {
                lineChart.gradientFillColors = intArrayOf(
                    getColor(android.R.color.holo_orange_light),
                    getColor(android.R.color.transparent)
                )
                lineChart.animation.duration = 1000L
                lineChart.labelsFormatter = { value -> String.format("%.1f", value) }
                lineChart.animate(chartMap)
            } catch (e: Exception) {
                android.util.Log.e("DashboardActivity", "Efficiency Chart error: ${e.message}")
                lineChart.visibility = View.GONE
            }
        }
    }
}
