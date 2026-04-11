package com.changsunoh.selfFire;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
            "android.intent.action.MY_PACKAGE_REPLACED".equals(intent.getAction())) {
            
            SharedPreferences prefs = context.getSharedPreferences("AutoLaunchPrefs", Context.MODE_PRIVATE);
            boolean enabled = prefs.getBoolean("enabled", true);
            
            if (!enabled) {
                Log.d("BootReceiver", "AutoLaunch is disabled in settings. Skipping service start.");
                return;
            }

            Log.d("BootReceiver", "Boot or package replaced. Starting AutoLaunchService...");
            Intent serviceIntent = new Intent(context, AutoLaunchService.class);
            
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent);
                } else {
                    context.startService(serviceIntent);
                }
            } catch (Exception e) {
                Log.e("BootReceiver", "Failed to start service", e);
            }
        }
    }
}
