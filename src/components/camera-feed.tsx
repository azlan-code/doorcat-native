import * as ScreenOrientation from 'expo-screen-orientation';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

type FeedState = 'idle' | 'loading' | 'live' | 'error';

/** The intercom camera streams 1280x720. */
const ASPECT_RATIO = 16 / 9;
/** The OPi starts the camera on demand, which takes a second or two. */
const CONNECT_TIMEOUT_MS = 10_000;

/**
 * Page that shows the MJPEG stream in an <img> (WebKit renders multipart MJPEG natively)
 * and reports 'live' once the first frame has arrived, or 'error' if the request fails.
 */
function streamHtml(url: string) {
  // Escape '<' so the URL can never close the <script> tag.
  const src = JSON.stringify(url).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #000; }
  img { display: block; width: 100%; height: 100%; object-fit: contain; }
</style>
</head>
<body>
<img id="feed" alt="">
<script>
  var img = document.getElementById('feed');
  var poll = setInterval(function () {
    if (img.naturalWidth > 0) {
      clearInterval(poll);
      window.ReactNativeWebView.postMessage('live');
    }
  }, 100);
  img.onerror = function () {
    clearInterval(poll);
    window.ReactNativeWebView.postMessage('error');
  };
  img.src = ${src};
</script>
</body>
</html>`;
}

type Props = {
  streamUrl: string;
  /**
   * Start the feed when mounted with, or later given, a new non-null key, e.g. when opened from a
   * ring notification. A key rather than a boolean, so a second ring restarts the feed.
   */
  autoStartKey?: string | null;
};

export function CameraFeed({ streamUrl, autoStartKey = null }: Props) {
  const [state, setState] = useState<FeedState>(autoStartKey !== null ? 'loading' : 'idle');
  const [fullscreen, setFullscreen] = useState(false);
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const showFullscreen = state === 'live' && fullscreen;

  // Start the feed when the key changes while mounted (e.g. a notification tap with the app open).
  const [prevAutoStartKey, setPrevAutoStartKey] = useState(autoStartKey);
  if (autoStartKey !== prevAutoStartKey) {
    setPrevAutoStartKey(autoStartKey);
    if (autoStartKey !== null) setState('loading');
  }

  // Give up if the first frame doesn't arrive in time.
  useEffect(() => {
    if (state !== 'loading') return;
    const timer = setTimeout(() => setState('error'), CONNECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  // Close the stream when the app goes to the background so the OPi can turn the camera off.
  // 'inactive' (e.g. pulling down Notification Center) keeps the feed running.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState !== 'background') return;
      setFullscreen(false);
      setState((prev) => (prev === 'error' ? prev : 'idle'));
    });
    return () => subscription.remove();
  }, []);

  const source = useMemo(
    () => ({ html: streamHtml(streamUrl), baseUrl: streamUrl.match(/^https?:\/\/[^/]+/)?.[0] }),
    [streamUrl],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === 'live') {
      setState((prev) => (prev === 'loading' ? 'live' : prev));
    } else if (event.nativeEvent.data === 'error') {
      setFullscreen(false);
      setState('error');
    }
  };

  const handleFailure = () => {
    setFullscreen(false);
    setState('error');
  };

  // Allow rotating to landscape only while the full-screen feed is open.
  useEffect(() => {
    if (!showFullscreen) return;
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [showFullscreen]);

  // Largest 16:9 frame that fits the window in either orientation.
  const streamWidth = Math.min(window.width, window.height * ASPECT_RATIO);

  const start = () => setState('loading');
  const stop = () => {
    setFullscreen(false);
    setState('idle');
  };

  // Only one copy of the stream is rendered at a time: in the card, or in the full-screen modal.
  // Mounting it opens the connection (which turns the OPi camera on); unmounting closes it.
  const stream = (
    <View style={styles.stream} pointerEvents="none">
      <WebView
        source={source}
        originWhitelist={['*']}
        onMessage={handleMessage}
        onError={handleFailure}
        onContentProcessDidTerminate={handleFailure}
        scrollEnabled={false}
        bounces={false}
        style={styles.stream}
      />
    </View>
  );
  const streaming = state === 'loading' || state === 'live';

  const liveBadge = (
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      {state === 'idle' && (
        <View style={styles.center}>
          <SymbolView name="video.slash" size={40} tintColor="#8e8e93" />
          <Pressable
            onPress={start}
            style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
            <Text style={styles.pillText}>Show camera</Text>
          </Pressable>
        </View>
      )}

      {/* Mounted while loading too, behind the spinner: that's what starts the camera. */}
      {streaming && !fullscreen && stream}

      {state === 'loading' && (
        <View style={[styles.center, styles.overlay]}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.caption}>Connecting…</Text>
        </View>
      )}

      {state === 'live' && (
        <>
          {fullscreen && (
            <View style={styles.center}>
              <Text style={styles.caption}>Showing full screen</Text>
            </View>
          )}
          <View style={styles.cardBadge}>{liveBadge}</View>
          <Pressable
            onPress={stop}
            style={({ pressed }) => [styles.hideButton, pressed && styles.pressed]}>
            <Text style={styles.pillText}>Hide</Text>
          </Pressable>
          <Pressable
            onPress={() => setFullscreen(true)}
            hitSlop={8}
            accessibilityLabel="Full screen"
            style={({ pressed }) => [styles.expandButton, pressed && styles.pressed]}>
            <SymbolView name="arrow.up.left.and.arrow.down.right" size={16} tintColor="#fff" />
          </Pressable>
        </>
      )}

      <Modal
        visible={showFullscreen}
        animationType="fade"
        presentationStyle="fullScreen"
        supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}
        statusBarTranslucent
        onRequestClose={() => setFullscreen(false)}>
        <View style={styles.fullscreen}>
          <View style={[styles.fullscreenStream, { width: streamWidth }]}>{stream}</View>
          <View
            style={[
              styles.fullscreenBar,
              { top: insets.top + 8, left: insets.left + 16, right: insets.right + 16 },
            ]}>
            {liveBadge}
            <Pressable
              onPress={() => setFullscreen(false)}
              hitSlop={8}
              accessibilityLabel="Exit full screen"
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <SymbolView name="xmark" size={16} tintColor="#fff" />
            </Pressable>
          </View>
        </View>
      </Modal>

      {state === 'error' && (
        <View style={styles.center}>
          <SymbolView name="exclamationmark.triangle" size={36} tintColor="#ff9f0a" />
          <Text style={styles.caption}>Couldn&apos;t connect to the camera</Text>
          <Pressable
            onPress={start}
            style={({ pressed }) => [styles.pill, pressed && styles.pressed]}>
            <Text style={styles.pillText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: ASPECT_RATIO,
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  caption: {
    color: '#8e8e93',
    fontSize: 13,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  expandButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  fullscreenStream: {
    aspectRatio: ASPECT_RATIO,
  },
  stream: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000',
  },
  fullscreenBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  hideButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
