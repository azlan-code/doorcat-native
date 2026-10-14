import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { ConfigProvider } from '@/lib/config-context';
import { RingNotificationsProvider } from '@/lib/notifications';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // The app is portrait-only; the full-screen camera unlocks rotation while it's open.
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ConfigProvider>
        <RingNotificationsProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'Doorcat' }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen
              name="button/[id]"
              options={{
                presentation: 'formSheet',
                sheetAllowedDetents: [0.5, 1],
                sheetGrabberVisible: true,
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </RingNotificationsProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
