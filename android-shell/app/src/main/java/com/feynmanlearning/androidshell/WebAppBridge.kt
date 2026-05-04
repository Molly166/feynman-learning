package com.feynmanlearning.androidshell

import android.content.Context
import android.os.Build
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppBridge(
    private val context: Context,
    private val onReloadRequested: () -> Unit
) {
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun getDeviceInfo(): String {
        return "Android ${Build.VERSION.RELEASE}"
    }

    @JavascriptInterface
    fun reloadPage() {
        onReloadRequested()
    }
}
