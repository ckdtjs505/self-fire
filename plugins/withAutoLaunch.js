const { withDangerousMod, withAndroidManifest, withMainActivity, withMainApplication } = require('@expo/config-plugins');
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

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        Notification notification = builder
                .setContentTitle("Self-Fire 실행 중")
                .setContentText("잠금 해제 시 명언을 띄우기 위해 대기 중입니다.")
                .setSmallIcon(R.drawable.ic_stat_flame)
                .setContentIntent(pendingIntent)
                .build();

        // Android 12+는 백그라운드에서 포그라운드 서비스 시작을 막는다.
        // (START_STICKY 재시작 등) 이 경우 크래시 대신 서비스를 종료하고, 다음에 앱을 열 때 다시 시작된다.
        try {
            startForeground(1, notification);
        } catch (Exception e) {
            Log.w(TAG, "startForeground not allowed, stopping service", e);
            stopSelf();
            return;
        }

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
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
            "android.intent.action.MY_PACKAGE_REPLACED".equals(intent.getAction())) {
            
            SharedPreferences prefs = context.getSharedPreferences("AutoLaunchPrefs", Context.MODE_PRIVATE);
            boolean enabled = prefs.getBoolean("enabled", false);
            
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
`;

const javaModuleCode = `package com.changsunoh.selfFire;

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
        promise.resolve(prefs.getBoolean("enabled", false));
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
`;

const notificationIconXml = `<!-- 상태바 알림용 단색(흰색) 불꽃 아이콘. 알림 아이콘은 알파 채널만 사용되므로 컬러 아이콘을 쓰면 회색 네모로 보인다. -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FFFFFFFF"
      android:pathData="M19.48,12.35c-1.57,-4.08 -7.16,-4.3 -5.81,-10.23c0.1,-0.44 -0.37,-0.78 -0.75,-0.55C9.29,3.71 6.68,8 8.87,13.62c0.18,0.46 -0.36,0.89 -0.75,0.59c-1.81,-1.37 -2,-3.34 -1.84,-4.75c0.06,-0.52 -0.62,-0.77 -0.91,-0.34C4.69,10.16 4,11.84 4,14.37c0.38,5.6 5.11,7.32 6.81,7.54c2.43,0.31 5.06,-0.14 6.95,-1.87C19.84,18.11 20.6,15.03 19.48,12.35zM10.2,17.38c1.44,-0.35 2.18,-1.39 2.38,-2.31c0.33,-1.43 -0.96,-2.83 -0.09,-5.09c0.33,1.87 3.27,3.04 3.27,5.08C15.84,17.59 13.1,19.76 10.2,17.38z" />
</vector>
`;

const javaPackageCode = `package com.changsunoh.selfFire;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AutoLaunchPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new AutoLaunchModule(reactContext));
        return modules;
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
      fs.writeFileSync(path.join(packagePath, 'AutoLaunchModule.java'), javaModuleCode);
      fs.writeFileSync(path.join(packagePath, 'AutoLaunchPackage.java'), javaPackageCode);

      const drawablePath = path.join(platformProjectRoot, 'app/src/main/res/drawable');
      fs.mkdirSync(drawablePath, { recursive: true });
      fs.writeFileSync(path.join(drawablePath, 'ic_stat_flame.xml'), notificationIconXml);
      
      return config;
    },
  ]);

  // 2. Modify MainActivity to start the service on app launch (supports Java and Kotlin)
  config = withMainActivity(config, async (config) => {
      const isKotlin = config.modResults.language === 'kt';
      let mainActivityCode = config.modResults.contents;
      
      // Add imports
      const targetPackageLine = isKotlin ? 'package com.changsunoh.selfFire' : 'package com.changsunoh.selfFire;';
      const importBlock = isKotlin ? `
import android.content.Context
import android.content.Intent
import android.os.Build
import com.changsunoh.selfFire.AutoLaunchService` : `
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.changsunoh.selfFire.AutoLaunchService;`;

      if (!mainActivityCode.includes('import com.changsunoh.selfFire.AutoLaunchService')) {
          mainActivityCode = mainActivityCode.replace(targetPackageLine, `${targetPackageLine}\n${importBlock}`);
      }
      
      const startServiceCode = isKotlin ? `
    val prefs = getSharedPreferences("AutoLaunchPrefs", Context.MODE_PRIVATE)
    if (prefs.getBoolean("enabled", false)) {
        try {
            val serviceIntent = Intent(this, AutoLaunchService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
            } else {
                startService(serviceIntent)
            }
        } catch (e: Exception) {}
    }` : `
    android.content.SharedPreferences prefs = getSharedPreferences("AutoLaunchPrefs", android.content.Context.MODE_PRIVATE);
    if (prefs.getBoolean("enabled", false)) {
        try {
            Intent serviceIntent = new Intent(this, AutoLaunchService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
        } catch (Exception e) {}
    }`;

      // Check if we already have the service start code and replace it
      if (mainActivityCode.includes('AutoLaunchService::class.java') || mainActivityCode.includes('AutoLaunchService.class')) {
          // Replace the existing try-catch block that starts the service
          const oldPattern = /try\s*{\s+(val|Intent)\s+serviceIntent\s+=\s+Intent\(this,\s+AutoLaunchService(?:.*?)} catch\s*\(e:\s*Exception\)\s*{\s*}/s;
          if (oldPattern.test(mainActivityCode)) {
              mainActivityCode = mainActivityCode.replace(oldPattern, startServiceCode);
          } else {
              // fallback if regex fails
              const onCreatePattern = isKotlin ? /super\.onCreate\(.*?\)/ : /super\.onCreate\(.*?\);/;
              mainActivityCode = mainActivityCode.replace(onCreatePattern, (match) => `${match}\n${startServiceCode}`);
          }
      } else {
          const onCreatePattern = isKotlin ? /super\.onCreate\(.*?\)/ : /super\.onCreate\(.*?\);/;
          mainActivityCode = mainActivityCode.replace(
              onCreatePattern,
              (match) => `${match}\n${startServiceCode}`
          );
      }
      
      config.modResults.contents = mainActivityCode;
      return config;
  });

  // 3. Register Package in MainApplication (supports Kotlin)
  config = withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    if (!contents.includes('import com.changsunoh.selfFire.AutoLaunchPackage')) {
      const packageImport = config.modResults.language === 'kt' 
        ? 'import com.changsunoh.selfFire.AutoLaunchPackage'
        : 'import com.changsunoh.selfFire.AutoLaunchPackage;';
      contents = contents.replace(/(package\s+.*?\n)/, (match) => `${match}${packageImport}\n`);
    }

    if (!contents.includes('AutoLaunchPackage()')) {
      // For Kotlin Expo 51+ MainApplication structure
      if (contents.includes('PackageList(this).packages')) {
          contents = contents.replace(
              /PackageList\(this\)\.packages\.apply\s*{/,
              (match) => `${match}\n          add(AutoLaunchPackage())`
          );
      } else {
          // Fallback for older structures
          contents = contents.replace(
              /Package\(\),?/,
              (match) => `${match}\n          AutoLaunchPackage(),`
          );
      }
    }
    config.modResults.contents = contents;
    return config;
  });

  // 4. Inject Manifest Elements
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
