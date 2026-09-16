package app.veyra.mobile;

import android.os.Bundle;
import android.app.DownloadManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

/** VEYRA native shell: WebView fullscreen + back handling. */
public class MainActivity extends BridgeActivity {
    private VeyraWebChromeClient veyraWebChromeClient;
    private boolean webFullscreen;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getBridge() != null) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                veyraWebChromeClient = new VeyraWebChromeClient(getBridge(), this);
                webView.setWebChromeClient(veyraWebChromeClient);
                webView.addJavascriptInterface(this, "VeyraNative");
            }
        }

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            private boolean delegating = false;

            @Override
            public void handleOnBackPressed() {
                if (veyraWebChromeClient != null && veyraWebChromeClient.isCustomViewShowing()) {
                    veyraWebChromeClient.onHideCustomView();
                    return;
                }
                if (webFullscreen) {
                    webViewBackFromFullscreen();
                    return;
                }
                WebView webView = getBridge() == null ? null : getBridge().getWebView();
                if (webView != null && webView.getUrl() != null && webView.getUrl().contains("/watch/")) {
                    webView.evaluateJavascript("window.dispatchEvent(new Event('veyra-native-back'));", null);
                    return;
                }
                if (delegating) return;
                delegating = true;
                setEnabled(false);
                try {
                    getOnBackPressedDispatcher().onBackPressed();
                } finally {
                    setEnabled(true);
                    delegating = false;
                }
            }
        });
    }

    @JavascriptInterface
    public void setFullscreen(boolean fullscreen) {
        runOnUiThread(() -> {
            webFullscreen = fullscreen;
            getWindow().getDecorView().setSystemUiVisibility(fullscreen
                    ? View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    : View.SYSTEM_UI_FLAG_VISIBLE);
                setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR);
        });
    }

    @JavascriptInterface
    public void share(String title, String url) {
        runOnUiThread(() -> {
            try {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_TITLE, title);
                intent.putExtra(Intent.EXTRA_TEXT, url);
                startActivity(Intent.createChooser(intent, title));
            } catch (RuntimeException ignored) {
            }
        });
    }

    @JavascriptInterface
    public void download(String url, String fileName) {
        try {
            Uri uri = Uri.parse(url);
            String scheme = uri.getScheme();
            if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) return;
            DownloadManager.Request request = new DownloadManager.Request(uri)
                    .setTitle(fileName)
                    .setDescription("VEYRA episode download")
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_MOVIES, fileName);
            DownloadManager manager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
            if (manager != null) manager.enqueue(request);
        } catch (RuntimeException error) {
            runOnUiThread(() -> Toast.makeText(this, "Download could not be started", Toast.LENGTH_SHORT).show());
        }
    }

    private void webViewBackFromFullscreen() {
        WebView webView = getBridge() == null ? null : getBridge().getWebView();
        if (webView != null) {
            webView.evaluateJavascript("window.dispatchEvent(new Event('veyra-native-back'));", null);
        }
    }
}
