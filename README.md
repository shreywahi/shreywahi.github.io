# View the Web Resume here: https://dodoshrey.github.io/

## To run local dev:

1. git clone https://github.com/dodoshrey/web-resume.git
2. npm install
3. npm run dev


## To make changes:

1. Do changes and merge to main
2. npm run build
3. npm run deploy


## To create APK:

1. npm run build
### To copy build to native project:
2. npx cap copy
3. .\gradlew clean
### Build the APK using Gradle
4. .\gradlew assembleDebug
This will generate a debug APK at: .\app\build\outputs\apk\debug\app-debug.apk
### (Optional) Build a release APK
5. .\gradlew assembleRelease
The APK will be at: .\app\build\outputs\apk\release\app-release.apk