package app.veyra.mobile;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

/**
 * VEYRA — tek Activity (Capacitor köprüsü).
 *
 * Tüm sayfa/özelleştirme işi WebView içindeki VEYRA web uygulamasındadır;
 * burası yalnızca native kabuktur.
 *
 * Neden bu sınıf var?
 * 1) Capacitor'ın varsayılan {@code BridgeWebChromeClient} sürümü HTML5 tam
 *    ekran isteklerini ({@code element.requestFullscreen()}) anında iptal
 *    eder. VEYRA'nın dikey player'ındaki tam ekran düğmesinin Android'de
 *    gerçekten çalışması için WebView'e {@link VeyraWebChromeClient} kurulur.
 * 2) Android geri tuşu önce native tam ekrandan çıkmalı, ardından normal
 *    gezinme geçmişine (wouter) düşmelidir. {@code @capacitor/app} eklentisi
 *    kendi geri tuşu callback'ini köprü kurulurken kaydeder; burada kaydedilen
 *    callback ONDAN SONRA eklendiği için daha yüksek önceliğe sahiptir ve
 *    tam ekran değilse zinciri varsayılan işleyiciye devreder.
 */
public class MainActivity extends BridgeActivity {

    private VeyraWebChromeClient veyraWebChromeClient;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // super.onCreate() köprüyü (ve varsayılan chrome client'i) senkron kurar;
        // burada güvenli şekilde üzerine yazabiliriz.
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
                // 1) Native video tam ekranı açıksa: geri tuşu sadece ondan çıkar.
                if (veyraWebChromeClient != null && veyraWebChromeClient.isCustomViewShowing()) {
                    veyraWebChromeClient.onHideCustomView();
                    return;
                }

                // 2) Değilse: zinciri diğer işleyicilere bırak
                //    (@capacitor/app → webView.goBack() / gezinme geçmişi).
                if (delegating) {
                    return;
                }
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
