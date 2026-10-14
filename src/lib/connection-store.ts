import * as SecureStore from 'expo-secure-store';

import type { ConnectionSettings } from './types';

const KEY = 'connection';

// Readable after the first unlock since boot, so a launch from a ring notification while the
// phone is locked still finds the settings. Reads must pass the same options as writes.
const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

// TODO: placeholder server URL until the OPi address is known
const DEFAULT_CONNECTION: ConnectionSettings = {
  serverUrl: 'http://doorcat.local:8080',
  token: '',
};

/** Reads the saved server URL and auth token, falling back to the defaults. Synchronous, so the first render already has them. */
export function loadConnection(): ConnectionSettings {
  try {
    const saved = SecureStore.getItem(KEY, OPTIONS);
    if (!saved) return DEFAULT_CONNECTION;
    const { serverUrl, token } = JSON.parse(saved) as Partial<ConnectionSettings>;
    return {
      serverUrl: typeof serverUrl === 'string' ? serverUrl : DEFAULT_CONNECTION.serverUrl,
      token: typeof token === 'string' ? token : DEFAULT_CONNECTION.token,
    };
  } catch (error) {
    console.warn('Could not read the saved connection settings:', error);
    return DEFAULT_CONNECTION;
  }
}

export function saveConnection(connection: ConnectionSettings) {
  SecureStore.setItemAsync(KEY, JSON.stringify(connection), OPTIONS).catch((error) => {
    console.warn('Could not save the connection settings:', error);
  });
}
