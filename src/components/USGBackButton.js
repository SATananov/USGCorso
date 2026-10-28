import { Pressable, StyleSheet, Text } from 'react-native';

export default function USGBackButton({ onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.arrow}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    marginLeft: -4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  buttonPressed: {
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
  },
  arrow: {
    color: '#d4af37',
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '300',
    marginTop: -3,
  },
});
