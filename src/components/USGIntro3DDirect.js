import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Asset } from 'expo-asset';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

function createRenderer(gl) {
  const fakeCanvas = {
    width: gl.drawingBufferWidth,
    height: gl.drawingBufferHeight,
    clientWidth: gl.drawingBufferWidth,
    clientHeight: gl.drawingBufferHeight,
    style: {},
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    getContext: () => gl,
  };

  const renderer = new THREE.WebGLRenderer({
    canvas: fakeCanvas,
    context: gl,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(1);
  renderer.setSize(
    gl.drawingBufferWidth,
    gl.drawingBufferHeight,
    false
  );
  renderer.setClearColor(0x000000, 0);

  return renderer;
}

async function loadExpoTexture(moduleId) {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();

  const uri = asset.localUri ?? asset.uri;

  let width = asset.width;
  let height = asset.height;

  if (!width || !height) {
    const size = await new Promise((resolve, reject) => {
      RNImage.getSize(
        uri,
        (resolvedWidth, resolvedHeight) =>
          resolve({
            width: resolvedWidth,
            height: resolvedHeight,
          }),
        reject
      );
    });

    width = size.width;
    height = size.height;
  }

  const texture = new THREE.Texture();
  texture.isDataTexture = true;
  texture.image = {
    data: asset,
    width,
    height,
  };
  texture.needsUpdate = true;

  return {
    texture,
    width,
    height,
  };
}

function fitCrestSize(width, height) {
  const ratio = width / height;

  const maxWidth = 2.66;
  const maxHeight = 3.00;

  let crestWidth = maxWidth;
  let crestHeight = crestWidth / ratio;

  if (crestHeight > maxHeight) {
    crestHeight = maxHeight;
    crestWidth = crestHeight * ratio;
  }

  return {
    crestWidth,
    crestHeight,
  };
}

function metalMaterial(
  color,
  metalness = 0.95,
  roughness = 0.22
) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  });
}

async function buildCrestMedallion() {
  const {
    texture: coinTexture,
    width,
    height,
  } = await loadExpoTexture(
    require('../../assets/usg-final-approved-coin.png')
  );

  const group = new THREE.Group();

  // ONE physical coin body.
  // Its silhouette is scaled to the same oval proportion as the approved face.
  const aspect = width / height;
  const faceHeight = 3.10;
  const faceWidth = faceHeight * aspect;

  const bodyRadius = 1.50;
  const bodyDepth = 0.065;

  const bodyGeometry = new THREE.CylinderGeometry(
    bodyRadius,
    bodyRadius,
    bodyDepth,
    128
  );

  // Side wall is intentionally UNLIT so it can never turn brown/dark.
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0xc99a36,
    metalness: 0.84,
    roughness: 0.42,
  });

  // Caps are fully transparent because the approved artwork is the coin face.
  const transparentCapMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const body = new THREE.Mesh(
    bodyGeometry,
    [
      sideMaterial,
      transparentCapMaterial,
      transparentCapMaterial,
    ]
  );

  body.rotation.x = Math.PI / 2;

  // Match the physical body silhouette to the approved face proportions.
  // No second disk can protrude around the face.
  const targetAspect = faceWidth / faceHeight;
  body.scale.set(targetAspect, 1, 1);

  group.add(body);

  // The approved crest coin is the entire visible face.
  const faceGeometry = new THREE.PlaneGeometry(
    faceWidth,
    faceHeight
  );

  const faceMaterial = new THREE.MeshBasicMaterial({
    map: coinTexture,
    transparent: true,
    alphaTest: 0.02,
    side: THREE.FrontSide,
    toneMapped: false,
    depthWrite: true,
  });

  const frontFace = new THREE.Mesh(
    faceGeometry,
    faceMaterial
  );
  frontFace.position.z = bodyDepth / 2 + 0.002;
  frontFace.renderOrder = 10;
  group.add(frontFace);

  const backFace = new THREE.Mesh(
    faceGeometry,
    faceMaterial
  );
  backFace.position.z = -(bodyDepth / 2 + 0.002);
  backFace.rotation.y = Math.PI;
  backFace.renderOrder = 10;
  group.add(backFace);

  group.position.z = -11;
  group.scale.setScalar(0.7);

  return {
    group,
    disposable: [
      coinTexture,
      bodyGeometry,
      faceGeometry,
      sideMaterial,
      transparentCapMaterial,
      faceMaterial,
    ],
  };
}

