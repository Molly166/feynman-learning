package com.feynmanlearning.androidshell

import android.app.Application

class FeynmanApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        val config = AppConfigStore(this).loadConfig()
        WebViewPreloader.warmUp(this, config.optimizationEnabled)
    }
}
