import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('./assets/usg-seal.png')}
          style={styles.logo}
          resizeMode="contain"
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

        <Text style={styles.sectionTitle}>Categories</Text>

        <View style={styles.categories}>
          <Pressable
            style={styles.categoryButton}
            onPress={() => console.log('Hotels pressed')}
          >
            <Text style={styles.categoryText}>Hotels</Text>
          </Pressable>

          <Pressable
            style={styles.categoryButton}
            onPress={() => console.log('Food & Drink pressed')}
          >
            <Text style={styles.categoryText}>Food & Drink</Text>
          </Pressable>

          <Pressable
            style={styles.categoryButton}
            onPress={() => console.log('Parks pressed')}
          >
            <Text style={styles.categoryText}>Parks</Text>
          </Pressable>

          <Pressable
            style={styles.categoryButton}
            onPress={() => console.log('Veterinary pressed')}
          >
            <Text style={styles.categoryText}>Veterinary</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>USG • Unico Suo Genere</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 36,
  },

  logo: {
    width: 150,
    height: 138,
    alignSelf: 'center',
    marginBottom: 18,
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

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 14,
  },

  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryButton: {
    width: '48%',
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#3d3420',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryText: {
    color: '#d4af37',
    fontSize: 15,
    fontWeight: 'bold',
  },

  footer: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 22,
  },
});
