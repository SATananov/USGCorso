import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Image
          source={require('./assets/icon.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>USG Corso Companion</Text>

        <Text style={styles.subtitle}>
          Discover places that welcome Cane Corso and other large dogs.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Corso Friendly</Text>

          <Text style={styles.cardText}>
            Find hotels, restaurants, parks and other places shared by dog owners.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => console.log('Explore pressed')}
          >
            <Text style={styles.buttonText}>Explore places</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>USG • Unico Suo Genere</Text>
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
    paddingHorizontal: 24,
  },

  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: 20,
  },

  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: '#b8b8b8',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },

  card: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#3d3420',
    borderRadius: 20,
    padding: 22,
  },

  cardTitle: {
    color: '#d4af37',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  cardText: {
    color: '#dddddd',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },

  button: {
    backgroundColor: '#d4af37',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footer: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 28,
  },
});
