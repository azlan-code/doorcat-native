import { Link } from 'expo-router';
import { PlatformColor, Pressable, StyleSheet, Text, View } from 'react-native';

import type { ActionButton } from '@/lib/types';

type Props = {
  buttons: ActionButton[];
  onPress: (button: ActionButton) => void;
};

export function ActionButtonGrid({ buttons, onPress }: Props) {
  if (buttons.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No buttons configured.</Text>
        <Link href="/settings" style={styles.emptyLink}>
          Add buttons in Settings
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {buttons.map((button) => (
        <Pressable
          key={button.id}
          onPress={() => onPress(button)}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
          <Text style={styles.label} numberOfLines={2}>
            {button.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: PlatformColor('systemBlue'),
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  emptyText: {
    color: PlatformColor('secondaryLabel'),
    fontSize: 15,
  },
  emptyLink: {
    color: PlatformColor('link'),
    fontSize: 15,
  },
});
