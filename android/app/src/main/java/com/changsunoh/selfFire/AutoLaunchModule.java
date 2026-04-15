package com.changsunoh.selfFire;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class AutoLaunchModule extends ReactContextBaseJavaModule {
    public AutoLaunchModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AutoLaunchModule";
    }

    @ReactMethod
    public void setEnabled(boolean enabled, Promise promise) {
        SharedPreferences prefs = getReactApplicationContext().getSharedPreferences("AutoLaunchPrefs", Context.MODE_PRIVATE);
        prefs.edit().putBoolean("enabled", enabled).apply();

        Intent serviceIntent = new Intent(getReactApplicationContext(), AutoLaunchService.class);
        if (enabled) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(serviceIntent);
            } else {
                getReactApplicationContext().startService(serviceIntent);
            }
        } else {
            getReactApplicationContext().stopService(serviceIntent);
        }
        promise.resolve(enabled);
    }

    @ReactMethod
    public void isEnabled(Promise promise) {
        SharedPreferences prefs = getReactApplicationContext().getSharedPreferences("AutoLaunchPrefs", Context.MODE_PRIVATE);
        promise.resolve(prefs.getBoolean("enabled", true));
    }

    /** SYSTEM_ALERT_WINDOW 권한 여부 반환 */
    @ReactMethod
    public void hasOverlayPermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(getReactApplicationContext()));
        } else {
            promise.resolve(true);
        }
    }

    /** 시스템 "다른 앱 위에 표시" 설정 화면으로 이동 */
    @ReactMethod
    public void openOverlaySettings(Promise promise) {
        try {
            Intent intent = new Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + getReactApplicationContext().getPackageName())
            );
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
