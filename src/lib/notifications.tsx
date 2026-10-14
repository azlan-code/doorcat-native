import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { registerDevice } from './api';
import { useConfig } from './config-context';
import type { ConnectionSettings } from './types';

export type RegistrationStatus =
  | { state: 'unconfigured' }
  | { state: 'pending' }
  | { state: 'registered' }
  | { state: 'denied' }
  | { state: 'error'; message: string };

// Settings updates the connection on every keystroke; wait for typing to stop before registering.
const REGISTER_DEBOUNCE_MS = 1000;

// Show the ring banner and play its sound even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Every notification the OPi sends is a ring, so a tap always opens Home with the camera on.
 * The notification id makes each ring restart the feed, even if the last one already set camera=1.
 */
function openCamera(response: Notifications.NotificationResponse) {
  router.navigate({
    pathname: '/',
    params: { camera: '1', ring: response.notification.request.identifier },
  });
}

const RingNotificationsContext = createContext<RegistrationStatus>({ state: 'unconfigured' });

/** Registers this phone with the OPi for ring notifications and opens the camera when one is tapped. */
export function RingNotificationsProvider({ children }: { children: ReactNode }) {
  const { connection } = useConfig();
  // The outcome of registering with a particular connection. While a newer connection is still
  // being registered, the status reads as pending.
  const [result, setResult] = useState<{ connection: ConnectionSettings; status: RegistrationStatus }>();
  const configured = Boolean(connection.serverUrl && connection.token);
  const status: RegistrationStatus = !configured
    ? { state: 'unconfigured' }
    : result?.connection === connection
      ? result.status
      : { state: 'pending' };

  useEffect(() => {
    // A tap that launched the app from a killed state.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      openCamera(response);
      Notifications.clearLastNotificationResponseAsync();
    });
    // Taps while the app is running or in the background.
    const subscription = Notifications.addNotificationResponseReceivedListener(openCamera);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!configured) return;
    const controller = new AbortController();
    const setStatus = (status: RegistrationStatus) => setResult({ connection, status });
    const timer = setTimeout(async () => {
      try {
        const { granted } = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowSound: true, allowBadge: true },
        });
        if (!granted) {
          setStatus({ state: 'denied' });
          return;
        }
        // The raw APNs token: the OPi talks to APNs directly, not through Expo's push service.
        const { data } = await Notifications.getDevicePushTokenAsync();
        await registerDevice(connection, data, controller.signal);
        setStatus({ state: 'registered' });
      } catch (error) {
        if (controller.signal.aborted) return;
        setStatus({ state: 'error', message: error instanceof Error ? error.message : String(error) });
      }
    }, REGISTER_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [connection, configured]);

  return <RingNotificationsContext.Provider value={status}>{children}</RingNotificationsContext.Provider>;
}

export function useRingNotifications() {
  return useContext(RingNotificationsContext);
}
