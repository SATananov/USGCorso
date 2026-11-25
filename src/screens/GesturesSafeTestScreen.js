import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DogPhotoViewer from '../components/DogPhotoViewer';

const samplePhoto = require('../../assets/my-corso-hero.png');
const samplePhotoUri = Image.resolveAssetSource(samplePhoto).uri;

const viewerStyles = StyleSheet.create({
  photoPreviewBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreviewClose: {
    position: 'absolute',
    top: 36,
    right: 20,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222222',
  },
  photoPreviewCloseText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
  },
});

export default function GesturesSafeTestScreen() {
  const [viewerVisible, setViewerVisible] = useState(false);

  return (
    <GestureHandlerRootView style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>Dog Photo Gesture Test</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open local sample photo"
          onPress={() => setViewerVisible(true)}
          style={styles.photoCard}
        >
          <Image source={samplePhoto} resizeMode="contain" style={styles.thumbnail} />
          <Text style={styles.openLabel}>Tap to open the local photo</Text>
        </Pressable>
        <Text style={styles.instructions}>
          In the viewer: pinch to zoom, drag while zoomed, and double tap to zoom or reset.
        </Text>
        <Text style={styles.note}>Local image only. No account, Maps, or app data is used.</Text>
      </View>
      <DogPhotoViewer
        visible={viewerVisible}
        uri={samplePhotoUri}
        onClose={() => setViewerVisible(false)}
        styles={viewerStyles}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#111111',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  photoCard: {
    width: '100%',
    maxWidth: 420,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#94743A',
    borderRadius: 18,
    backgroundColor: '#202020',
  },
  thumbnail: {
    width: '100%',
    height: 220,
  },
  openLabel: {
    color: '#E5C276',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 24,
  },
  note: {
    color: '#B7B7B7',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});