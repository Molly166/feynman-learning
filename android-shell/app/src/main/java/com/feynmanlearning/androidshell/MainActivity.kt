package com.feynmanlearning.androidshell

import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.net.http.SslError
import android.os.Bundle
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.feynmanlearning.androidshell.databinding.ActivityMainBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.materialswitch.MaterialSwitch
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import java.net.URISyntaxException

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var configStore: AppConfigStore

    private var webView: WebView? = null
    private var currentConfig = ShellConfig(
        webUrl = AppConfigStore.DEFAULT_WEB_URL,
        apiBase = AppConfigStore.DEFAULT_API_BASE,
        optimizationEnabled = true
    )
    private var pageLoadStartMs = 0L
    private var lastLoadDurationMs = -1L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configStore = AppConfigStore(this)
        currentConfig = configStore.loadConfig()

        setupActions()
        setupWebView(savedInstanceState)
        updateMetrics("应用已启动")
        bindBackNavigation()
    }

    private fun setupActions() {
        binding.backButton.setOnClickListener {
            if (webView?.canGoBack() == true) {
                webView?.goBack()
            } else {
                finish()
            }
        }

        binding.homeButton.setOnClickListener {
            loadHomePage(forceRefresh = false)
        }

        binding.refreshButton.setOnClickListener {
            loadHomePage(forceRefresh = true)
        }

        binding.configButton.setOnClickListener {
            showConfigDialog()
        }

        binding.optimizeButton.setOnClickListener {
            val nextConfig = currentConfig.copy(optimizationEnabled = !currentConfig.optimizationEnabled)
            applyConfig(nextConfig, reload = true, showRestartHint = true)
        }

        binding.retryButton.setOnClickListener {
            hideError()
            loadHomePage(forceRefresh = true)
        }

        binding.settingsButton.setOnClickListener {
            showConfigDialog()
        }
    }

    private fun setupWebView(savedInstanceState: Bundle?) {
        val acquiredWebView = WebViewPreloader.obtain(this, currentConfig.optimizationEnabled)
        webView = acquiredWebView
        acquiredWebView.removeJavascriptInterface(JS_BRIDGE_NAME)
        acquiredWebView.addJavascriptInterface(
            WebAppBridge(this) {
                runOnUiThread { loadHomePage(forceRefresh = true) }
            },
            JS_BRIDGE_NAME
        )
        acquiredWebView.webChromeClient = buildChromeClient()
        acquiredWebView.webViewClient = buildWebViewClient()

        binding.webViewContainer.removeAllViews()
        binding.webViewContainer.addView(
            acquiredWebView,
            ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        )

        val restored = acquiredWebView.restoreState(savedInstanceState ?: Bundle())
        if (restored == null) {
            loadHomePage(forceRefresh = false)
        } else {
            hideError()
            updateMetrics("已恢复上次页面状态")
        }
    }

    private fun buildChromeClient(): WebChromeClient {
        return object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                binding.progressIndicator.progress = newProgress
                binding.progressIndicator.visibility = if (newProgress >= 100) View.GONE else View.VISIBLE
            }

            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                val message = consoleMessage?.message() ?: return super.onConsoleMessage(consoleMessage)
                if (message.contains("error", ignoreCase = true)) {
                    binding.statusText.text = message
                }
                return super.onConsoleMessage(consoleMessage)
            }
        }
    }

    private fun buildWebViewClient(): WebViewClient {
        return object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val targetUrl = request?.url?.toString().orEmpty()
                if (targetUrl.startsWith("http://") || targetUrl.startsWith("https://")) {
                    return false
                }

                if (targetUrl.startsWith("tel:") || targetUrl.startsWith("mailto:") || targetUrl.startsWith("intent:")) {
                    openExternalTarget(targetUrl)
                    return true
                }

                showError("已拦截不受支持的链接：$targetUrl")
                return true
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                hideError()
                pageLoadStartMs = SystemClock.elapsedRealtime()
                binding.statusText.text = "正在加载：${url.orEmpty()}"
                binding.progressIndicator.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                if (pageLoadStartMs > 0L) {
                    lastLoadDurationMs = SystemClock.elapsedRealtime() - pageLoadStartMs
                }
                updateMetrics("页面加载完成")
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    showError("页面加载失败：${error?.description ?: "未知错误"}")
                }
            }

            override fun onReceivedHttpError(
                view: WebView?,
                request: WebResourceRequest?,
                errorResponse: WebResourceResponse?
            ) {
                super.onReceivedHttpError(view, request, errorResponse)
                if (request?.isForMainFrame == true) {
                    showError("服务返回异常：HTTP ${errorResponse?.statusCode ?: 0}")
                }
            }

            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                handler?.cancel()
                showError("SSL 证书校验失败，已阻止继续访问。")
            }
        }
    }

    private fun loadHomePage(forceRefresh: Boolean) {
        val targetWebView = webView ?: return
        hideError()
        val settings = targetWebView.settings
        settings.cacheMode = when {
            forceRefresh -> android.webkit.WebSettings.LOAD_NO_CACHE
            !isNetworkAvailable() -> android.webkit.WebSettings.LOAD_CACHE_ELSE_NETWORK
            currentConfig.optimizationEnabled -> android.webkit.WebSettings.LOAD_DEFAULT
            else -> android.webkit.WebSettings.LOAD_NO_CACHE
        }
        targetWebView.loadUrl(configStore.buildLaunchUrl(currentConfig))
    }

    private fun showConfigDialog() {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 0)
        }

        val webUrlInput = createTextInput(
            hint = "前端地址",
            initialValue = currentConfig.webUrl
        )
        val apiBaseInput = createTextInput(
            hint = "API 地址",
            initialValue = currentConfig.apiBase
        )
        val optimizationSwitch = MaterialSwitch(this).apply {
            text = "启用性能优化"
            isChecked = currentConfig.optimizationEnabled
        }

        container.addView(webUrlInput.first)
        container.addView(apiBaseInput.first)
        container.addView(
            optimizationSwitch,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = 16
            }
        )

        MaterialAlertDialogBuilder(this)
            .setTitle("配置服务地址")
            .setMessage("模拟器默认使用 10.0.2.2；真机请改成电脑局域网 IP。")
            .setView(container)
            .setNegativeButton("取消", null)
            .setPositiveButton("保存") { _, _ ->
                val nextConfig = ShellConfig(
                    webUrl = webUrlInput.second.text?.toString().orEmpty(),
                    apiBase = apiBaseInput.second.text?.toString().orEmpty(),
                    optimizationEnabled = optimizationSwitch.isChecked
                )
                applyConfig(nextConfig, reload = true, showRestartHint = false)
            }
            .show()
    }

    private fun createTextInput(
        hint: String,
        initialValue: String
    ): Pair<TextInputLayout, TextInputEditText> {
        val editText = TextInputEditText(this).apply {
            setText(initialValue)
        }
        val layout = TextInputLayout(this).apply {
            this.hint = hint
            addView(
                editText,
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
            )
        }
        return layout to editText
    }

    private fun applyConfig(nextConfig: ShellConfig, reload: Boolean, showRestartHint: Boolean) {
        currentConfig = nextConfig
        configStore.saveConfig(nextConfig)
        binding.optimizeButton.text = if (nextConfig.optimizationEnabled) {
            getString(R.string.disable_optimization)
        } else {
            getString(R.string.enable_optimization)
        }
        if (nextConfig.optimizationEnabled) {
            WebViewPreloader.warmUp(applicationContext, true)
        } else {
            WebViewPreloader.destroy()
        }
        WebViewConfigurator.configure(webView ?: return, nextConfig.optimizationEnabled)
        if (reload) {
            loadHomePage(forceRefresh = true)
        }
        updateMetrics(
            if (showRestartHint) {
                "性能模式已切换，建议重启应用后再做优化前后对比。"
            } else {
                "配置已更新"
            }
        )
    }

    private fun updateMetrics(status: String) {
        binding.optimizeButton.text = if (currentConfig.optimizationEnabled) {
            getString(R.string.disable_optimization)
        } else {
            getString(R.string.enable_optimization)
        }
        val durationText = if (lastLoadDurationMs >= 0) {
            "${lastLoadDurationMs} ms"
        } else {
            "待测"
        }
        binding.metricsText.text =
            "模式：${if (currentConfig.optimizationEnabled) "优化" else "基础"} | 最近加载：$durationText"
        binding.statusText.text = status
    }

    private fun showError(message: String) {
        binding.errorCard.visibility = View.VISIBLE
        binding.errorMessage.text = message
        binding.progressIndicator.visibility = View.GONE
        binding.statusText.text = message
    }

    private fun hideError() {
        binding.errorCard.visibility = View.GONE
        binding.errorMessage.text = ""
    }

    private fun bindBackNavigation() {
        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (webView?.canGoBack() == true) {
                        webView?.goBack()
                    } else {
                        finish()
                    }
                }
            }
        )
    }

    private fun openExternalTarget(url: String) {
        try {
            val intent = when {
                url.startsWith("intent:") -> Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                else -> Intent(Intent.ACTION_VIEW, Uri.parse(url))
            }
            startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            showError("当前设备无法处理该外部链接。")
        } catch (_: URISyntaxException) {
            showError("外部链接格式错误，已阻止打开。")
        }
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(ConnectivityManager::class.java) ?: return false
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView?.saveState(outState)
    }

    override fun onDestroy() {
        val targetWebView = webView
        if (isFinishing) {
            targetWebView?.let {
                it.removeJavascriptInterface(JS_BRIDGE_NAME)
                WebViewPreloader.release(it)
            }
        } else if (isChangingConfigurations) {
            targetWebView?.let {
                it.removeJavascriptInterface(JS_BRIDGE_NAME)
                it.stopLoading()
                it.destroy()
            }
        }
        webView = null
        super.onDestroy()
    }

    companion object {
        private const val JS_BRIDGE_NAME = "AndroidBridge"
    }
}
