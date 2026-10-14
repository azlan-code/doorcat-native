import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Linking, PlatformColor, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SettingsField } from '@/components/settings-field';
import { SettingsRow } from '@/components/settings-row';
import { SettingsSection } from '@/components/settings-section';
import { useConfig } from '@/lib/config-context';
import { useRingNotifications, type RegistrationStatus } from '@/lib/notifications';

export function Settings() {
  const router = useRouter();
  const { buttons, connection, setConnection, removeButton, moveButton } = useConfig();
  const [editing, setEditing] = useState(false);
  const ringStatus = useRingNotifications();

  return (
    <ScrollView
      style={styles.scroll}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="interactive"
      contentContainerStyle={styles.content}>
      <SettingsSection title="Connection" footer="Address and API key of the Doorcat Orange Pi.">
        <SettingsField
          label="Server URL"
          value={connection.serverUrl}
          onChangeText={(serverUrl) => setConnection({ ...connection, serverUrl })}
          placeholder="http://doorcat.local:8080"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <SettingsField
          label="Auth token"
          value={connection.token}
          onChangeText={(token) => setConnection({ ...connection, token })}
          placeholder="Required"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </SettingsSection>

      <SettingsSection
        title="Ring notifications"
        footer="The Orange Pi sends a time-sensitive notification when someone rings. Tap it to open the camera.">
        <SettingsRow
          label={RING_STATUS_LABELS[ringStatus.state]}
          detail={ringStatus.state === 'error' ? ringStatus.message : undefined}
          tinted={ringStatus.state === 'denied'}
          onPress={ringStatus.state === 'denied' ? () => Linking.openSettings() : undefined}
        />
      </SettingsSection>

      <SettingsSection
        title="Buttons"
        action={{ label: editing ? 'Done' : 'Edit', onPress: () => setEditing((e) => !e) }}
        footer="Buttons appear on the home screen in this order. The value is the command sent to the Orange Pi. Button config is stored on the Orange Pi and shared by all phones.">
        {buttons.map((button, index) => (
          <SettingsRow
            key={button.id}
            label={button.label}
            detail={button.value}
            onPress={editing ? undefined : () => router.push(`/button/${button.id}`)}
            accessory={
              editing ? (
                <View style={styles.editControls}>
                  <IconButton
                    name="arrow.up"
                    disabled={index === 0}
                    onPress={() => moveButton(button.id, -1)}
                  />
                  <IconButton
                    name="arrow.down"
                    disabled={index === buttons.length - 1}
                    onPress={() => moveButton(button.id, 1)}
                  />
                  <IconButton
                    name="minus.circle.fill"
                    tint={PlatformColor('systemRed')}
                    onPress={() => removeButton(button.id)}
                  />
                </View>
              ) : (
                <SymbolView name="chevron.right" size={14} tintColor={PlatformColor('tertiaryLabel')} />
              )
            }
          />
        ))}
        <SettingsRow label="Add button" tinted onPress={() => router.push('/button/new')} />
      </SettingsSection>
    </ScrollView>
  );
}

const RING_STATUS_LABELS: Record<RegistrationStatus['state'], string> = {
  unconfigured: 'Enter the server URL and auth token',
  pending: 'Registering…',
  registered: 'Registered with the Orange Pi',
  denied: 'Notifications are off. Open Settings',
  error: 'Registration failed',
};

function IconButton({
  name,
  onPress,
  disabled,
  tint = PlatformColor('link'),
}: {
  name: 'arrow.up' | 'arrow.down' | 'minus.circle.fill';
  onPress: () => void;
  disabled?: boolean;
  tint?: ReturnType<typeof PlatformColor>;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={6} style={disabled && styles.disabled}>
      <SymbolView name={name} size={20} tintColor={tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: PlatformColor('systemGroupedBackground'),
  },
  content: {
    padding: 16,
    gap: 28,
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  disabled: {
    opacity: 0.3,
  },
});
