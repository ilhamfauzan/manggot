package com.codelabs.wegot.ui.pencatatan_history

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.codelabs.wegot.R
import com.codelabs.wegot.databinding.FragmentPencatatanHistoryBinding
import com.codelabs.wegot.model.local.data.UserPreferences
import com.codelabs.wegot.model.remote.network.ApiResponse
import com.codelabs.wegot.model.remote.response.hitoryPencacahan.DataItem
import com.codelabs.wegot.ui.adapter.HistoryAdapter
import com.codelabs.wegot.ui.auth.login.LoginActivity
import com.codelabs.wegot.ui.auth.login.LoginViewModel
import com.codelabs.wegot.ui.notifications.NotificationsActivity
import com.codelabs.wegot.ui.pencatatan_history.detail_pencatatan_history.HistoryDetailActivity
import com.codelabs.wegot.ui.pencatatan_history.tambah_riwayat.TambahRiwayatActivity
import com.codelabs.wegot.utils.DateTimeUtils.getDayName
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import kotlin.getValue

@AndroidEntryPoint
class PencatatanHistoryFragment : Fragment() {

    private var _binding: FragmentPencatatanHistoryBinding? = null
    private val binding get() = _binding!!

    private val historyAdapter = HistoryAdapter()
    private val loginViewModel: LoginViewModel by viewModels()
    private val viewModel: PencatatanHistoryViewModel by viewModels()

    private val addHistoryLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            viewModel.getHistoryPencacahan()
        }
    }


    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentPencatatanHistoryBinding.inflate(inflater, container, false)
        val root: View = binding.root
        return root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupLogout()
        observeLogout()
        setupClickListeners()
        setupObservers()
        viewModel.getHistoryPencacahan()
    }

    private fun setupObservers() {
        viewModel.historyData.observe(viewLifecycleOwner) { response ->
            if (response.data.isEmpty()) {
                showEmptyState(true)
            } else {
                binding.rvPrediksiSiklus.visibility = View.VISIBLE
                binding.layoutEmptyState.root.visibility = View.GONE

                historyAdapter.setItems(response.data)
                setupLineChart(response.data.map {
                    DataItem(
                        tanggalWaktu = it.tanggalWaktu,
                        totalSampah = it.totalSampah
                    )
                })
            }
        }

        viewModel.errorMessage.observe(viewLifecycleOwner) { error ->
            Toast.makeText(requireContext(), "Error: $error", Toast.LENGTH_SHORT).show()
            showEmptyState(true, isError = true)
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            // Tambahkan loading indicator jika diperlukan
        }
    }

    private fun showEmptyState(isEmpty: Boolean, isError: Boolean = false) {
        if (isEmpty) {
            binding.rvPrediksiSiklus.visibility = View.GONE
            binding.layoutEmptyState.root.visibility = View.VISIBLE

            if (isError) {
                binding.layoutEmptyState.tvEmptyTitle.text = "Gagal Memuat Data"
                binding.layoutEmptyState.tvEmptyMessage.text = "Terjadi kesalahan saat memuat data."
                binding.layoutEmptyState.btnEmptyAction.text = "Coba Lagi"
                binding.layoutEmptyState.btnEmptyAction.visibility = View.VISIBLE
                binding.layoutEmptyState.btnEmptyAction.setOnClickListener {
                    viewModel.getHistoryPencacahan()
                }
            } else {
                binding.layoutEmptyState.tvEmptyTitle.text = "Belum Ada Riwayat"
                binding.layoutEmptyState.tvEmptyMessage.text = "Riwayat pencacahan sampah akan muncul di sini."
                binding.layoutEmptyState.btnEmptyAction.text = "Tambah Riwayat"
                binding.layoutEmptyState.btnEmptyAction.visibility = View.VISIBLE
                binding.layoutEmptyState.btnEmptyAction.setOnClickListener {
                    val intent = Intent(requireContext(), TambahRiwayatActivity::class.java)
                    addHistoryLauncher.launch(intent)
                }
            }
        }
    }

    private fun observeLogout() {
        loginViewModel.logoutResult.observe(viewLifecycleOwner) { res ->
            when (res) {
                is ApiResponse.Empty -> {
                    binding.imgLogout.isEnabled = false
                }
                is ApiResponse.Success -> {
                    val intent = Intent(requireContext(), LoginActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    }
                    startActivity(intent)
                    requireActivity().finish()
                }
                is ApiResponse.Error -> {
                    binding.imgLogout.isEnabled = true
                    Toast.makeText(requireContext(), res.errorMessage, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun setupLogout() {
        binding.imgLogout.isClickable = true
        binding.imgLogout.setOnClickListener {
            val confirmDialog = AlertDialog.Builder(requireContext())
                .setTitle("Logout")
                .setMessage("Yakin ingin logout?")
                .setNegativeButton("Batal", null)
                .setPositiveButton("Ya") { _, _ ->
                    val progressBar = ProgressBar(requireContext()).apply {
                        isIndeterminate = true
                        val pad = (16 * resources.displayMetrics.density).toInt()
                        setPadding(pad, pad, pad, pad)
                    }
                    val loadingDialog = AlertDialog.Builder(requireContext())
                        .setView(progressBar)
                        .setCancelable(false)
                        .create()
                    loadingDialog.show()

                    lifecycleScope.launch {
                        try {
                            val prefs = UserPreferences(requireContext())
                            prefs.clear()
                        } catch (e: Exception) {
                        } finally {
                            loadingDialog.dismiss()
                            val intent = Intent(requireContext(), LoginActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            startActivity(intent)
                        }
                    }
                }
                .create()
            confirmDialog.show()
        }
    }

    private fun setupClickListeners() {
        binding.fabAddPrediksi.setOnClickListener {
            // Gunakan launcher untuk start activity
            val intent = Intent(requireContext(), TambahRiwayatActivity::class.java)
            addHistoryLauncher.launch(intent)
        }

        binding.imgNotification.setOnClickListener {
            val intent = Intent(requireContext(), NotificationsActivity::class.java)
            startActivity(intent)
        }
    }

    private fun setupRecyclerView() {
        binding.rvPrediksiSiklus.apply {
            adapter = historyAdapter
            layoutManager = LinearLayoutManager(requireContext())
        }

        historyAdapter.setOnItemClickListener { historyItem ->
            val intent = Intent(requireContext(), HistoryDetailActivity::class.java)
            intent.putExtra("history_data", historyItem)
            startActivity(intent)
        }
    }


    private fun mapDataToWeek(data: List<DataItem>): LinkedHashMap<String, Float> {
        val weekMap = linkedMapOf(
            "Sen" to 0f,
            "Sel" to 0f,
            "Rab" to 0f,
            "Kam" to 0f,
            "Jum" to 0f,
            "Sab" to 0f,
        )

        data.forEach { item ->
            val day = getDayName(item.tanggalWaktu.toString())

            if (weekMap.containsKey(day)) {
                weekMap[day] = weekMap[day]!! + item.totalSampah!!.toFloat()
            }
        }

        return weekMap
    }

    private fun setupLineChart(apiData: List<DataItem>) {
        val wasteData = mapDataToWeek(apiData)

        binding.lineChartView.apply {
            gradientFillColors = intArrayOf(
                resources.getColor(R.color.green, null),
                resources.getColor(android.R.color.transparent, null)
            )
            lineColor = resources.getColor(R.color.green, null)
            animate(wasteData)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    override fun onResume() {
        super.onResume()
        viewModel.getHistoryPencacahan()
    }
}
