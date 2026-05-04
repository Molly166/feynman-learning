package com.feynmanlearning.androidshell

import android.os.Build
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView

object WebViewConfigurator {
    fun configure(webView: WebView, optimizationEnabled: Boolean) {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.loadsImagesAutomatically = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
        settings.setSupportMultipleWindows(false)
        settings.allowFileAccess = false
        settings.allowContentAccess = true
        settings.cacheMode = if (optimizationEnabled) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_NO_CACHE
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.safeBrowsingEnabled = true
        }

        if (optimizationEnabled) {
            settings.databaseEnabled = true
            settings.setGeolocationEnabled(false)
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_BOUND, true)
            }
        } else {
            webView.setLayerType(View.LAYER_TYPE_NONE, null)
        }

        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false
        webView.removeJavascriptInterface("searchBoxJavaBridge_")
        webView.removeJavascriptInterface("searchBoxJavaBridge_1")
        webView.removeJavascriptInterface("accessibility")
        webView.removeJavascriptInterface("accessibilityTraversal")
    }
}
