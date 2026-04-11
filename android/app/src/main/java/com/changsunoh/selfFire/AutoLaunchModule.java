package com.changsunoh.selfFire;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
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
}
