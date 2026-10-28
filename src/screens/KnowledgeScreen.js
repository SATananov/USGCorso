import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function KnowledgeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Knowledge</Text>
        <Text style={styles.subtitle}>USG Corso</Text>
        <Text style={styles.copy}>This screen is the first navigation placeholder for the future Cane Corso knowledge area.</Text>
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
