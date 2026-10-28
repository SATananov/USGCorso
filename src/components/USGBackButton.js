import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function USGBackButton({ onPress }) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [
        styles.button,
        pressed && { backgroundColor: colors.activeSurface },
      ]}
    >
      <Text style={[styles.arrow, { color: colors.gold }]}>‹</Text>
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
  arrow: {
    fontSize: 38,
    lineHeight: 40,
    fontWeight: '300',
    marginTop: -3,
  },
});
