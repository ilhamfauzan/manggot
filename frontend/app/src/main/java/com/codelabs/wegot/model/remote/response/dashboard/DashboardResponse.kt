package com.codelabs.wegot.model.remote.response.dashboard

import com.google.gson.annotations.SerializedName

data class DashboardResponse(
    @SerializedName("totalYield")
    val totalYield: Double,

    @SerializedName("totalWaste")
    val totalWaste: Double,

    @SerializedName("activeCycles")
    val activeCycles: Int,

    @SerializedName("avgConversionRate")
    val avgConversionRate: Double,

    @SerializedName("yieldChart")
    val yieldChart: List<ChartItem>,

    @SerializedName("wasteChart")
    val wasteChart: List<ChartItem>,

    @SerializedName("aiRecommendation")
    val aiRecommendation: String,

    @SerializedName("efficiencyChart")
    val efficiencyChart: List<EfficiencyItem>?
)

data class EfficiencyItem(
    @SerializedName("label")
    val label: String,
    @SerializedName("yield")
    val yield: Float,
    @SerializedName("feed")
    val feed: Float,
    @SerializedName("ratio")
    val ratio: Float
)

data class ChartItem(
    @SerializedName("label")
    val label: String,

    @SerializedName("value")
    val value: Float,

    @SerializedName("date")
    val date: String
)
