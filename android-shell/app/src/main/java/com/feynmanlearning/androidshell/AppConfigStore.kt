package com.feynmanlearning.androidshell

import android.content.Context
import android.content.SharedPreferences
import android.net.Uri

class AppConfigStore(context: Context) {
    private val preferences: SharedPreferences =
        context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    fun loadConfig(): ShellConfig {
        return ShellConfig(
            webUrl = preferences.getString(KEY_WEB_URL, DEFAULT_WEB_URL).orEmpty(),
            apiBase = preferences.getString(KEY_API_BASE, DEFAULT_API_BASE).orEmpty(),
            optimizationEnabled = preferences.getBoolean(KEY_OPTIMIZATION_ENABLED, true)
        )
    }

    fun saveConfig(config: ShellConfig) {
        preferences.edit()
            .putString(KEY_WEB_URL, config.webUrl.trim())
            .putString(KEY_API_BASE, config.apiBase.trim())
            .putBoolean(KEY_OPTIMIZATION_ENABLED, config.optimizationEnabled)
            .apply()
    }

    fun buildLaunchUrl(config: ShellConfig): String {
        val safeWebUrl = config.webUrl.ifBlank { DEFAULT_WEB_URL }
        val safeApiBase = config.apiBase.ifBlank { DEFAULT_API_BASE }
        return Uri.parse(safeWebUrl)
            .buildUpon()
            .appendQueryParameter("apiBase", safeApiBase)
            .appendQueryParameter("platform", "android")
            .build()
            .toString()
    }

    companion object {
        private const val PREFERENCES_NAME = "feynman_shell_prefs"
        private const val KEY_WEB_URL = "web_url"
        private const val KEY_API_BASE = "api_base"
        private const val KEY_OPTIMIZATION_ENABLED = "optimization_enabled"

        const val DEFAULT_WEB_URL = "http://10.0.2.2:5173/welcome"
        const val DEFAULT_API_BASE = "http://10.0.2.2:3000/api"
    }
}

data class ShellConfig(
    val webUrl: String,
    val apiBase: String,
    val optimizationEnabled: Boolean
)