export default function USGIntro3DDirect({ onExplore }) {
  const animationFrame = useRef(null);
  const mounted = useRef(true);

  const [buttonReady, setButtonReady] = useState(false);
  const [sceneError, setSceneError] = useState('');

  const textOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const buttonOpacity = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    mounted.current = true;

    const textTimer = setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }).start();
    }, 2450);

    const buttonTimer = setTimeout(() => {
      setButtonReady(true);

      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 3750);

    return () => {
      mounted.current = false;

      clearTimeout(textTimer);
      clearTimeout(buttonTimer);

      if (animationFrame.current) {
        cancelAnimationFrame(
          animationFrame.current
        );
      }
    };
  }, [buttonOpacity, textOpacity]);

  async function handleContextCreate(gl) {
    let renderer;
    let scene;
    let camera;
    let medallionData;

    try {
      renderer = createRenderer(gl);
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        41,
        gl.drawingBufferWidth /
          gl.drawingBufferHeight,
        0.1,
        100
      );

      camera.position.set(0, 0, 7);

      const ambientLight =
        new THREE.AmbientLight(
          0xffffff,
          0.58
        );
      scene.add(ambientLight);

      // Strong warm top-front light for relief.
      const keyLight =
        new THREE.DirectionalLight(
          0xffd27a,
          2.15
        );
      keyLight.position.set(3.2, 6.2, 6.8);
      scene.add(keyLight);

      // Stronger side light, targeted to show coin thickness and relief edges.
      const rimLight =
        new THREE.DirectionalLight(
          0xd99a32,
          1.10
        );
      rimLight.position.set(-5.8, 1.0, 3.2);
      scene.add(rimLight);

      // Gentle opposing side light adds minted-metal separation.
      const sideFill =
        new THREE.DirectionalLight(
          0xffdf95,
          0.95
        );
      sideFill.position.set(5.5, -0.8, 2.8);
      scene.add(sideFill);

      // Low front fill, enough for readability without flattening.
      const frontFill =
        new THREE.DirectionalLight(
          0xffe6ad,
          0.38
        );
      frontFill.position.set(0, -2.0, 7);
      scene.add(frontFill);

      medallionData =
        await buildCrestMedallion();

      scene.add(medallionData.group);

      const clock = new THREE.Clock();

      if (mounted.current) {
        setSceneError('');
      }

      const render = () => {
        if (!mounted.current) {
          return;
        }

        const elapsed =
          clock.getElapsedTime();

        const arrivalDuration = 3.25;

        const progress = Math.min(
          elapsed / arrivalDuration,
          1
        );

        const eased =
          1 - Math.pow(1 - progress, 4);

        medallionData.group.position.z =
          -11 + eased * 11;

        const arrivalScale =
          0.7 + eased * 0.3;

        medallionData.group.scale.setScalar(
          arrivalScale
        );

        if (progress < 1) {
          medallionData.group.rotation.y =
            Math.sin(progress * Math.PI) *
            0.035;
        } else {
          medallionData.group.rotation.y +=
            0.0080;
        }

        medallionData.group.rotation.x =
          Math.sin(elapsed * 0.46) *
          0.010;

        renderer.render(
          scene,
          camera
        );

        gl.endFrameEXP();

        animationFrame.current =
          requestAnimationFrame(render);
      };

      render();
    } catch (error) {
      console.error(
        'USG medallion final polish error:',
        error
      );

      if (mounted.current) {
        setSceneError(
          error?.message ??
            '3D crest failed to load.'
        );
      }
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/usg-3d-world-bg-final.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View
        pointerEvents="none"
        style={styles.backgroundDarkener}
      />

      <View style={styles.scene}>
        <GLView
          style={styles.glView}
          onContextCreate={
            handleContextCreate
          }
        />
      </View>

      {!!sceneError && (
        <View style={styles.errorBadge}>
          <Text style={styles.errorText}>
            3D crest unavailable
          </Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.brandBlock,
          { opacity: textOpacity },
        ]}
      >
        <Text style={styles.brand}>
          USG — Unico Suo Genere™
        </Text>

        <Text style={styles.tagline}>
          The Global Cane Corso Mobile Ecosystem
        </Text>
      </Animated.View>

      <Animated.View
        pointerEvents={
          buttonReady ? 'auto' : 'none'
        }
        style={[
          styles.buttonWrap,
          { opacity: buttonOpacity },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.exploreButton,
            pressed &&
              styles.exploreButtonPressed,
          ]}
          onPress={onExplore}
        >
          <Text style={styles.exploreText}>
            EXPLORE
          </Text>

          <Text style={styles.exploreArrow}>
            ›
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030406',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  backgroundDarkener: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  scene: {
    position: 'absolute',
    top: '4%',
    width: '100%',
    height: '64%',
  },
  glView: {
    flex: 1,
  },
  errorBadge: {
    position: 'absolute',
    top: '30%',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor:
      'rgba(190, 74, 74, 0.45)',
    backgroundColor:
      'rgba(22, 8, 8, 0.82)',
  },
  errorText: {
    color: '#d9a0a0',
    fontSize: 11,
    letterSpacing: 1.4,
  },
  brandBlock: {
    position: 'absolute',
    bottom: 148,
    left: 24,
    right: 24,
    alignItems: 'center',
    backgroundColor:
      'rgba(0, 0, 0, 0.30)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  brand: {
    color: '#d4af37',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  tagline: {
    color: '#f1f1f1',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.9,
    marginTop: 8,
  },
  buttonWrap: {
    position: 'absolute',
    bottom: 58,
    left: 42,
    right: 42,
  },
  exploreButton: {
    minHeight: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#d0a235',
    backgroundColor:
      'rgba(10, 8, 4, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonPressed: {
    backgroundColor:
      'rgba(48, 38, 17, 0.96)',
    transform: [{ scale: 0.985 }],
  },
  exploreText: {
    color: '#e0b33b',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.6,
  },
  exploreArrow: {
    color: '#e0b33b',
    fontSize: 25,
    marginLeft: 12,
    marginTop: -2,
  },
});
