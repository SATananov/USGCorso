import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { recognizeTextFromImage } from '../ocr/ocrService';

export default function ScanTextButton({
  colors,
  labels,
  currentText = '',
  onTextChange,
  disabled = false,
}) {
  const [scanning, setScanning] = useState(false);

  async function scan() {
    if (scanning || disabled) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(labels.permissionTitle, labels.permissionText);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setScanning(true);

    try {
      const recognized = await recognizeTextFromImage(result.assets[0].uri);

      if (!recognized.text) {
        Alert.alert(labels.noTextTitle, labels.noTextText);
        return;
      }

      if (!currentText.trim()) {
        onTextChange(recognized.text);
        return;
      }

      Alert.alert(labels.resultTitle, labels.resultText, [
        {
          text: labels.cancel,
          style: 'cancel',
        },
        {
          text: labels.replace,
          style: 'destructive',
          onPress: () => onTextChange(recognized.text),
        },
        {
          text: labels.append,
          onPress: () =>
            onTextChange(`${currentText.trim()}\n\n${recognized.text}`),
        },
      ]);
    } catch {
      Alert.alert(labels.failedTitle, labels.failedText);
    } finally {
      setScanning(false);
    }
  }

  return (
    <Pressable
      disabled={disabled || scanning}
      onPress={scan}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.gold },
        pressed && styles.pressed,
        (disabled || scanning) && styles.disabled,
      ]}
    >
      {scanning ? (
        <ActivityIndicator color={colors.gold} />
      ) : (
        <Text style={[styles.text, { color: colors.gold }]}>
          {labels.button}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
});
