# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# expo-notifications: 예약 알림을 Java 직렬화(writeObject/readObject)로 저장한다.
# 라이브러리의 keep 규칙이 consumer 규칙으로 연결돼 있지 않아, 없으면 R8이 이 메서드를 지워
# NotSerializableException(org.json.JSONObject)으로 예약이 멈춘다.
-keep class expo.modules.notifications.** { *; }
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Firebase Crashlytics: 난독화된 스택트레이스를 매핑 파일로 복원하기 위해 줄 번호 유지
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
