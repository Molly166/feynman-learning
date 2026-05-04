# Preserve the JavaScript bridge methods exposed to WebView.
-keepclassmembers class com.feynmanlearning.androidshell.WebAppBridge {
    @android.webkit.JavascriptInterface <methods>;
}
