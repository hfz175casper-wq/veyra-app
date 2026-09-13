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
 * VEYRA ? tam ekran videoyu ger?ekten ?al??t?ran WebChromeClient.
 *
 * Capacitor'?n varsay?lan istemcisi {@code onShowCustomView} i?inde
 * {@code callback.onCustomViewHidden()} ?a??rarak tam ekran iste?ini iptal
 * eder. Bu s?n?f ayn? istemciden t?reyip yaln?zca tam ekran davran???n?
 * de?i?tirir: videoyu siyah bir kapsay?c?ya ta??r, sistem ?ubuklar?n? gizler
 * ve yatay y?nelime ge?er; ??k??ta her ?eyi geri al?r.
 *
 * T?m native ?a?r?lar savunmac?d?r (try/catch): beklenmedik bir durumda
 * uygulama ??kmez, tam ekrandan vazge?ilir ve oynatma sat?r i?i devam eder.
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
            // Zaten tam ekranday?z; ikinci iste?i reddet.
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
            // Sistem ?ubuklar? gizlenemezse tam ekran yine de ?al???r.
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
            // G?r?n?m a?ac? zaten temizlenmi? olabilir.
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
            // ?ubuklar geri getirilemezse bile oynatma devam eder.
        }

        CustomViewCallback callback = customViewCallback;
        customViewCallback = null;
        if (callback != null) {
            callback.onCustomViewHidden();
        }
    }
}
