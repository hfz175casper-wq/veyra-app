package app.veyra.mobile;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

/**
 * VEYRA ? tek Activity (Capacitor k?pr?s?).
 *
 * T?m sayfa/?zelle?tirme i?i WebView i?indeki VEYRA web uygulamas?ndad?r;
 * buras? yaln?zca native kabuktur.
 *
 * Neden bu s?n?f var?
 * Capacitor'?n varsay?lan {@code BridgeWebChromeClient} s?r?m? HTML5 tam ekran
 * isteklerini ({@code element.requestFullscreen()}) an?nda iptal eder
 * ({@code callback.onCustomViewHidden()}). VEYRA'n?n dikey player'?ndaki
 * "Fullscreen" d??mesinin Android'de ger?ekten tam ekrana ge?mesi i?in
 * WebView'e {@link VeyraWebChromeClient} kurulur.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // super.onCreate() k?pr?y? (ve varsay?lan chrome client'i) senkron kurar;
        // burada g?venli ?ekilde ?zerine yazabiliriz.
        if (getBridge() != null) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setWebChromeClient(new VeyraWebChromeClient(getBridge(), this));
            }
        }
    }
}
