const { withAndroidManifest } = require('@expo/config-plugins');

// Android 16부터 대형 화면에서 방향 제한이 무시되므로(Play Console 경고),
// app.json의 orientation(portrait)은 iOS에만 적용하고 Android MainActivity에서는 제거한다.
module.exports = function withAndroidUnlockOrientation(config) {
  return withAndroidManifest(config, (config) => {
    const activities = config.modResults.manifest.application?.[0]?.activity ?? [];
    for (const activity of activities) {
      delete activity.$['android:screenOrientation'];
    }
    return config;
  });
};
