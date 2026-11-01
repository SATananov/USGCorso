import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '../theme/ThemeContext';

export default function USGDialog({
  visible,
  title,
  message,
  cancelText,
  confirmText,
  singleText = 'OK',
  onCancel,
  onConfirm,
  onSingleAction,
  busy = false,
}) {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(visible)}
      onRequestClose={onCancel || onSingleAction}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.gold,
            },
          ]}
        >
          <Text style={[styles.eyebrow, { color: colors.gold }]}>USG CORSO</Text>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {message ? (
            <Text style={[styles.message, { color: colors.textSoft }]}>
              {message}
            </Text>
          ) : null}

          {confirmText ? (
            <View style={styles.actions}>
              <Pressable
                disabled={busy}
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: colors.gold },
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                <Text style={[styles.secondaryText, { color: colors.gold }]}>
                  {cancelText || 'CANCEL'}
                </Text>
              </Pressable>

              <Pressable
                disabled={busy}
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.gold },
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                {busy ? (
                  <ActivityIndicator color="#070708" />
                ) : (
                  <Text style={styles.primaryText}>{confirmText}</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              disabled={busy}
              onPress={onSingleAction || onCancel}
              style={({ pressed }) => [
                styles.singleButton,
                { backgroundColor: colors.gold },
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#070708" />
              ) : (
                <Text style={styles.primaryText}>{singleText}</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '900',
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  singleButton: {
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 24,
  },
  primaryText: {
    color: '#070708',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  pressed: {
    opacity: 0.74,
  },
  disabled: {
    opacity: 0.5,
  },
});
