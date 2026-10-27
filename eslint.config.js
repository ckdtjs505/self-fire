// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // admin/은 서버에 따로 올리는 PHP 어드민 (브라우저 전역 스크립트)
    ignores: ["dist/*", "android/*", "ios/*", "admin/*"],
  },
  {
    // Node에서 실행되는 빌드 스크립트 / Expo 설정 플러그인
    files: ["scripts/**/*.js", "plugins/**/*.js"],
    languageOptions: {
      globals: { require: "readonly", module: "writable", __dirname: "readonly", process: "readonly", console: "readonly" },
    },
  },
  {
    // jest.mock은 import보다 먼저 와야 하므로 테스트에서는 허용한다.
    files: ["__tests__/**", "jest.setup.ts"],
    rules: { "import/first": "off", "@typescript-eslint/no-require-imports": "off" },
  },
]);
