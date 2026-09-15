package app.veyra.mobile;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

/** VEYRA native shell: WebView fullscreen + back handling. */
public class MainActivity extends BridgeActivity {
    private VeyraWebChromeClient veyraWebChromeClient;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getBridge() != null) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                veyraWebChromeClient = new VeyraWebChromeClient(getBridge(), this);
                webView.setWebChromeClient(veyraWebChromeClient);
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
}
