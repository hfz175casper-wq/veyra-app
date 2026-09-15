package app.veyra.mobile;

import android.app.Activity;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.FrameLayout;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;

public class VeyraWebChromeClient extends BridgeWebChromeClient {
    private final Activity activity;
    private final Bridge bridge;
    private View customView;
    private ViewGroup customViewContainer;
    private CustomViewCallback customViewCallback;

    public VeyraWebChromeClient(Bridge bridge, Activity activity) {
        super(bridge);
        this.bridge = bridge;
        this.activity = activity;
    }

    @Override
    public void onShowCustomView(View view, CustomViewCallback callback) {
        if (customView != null) {
            callback.onCustomViewHidden();
            return;
        }
        customView = view;
        customViewCallback = callback;
        try {
            FrameLayout container = new FrameLayout(activity);
            container.setBackgroundColor(Color.BLACK);
            container.addView(view, new FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));
            ViewGroup decorView = (ViewGroup) activity.getWindow().getDecorView();
            decorView.addView(container, new ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));
            customViewContainer = container;

            // Keep screen on
            activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            
            // Hide system bars (status bar and navigation bar)
            hideSystemBars();
            activity.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);

            // Dispatch event to React
            dispatchToWeb("veyra-fullscreen-enter");
        } catch (RuntimeException error) {
            exitCustomView();
        }
    }

    @Override
    public void onHideCustomView() {
        if (customView != null) exitCustomView();
    }

    public boolean isCustomViewShowing() { return customView != null; }

    private void hideSystemBars() {
        Window window = activity.getWindow();
        View decor = window.getDecorView();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decor);
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
    }

    private void exitCustomView() {
        try {
            if (customViewContainer != null) {
                if (customView != null) customViewContainer.removeView(customView);
                ((ViewGroup) activity.getWindow().getDecorView()).removeView(customViewContainer);
            }
        } catch (RuntimeException ignored) {}

        customViewContainer = null;
        customView = null;

        try {
            Window window = activity.getWindow();
            
            // Restore system bars
            WindowCompat.setDecorFitsSystemWindows(window, true);
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
            controller.show(WindowInsetsCompat.Type.systemBars());
            
            // Clear keep screen on flag
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

            activity.setRequestedOrientation(android.content.pm.ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        } catch (RuntimeException ignored) {}

        CustomViewCallback callback = customViewCallback;
        customViewCallback = null;
        if (callback != null) callback.onCustomViewHidden();
        dispatchToWeb("veyra-fullscreen-exit");
    }

    private void dispatchToWeb(String eventName) {
        try {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                String js = "window.dispatchEvent(new Event('" + eventName + "'));";
                webView.post(() -> webView.evaluateJavascript(js, null));
            }
        } catch (RuntimeException ignored) {}
    }
}
