import { Stack, useRouter } from 'expo-router';
import { Alert, PlatformColor, ScrollView, StyleSheet } from 'react-native';

import { ActionButtonGrid } from '@/components/action-button-grid';
import { CameraFeed } from '@/components/camera-feed';
import { sendCommand, streamUrl } from '@/lib/api';
import { useConfig } from '@/lib/config-context';
import type { ActionButton } from '@/lib/types';

type Props = {
  /** Starts the camera whenever this changes to a new non-null value. */
  autoStartKey?: string | null;
};

export function Home({ autoStartKey = null }: Props) {
  const router = useRouter();
  const { buttons, connection } = useConfig();

  const handleAction = async (button: ActionButton) => {
    try {
      await sendCommand(connection, button.value);
    } catch (error) {
      Alert.alert(`${button.label} failed`, error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="gearshape" onPress={() => router.push('/settings')} />
      </Stack.Toolbar>

      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}>
        <CameraFeed streamUrl={streamUrl(connection)} autoStartKey={autoStartKey} />
        <ActionButtonGrid buttons={buttons} onPress={handleAction} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: PlatformColor('systemGroupedBackground'),
  },
  content: {
    padding: 16,
    gap: 20,
  },
});
