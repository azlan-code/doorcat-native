import { useLocalSearchParams } from 'expo-router';

import { Home } from '@/screens/home';

export default function HomeScreen() {
  // doorcat://?camera=1 starts the camera. Tapping a ring notification adds ring=<notification id>,
  // so each ring restarts the feed (see src/lib/notifications.tsx).
  const { camera, ring } = useLocalSearchParams<{ camera?: string; ring?: string }>();
  return <Home autoStartKey={camera === '1' ? (ring ?? 'link') : null} />;
}
