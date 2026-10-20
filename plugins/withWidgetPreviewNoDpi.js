const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

// react-native-android-widget은 위젯 미리보기(previewImage)를 res/drawable/에 넣는데,
// 그 폴더는 mdpi로 취급되어 고밀도 화면에서 3배 가까이 커진다.
// (One UI의 '홈 화면에 추가' 창은 미리보기를 그 크기 그대로 보여 줘서 스크롤이 생긴다)
// 미리보기는 실제 위젯을 찍은 이미지라 크기를 바꾸지 않도록 drawable-nodpi/로 옮긴다.
//
// 나중에 등록된 mod가 먼저 실행되므로, app.json에서 react-native-android-widget보다 앞에 두어야
// 위젯 플러그인이 미리보기를 복사한 뒤에 실행된다.
module.exports = function withWidgetPreviewNoDpi(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const resDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res');
      const drawableDir = path.join(resDir, 'drawable');
      const noDpiDir = path.join(resDir, 'drawable-nodpi');
      if (!fs.existsSync(drawableDir)) return config;

      for (const file of fs.readdirSync(drawableDir)) {
        if (!/_preview\.(png|jpe?g|webp)$/.test(file)) continue;
        fs.mkdirSync(noDpiDir, { recursive: true });
        fs.renameSync(path.join(drawableDir, file), path.join(noDpiDir, file));
      }
      return config;
    },
  ]);
};
