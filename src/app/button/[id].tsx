import { useLocalSearchParams } from 'expo-router';

import { EditButton } from '@/screens/edit-button';

export default function EditButtonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditButton id={id} />;
}
