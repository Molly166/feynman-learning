package com.feynmanlearning.androidshell

import android.content.Context
import android.content.MutableContextWrapper
import android.view.ViewGroup
import android.webkit.WebView

object WebViewPreloader {
    private var cachedWebView: WebView? = null

    @Synchronized
    fun warmUp(context: Context, optimizationEnabled: Boolean) {
        if (!optimizationEnabled || cachedWebView != null) {
            return
        }

        val wrapper = MutableContextWrapper(context.applicationContext)
        cachedWebView = WebView(wrapper).apply {
            WebViewConfigurator.configure(this, optimizationEnabled)
            loadUrl("about:blank")
        }
    }

    @Synchronized
    fun obtain(context: Context, optimizationEnabled: Boolean): WebView {
        val preloaded = cachedWebView
        cachedWebView = null

        val webView = preloaded ?: WebView(MutableContextWrapper(context))
        val wrapper = webView.context as? MutableContextWrapper
        wrapper?.baseContext = context
        (webView.parent as? ViewGroup)?.removeView(webView)
        WebViewConfigurator.configure(webView, optimizationEnabled)
        return webView
    }

    @Synchronized
    fun release(webView: WebView) {
        (webView.parent as? ViewGroup)?.removeView(webView)
        webView.stopLoading()
        webView.loadUrl("about:blank")
        val wrapper = webView.context as? MutableContextWrapper
        wrapper?.baseContext = wrapper?.applicationContext ?: webView.context.applicationContext
        cachedWebView = webView
    }

    @Synchronized
    fun destroy() {
        cachedWebView?.destroy()
        cachedWebView = null
    }
}
