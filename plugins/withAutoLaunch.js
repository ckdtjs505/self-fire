const { withDangerousMod, withAndroidManifest, withMainActivity } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const javaServiceCode = `package com.changsunoh.selfFire;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class AutoLaunchService extends Service {
    private static final String TAG = "AutoLaunchService";
    private static final String CHANNEL_ID = "AutoLaunchServiceChannel";
    private BroadcastReceiver unlockReceiver;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Self-Fire 실행 중")
                .setContentText("잠금 해제 시 명언을 띄우기 위해 대기 중입니다.")
                .setSmallIcon(getResources().getIdentifier("ic_launcher", "mipmap", getPackageName()))
                .setContentIntent(pendingIntent)
                .build();

        startForeground(1, notification);

        unlockReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (Intent.ACTION_USER_PRESENT.equals(intent.getAction())) {
                    Log.d(TAG, "Screen unlocked! USER_PRESENT received.");
                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(context)) {
                        try {
                            Intent launchIntent = new Intent(context, MainActivity.class);
                            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK 
                                    | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT 
                                    | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                            context.startActivity(launchIntent);
                            Log.d(TAG, "MainActivity launched successfully.");
                        } catch (Exception e) {
                            Log.e(TAG, "Failed to launch MainActivity", e);
                        }
                    } else {
                        Log.w(TAG, "No SYSTEM_ALERT_WINDOW permission");
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter(Intent.ACTION_USER_PRESENT);
        registerReceiver(unlockReceiver, filter);
        Log.d(TAG, "AutoLaunchService created and receiver registered.");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (unlockReceiver != null) {
            unregisterReceiver(unlockReceiver);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Auto Launch Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
`;

const javaBootCode = `package com.changsunoh.selfFire;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
            "android.intent.action.MY_PACKAGE_REPLACED".equals(intent.getAction())) {
            
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
`;

const withAutoLaunchReceiver = (config) => {
  // 1. Inject Java Codes
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const { platformProjectRoot } = config.modRequest;
      const packagePath = path.join(platformProjectRoot, 'app/src/main/java/com/changsunoh/selfFire');
      
      if (!fs.existsSync(packagePath)) {
        fs.mkdirSync(packagePath, { recursive: true });
      }
      fs.writeFileSync(path.join(packagePath, 'AutoLaunchService.java'), javaServiceCode);
      fs.writeFileSync(path.join(packagePath, 'BootReceiver.java'), javaBootCode);
      
      const oldReceiver = path.join(packagePath, 'AutoLaunchReceiver.java');
      if (fs.existsSync(oldReceiver)) {
          fs.unlinkSync(oldReceiver);
      }
      
      return config;
    },
  ]);

  // 2. Modify MainActivity.java to start the service on app launch
  config = withMainActivity(config, async (config) => {
      let mainActivityCode = config.modResults.contents;
      
      const importIntent = 'import android.content.Intent;\nimport android.os.Build;';
      if (!mainActivityCode.includes('import android.content.Intent;')) {
          mainActivityCode = mainActivityCode.replace(
              'import android.os.Bundle;',
              `import android.os.Bundle;\n${importIntent}`
          );
      }
      
      const startServiceCode = `
    try {
        Intent serviceIntent = new Intent(this, AutoLaunchService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    } catch (Exception e) {}
`;
      if (!mainActivityCode.includes('startForegroundService(serviceIntent)')) {
          mainActivityCode = mainActivityCode.replace(
              /super\.onCreate\((.*?)\);/,
              `super.onCreate($1);\n${startServiceCode}`
          );
      }
      
      config.modResults.contents = mainActivityCode;
      return config;
  });

  // 3. Inject Manifest Elements
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const mainApplication = manifest.application[0];

    if (!manifest['uses-permission']) manifest['uses-permission'] = [];
    const permissionsToAdd = [
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.POST_NOTIFICATIONS'
    ];
    
    for (const p of permissionsToAdd) {
        if (!manifest['uses-permission'].some((up) => up.$['android:name'] === p)) {
            manifest['uses-permission'].push({ $: { 'android:name': p } });
        }
    }

    if (!mainApplication.service) mainApplication.service = [];
    if (!mainApplication.service.some((s) => s.$['android:name'] === '.AutoLaunchService')) {
        mainApplication.service.push({
            $: {
                'android:name': '.AutoLaunchService',
                'android:exported': 'false',
                'android:foregroundServiceType': 'specialUse'
            },
            'property': [
                {
                    $: {
                        'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
                        'android:value': 'Launch on unlock'
                    }
                }
            ]
        });
    }

    if (!mainApplication.receiver) mainApplication.receiver = [];
    
    mainApplication.receiver = mainApplication.receiver.filter(
        r => r.$['android:name'] !== '.AutoLaunchReceiver'
    );
    
    if (!mainApplication.receiver.some((r) => r.$['android:name'] === '.BootReceiver')) {
        mainApplication.receiver.push({
            $: {
                'android:name': '.BootReceiver',
                'android:exported': 'true'
            },
            'intent-filter': [
                {
                    action: [
                        { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
                        { $: { 'android:name': 'android.intent.action.MY_PACKAGE_REPLACED' } }
                    ]
                }
            ]
        });
    }

    return config;
  });

  return config;
};

module.exports = withAutoLaunchReceiver;
