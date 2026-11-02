const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const rules = [
  '-keep class * extends androidx.room.RoomDatabase { <init>(); }',
  '-keep class * extends androidx.work.InputMerger { <init>(); }',
  '-keep class expo.modules.gl.** { *; }',
].join('\n');

module.exports = function withAndroidWorkManagerR8Fix(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const file = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro'
      );

      const current = fs.existsSync(file)
        ? fs.readFileSync(file, 'utf8')
        : '';

      if (!current.includes(rules)) {
        const next = current.trimEnd()
          ? `${current.trimEnd()}\n\n${rules}\n`
          : `${rules}\n`;

        fs.writeFileSync(file, next, 'utf8');
      }

      return modConfig;
    },
  ]);
};
