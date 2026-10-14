import { Children, Fragment, type ReactNode } from 'react';
import { PlatformColor, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title?: string;
  footer?: string;
  /** Text button shown on the trailing edge of the section header, e.g. Edit/Done. */
  action?: { label: string; onPress: () => void };
  children: ReactNode;
};

export function SettingsSection({ title, footer, action, children }: Props) {
  const rows = Children.toArray(children);

  return (
    <View style={styles.section}>
      {(title || action) && (
        <View style={styles.header}>
          <Text style={styles.title}>{title?.toUpperCase()}</Text>
          {action && (
            <Pressable onPress={action.onPress} hitSlop={8}>
              {({ pressed }) => (
                <Text style={[styles.action, pressed && styles.pressed]}>{action.label}</Text>
              )}
            </Pressable>
          )}
        </View>
      )}
      <View style={styles.group}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 && <View style={styles.separator} />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer && <Text style={styles.footer}>{footer}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    color: PlatformColor('secondaryLabel'),
    fontSize: 13,
  },
  action: {
    color: PlatformColor('link'),
    fontSize: 15,
  },
  pressed: {
    opacity: 0.5,
  },
  group: {
    backgroundColor: PlatformColor('secondarySystemGroupedBackground'),
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
    backgroundColor: PlatformColor('separator'),
  },
  footer: {
    color: PlatformColor('secondaryLabel'),
    fontSize: 13,
    paddingHorizontal: 16,
  },
});
