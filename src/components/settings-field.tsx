import { PlatformColor, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

type Props = TextInputProps & {
  label: string;
};

export function SettingsField({ label, ...inputProps }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        clearButtonMode="while-editing"
        placeholderTextColor={PlatformColor('placeholderText')}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  label: {
    width: 100,
    color: PlatformColor('label'),
    fontSize: 17,
  },
  input: {
    flex: 1,
    color: PlatformColor('label'),
    fontSize: 17,
    paddingVertical: 10,
  },
});
