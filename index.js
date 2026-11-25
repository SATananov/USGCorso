import { registerRootComponent } from 'expo';

const useGesturesSafeTest =
  __DEV__ && process.env.EXPO_PUBLIC_GESTURES_SAFE_TEST === '1';

const App = useGesturesSafeTest
  ? require('./src/screens/GesturesSafeTestScreen').default
  : require('./App').default;

registerRootComponent(App);