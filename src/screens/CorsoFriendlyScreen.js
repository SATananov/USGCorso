import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CorsoFriendlyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Corso Friendly</Text>
        <Text style={styles.subtitle}>USG Corso</Text>
        <Text style={styles.copy}>Location-based places suitable for Cane Corso and other large dogs will be developed here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: '#d4af37',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  copy: {
    color: '#b8b8b8',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 24,
  },
});
