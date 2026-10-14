import type { ConnectionSettings } from './types';

function baseUrl(serverUrl: string) {
  return serverUrl.replace(/\/+$/, '');
}

/**
 * MJPEG camera stream on the OPi. The token goes in the query string because the
 * stream is shown in an <img>, which can't send an Authorization header.
 */
export function streamUrl({ serverUrl, token }: ConnectionSettings) {
  return `${baseUrl(serverUrl)}/stream.mjpg?token=${encodeURIComponent(token)}`;
}

/**
 * Run a named action on the OPi (a button's `value`). Resolves once the motor has finished,
 * which can take several seconds.
 */
export async function sendCommand({ serverUrl, token }: ConnectionSettings, value: string) {
  const response = await fetch(`${baseUrl(serverUrl)}/command`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Wrong auth token');
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Server replied ${response.status}`);
  }
}

/** Register this phone's APNs device token so the OPi notifies it when someone rings. */
export async function registerDevice(
  { serverUrl, token }: ConnectionSettings,
  deviceToken: string,
  signal?: AbortSignal,
) {
  const response = await fetch(`${baseUrl(serverUrl)}/devices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: deviceToken }),
    signal,
  });
  if (!response.ok) {
    throw new Error(response.status === 401 ? 'Wrong auth token' : `Server replied ${response.status}`);
  }
}
