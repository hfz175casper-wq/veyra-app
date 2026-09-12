package app.veyra.mobile;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

/**
 * VEYRA — tek Activity (Capacitor köprüsü).
 *
 * Tüm sayfa/özelleştirme işi WebView içindeki VEYRA web uygulamasındadır;
 * burası yalnızca native kabuktur.
 *
 * Neden bu sınıf var?
 * Capacitor'ın varsayılan {@code BridgeWebChromeClient} sürümü HTML5 tam ekran
 * isteklerini ({@code element.requestFullscreen()}) anında iptal eder
 * ({@code callback.onCustomViewHidden()}). VEYRA'nın dikey player'ındaki
 * "Fullscreen" düğmesinin Android'de gerçekten tam ekrana geçmesi için
 * WebView'e {@link VeyraWebChromeClient} kurulur.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // super.onCreate() köprüyü (ve varsayılan chrome client'i) senkron kurar;
        // burada güvenli şekilde üzerine yazabiliriz.
        if (getBridge() != null) {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.setWebChromeClient(new VeyraWebChromeClient(getBridge(), this));
            }
        }
    }
}
