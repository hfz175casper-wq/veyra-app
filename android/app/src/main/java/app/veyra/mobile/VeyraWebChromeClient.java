package app.veyra.mobile;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.widget.FrameLayout;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;

/**
 * VEYRA — tam ekran videoyu gerçekten çalıştıran WebChromeClient.
 *
 * Capacitor'ın varsayılan istemcisi {@code onShowCustomView} içinde
 * {@code callback.onCustomViewHidden()} çağırarak tam ekran isteğini iptal
 * eder. Bu sınıf aynı istemciden türeyip yalnızca tam ekran davranışını
 * değiştirir: videoyu siyah bir kapsayıcıya taşır, sistem çubuklarını gizler
 * ve yatay yönelime geçer; çıkışta her şeyi geri alır.
 *
 * Tüm native çağrılar savunmacıdır (try/catch): beklenmedik bir durumda
 * uygulama çökmez, tam ekrandan vazgeçilir ve oynatma satır içi devam eder.
 */
public class VeyraWebChromeClient extends BridgeWebChromeClient {

    private final Activity activity;

    private View customView;
    private ViewGroup customViewContainer;
    private CustomViewCallback customViewCallback;

    public VeyraWebChromeClient(Bridge bridge, Activity activity) {
        super(bridge);
        this.activity = activity;
    }

    @Override
    public void onShowCustomView(View view, CustomViewCallback callback) {
        if (customView != null) {
            // Zaten tam ekrandayız; ikinci isteği reddet.
            callback.onCustomViewHidden();
            return;
        }

        customView = view;
        customViewCallback = callback;

        try {
            FrameLayout container = new FrameLayout(activity);
            container.setLayoutParams(new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));
            container.setBackgroundColor(Color.BLACK);
            container.addView(view, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));

            ViewGroup decorView = (ViewGroup) activity.getWindow().getDecorView();
            decorView.addView(container);
            customViewContainer = container;

            hideSystemBars();
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
        } catch (RuntimeException error) {
            exitCustomView();
        }
    }

    @Override
    public void onHideCustomView() {
        if (customView == null) {
            return;
        }
        exitCustomView();
    }

    private void hideSystemBars() {
        try {
            Window window = activity.getWindow();
            ViewGroup decorView = (ViewGroup) window.getDecorView();
            WindowCompat.setDecorFitsSystemWindows(window, false);
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);
            controller.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            controller.hide(WindowInsetsCompat.Type.systemBars());
        } catch (RuntimeException ignored) {
            // Sistem çubukları gizlenemezse tam ekran yine de çalışır.
        }
    }

    private void exitCustomView() {
        try {
            if (customViewContainer != null) {
                if (customView != null) {
                    customViewContainer.removeView(customView);
                }
                ViewGroup decorView = (ViewGroup) activity.getWindow().getDecorView();
                decorView.removeView(customViewContainer);
            }
        } catch (RuntimeException ignored) {
            // Görünüm ağacı zaten temizlenmiş olabilir.
        }
        customViewContainer = null;
        customView = null;

        try {
            Window window = activity.getWindow();
            WindowCompat.setDecorFitsSystemWindows(window, true);
            WindowInsetsControllerCompat controller =
                    WindowCompat.getInsetsController(window, window.getDecorView());
            controller.show(WindowInsetsCompat.Type.systemBars());
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        } catch (RuntimeException ignored) {
            // Çubuklar geri getirilemezse bile oynatma devam eder.
        }

        CustomViewCallback callback = customViewCallback;
        customViewCallback = null;
        if (callback != null) {
            callback.onCustomViewHidden();
        }
    }
}
