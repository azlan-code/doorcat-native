# Doorcat

An iPhone app for a DIY door intercom. It shows the live camera feed from an Orange Pi
controller on your home network, lets you buzz people in with configurable buttons, and
gets a notification when someone rings.

Built with [Expo](https://docs.expo.dev) SDK 57, Expo Router and React Native.

## Features

- **Live camera** – MJPEG stream from the Orange Pi, started on demand. Tap to go full
  screen (landscape allowed); the stream closes when the app goes to the background so the
  Pi can turn the camera off.
- **Action buttons** – a grid of buttons on the home screen (e.g. *Buzz in*, *Talk*,
  *Hang up*). Each sends a command value to the Pi. Add, edit, reorder and delete them in
  Settings.
- **Ring notifications** – the app registers its APNs device token with the Pi. When
  someone rings, the Pi sends a time-sensitive push; tapping it opens the app with the
  camera already running.
- **Settings** – server URL and auth token, stored in the iOS keychain via
  `expo-secure-store`.

## Getting started

```bash
npm install
npx expo start
```

The app uses native modules (notifications, secure store, WebView, SF Symbols) and
iOS-only UI, so run it in a development build rather than Expo Go:

```bash
npx expo run:ios
# or
npx eas-cli@latest build --profile development --platform ios
```

Then open **Settings** in the app and enter the Orange Pi's URL (default
`http://doorcat.local:8080`) and its auth token.

### Scripts

| Command             | What it does          |
| ------------------- | --------------------- |
| `npm start`         | Start the dev server  |
| `npm run ios`       | Start and open on iOS |
| `npm run lint`      | ESLint                |
| `npm run typecheck` | `tsc --noEmit`        |

## Controller API

The app talks to a small HTTP server on the Orange Pi (kept in a separate repo). It
expects these endpoints, all authenticated with the token from Settings:

| Endpoint                   | Purpose                                                   |
| -------------------------- | --------------------------------------------------------- |
| `GET /stream.mjpg?token=…` | MJPEG camera stream (token in the query, shown in an img) |
| `POST /command`            | `{ "value": "buzz" }` – run an action, `Bearer` auth      |
| `POST /devices`            | `{ "token": "<apns token>" }` – register for ring pushes  |

Deep link: `doorcat://?camera=1` opens the app with the camera on.

## Project layout

```
src/
  app/            Expo Router routes
    _layout.tsx   Root stack, theme, config + notification providers
    index.tsx     Home (camera + buttons)
    settings.tsx  Settings
    button/[id]   Add/edit a button (form sheet; id "new" adds one)
  screens/        Screen implementations used by the routes
  components/     Camera feed, button grid, settings rows/fields/sections
  lib/
    api.ts              Calls to the Orange Pi
    config-context.tsx  Buttons + connection settings state
    connection-store.ts Keychain persistence for the connection
    notifications.tsx   Push registration and ring handling
    types.ts            Shared types
```
