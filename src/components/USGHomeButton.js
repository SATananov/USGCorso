import { Pressable, StyleSheet, Text } from 'react-native';

export default function USGHomeButton({ onPress, label }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.symbol}>{'⌂'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d4af37',
    backgroundColor: '#15130f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: { opacity: 0.65 },
  symbol: {
    color: '#d4af37',
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'center',
  },
});
