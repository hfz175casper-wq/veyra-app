package app.veyra.mobile;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
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
            ViewGroup decor = (ViewGroup) activity.getWindow().getDecorView();
            decor.addView(container, new ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT));
            customViewContainer = container;

            activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            hideSystemBars();
            dispatch("veyra-native-fullscreen-enter");
        } catch (RuntimeException ignored) {
            exitCustomView();
        }
    }

    @Override
    public void onHideCustomView() {
        if (customView != null) exitCustomView();
    }

    public boolean isCustomViewShowing() {
        return customView != null;
    }

    private void hideSystemBars() {
        Window window = activity.getWindow();
        View decor = window.getDecorView();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decor);
        if (controller != null) {
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }

    private void exitCustomView() {
        try {
            if (customViewContainer != null) {
                if (customView != null) customViewContainer.removeView(customView);
                ViewGroup decor = (ViewGroup) activity.getWindow().getDecorView();
                decor.removeView(customViewContainer);
            }
        } catch (RuntimeException ignored) {
        }
        customViewContainer = null;
        customView = null;
        try {
            Window window = activity.getWindow();
            WindowCompat.setDecorFitsSystemWindows(window, true);
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
            if (controller != null) controller.show(WindowInsetsCompat.Type.systemBars());
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        } catch (RuntimeException ignored) {
        }
        dispatch("veyra-native-fullscreen-exit");
        CustomViewCallback callback = customViewCallback;
        customViewCallback = null;
        if (callback != null) callback.onCustomViewHidden();
    }

    private void dispatch(String eventName) {
        try {
            if (bridge != null && bridge.getWebView() != null) {
                bridge.getWebView().post(() -> bridge.getWebView().evaluateJavascript(
                        "window.dispatchEvent(new Event('" + eventName + "'))", null));
            }
        } catch (RuntimeException ignored) {
        }
    }
}
