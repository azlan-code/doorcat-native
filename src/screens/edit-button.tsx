import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, PlatformColor, ScrollView, StyleSheet } from 'react-native';

import { SettingsField } from '@/components/settings-field';
import { SettingsRow } from '@/components/settings-row';
import { SettingsSection } from '@/components/settings-section';
import { useConfig } from '@/lib/config-context';

type Props = {
  /** Button id, or 'new' to add a button. */
  id: string;
};

export function EditButton({ id }: Props) {
  const router = useRouter();
  const { buttons, addButton, updateButton, removeButton } = useConfig();
  const existing = buttons.find((b) => b.id === id);
  const isNew = id === 'new' || !existing;

  const [label, setLabel] = useState(existing?.label ?? '');
  const [value, setValue] = useState(existing?.value ?? '');
  const canSave = label.trim() !== '' && value.trim() !== '';

  const save = () => {
    if (!canSave) {
      Alert.alert('Missing fields', 'Both a label and a value are required.');
      return;
    }
    const button = { label: label.trim(), value: value.trim() };
    if (existing) updateButton({ ...existing, ...button });
    else addButton(button);
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(`Delete "${existing.label}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeButton(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Title>{isNew ? 'New Button' : 'Edit Button'}</Stack.Title>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={save}>Save</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <SettingsSection footer="The label is shown on the home screen. The value is the command sent to the Orange Pi.">
          <SettingsField label="Label" value={label} onChangeText={setLabel} placeholder="Buzz in" autoFocus={isNew} />
          <SettingsField
            label="Value"
            value={value}
            onChangeText={setValue}
            placeholder="buzz"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </SettingsSection>

        {!isNew && (
          <SettingsSection>
            <SettingsRow label="Delete Button" destructive onPress={confirmDelete} />
          </SettingsSection>
        )}
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
    gap: 28,
  },
});
