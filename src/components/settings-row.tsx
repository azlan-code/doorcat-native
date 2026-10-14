import type { ReactNode } from 'react';
import { PlatformColor, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  detail?: string;
  onPress?: () => void;
  /** Content rendered on the trailing edge, e.g. reorder controls. */
  accessory?: ReactNode;
  destructive?: boolean;
  tinted?: boolean;
};

export function SettingsRow({ label, detail, onPress, accessory, destructive, tinted }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.text}>
        <Text
          style={[styles.label, tinted && styles.tinted, destructive && styles.destructive]}
          numberOfLines={1}>
          {label}
        </Text>
        {detail && (
          <Text style={styles.detail} numberOfLines={1}>
            {detail}
          </Text>
        )}
      </View>
      {accessory}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pressed: {
    backgroundColor: PlatformColor('systemGray5'),
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: PlatformColor('label'),
    fontSize: 17,
  },
  detail: {
    color: PlatformColor('secondaryLabel'),
    fontSize: 13,
    fontFamily: 'Menlo',
  },
  tinted: {
    color: PlatformColor('link'),
  },
  destructive: {
    color: PlatformColor('systemRed'),
  },
});
