import type { ActionButton } from './types';

// TODO: replace with GET /config/buttons from the OPi
export const MOCK_BUTTONS: ActionButton[] = [
  { id: 'buzz', label: 'Buzz in', value: 'buzz' },
  { id: 'talk', label: 'Talk', value: 'talk' },
  { id: 'hangup', label: 'Hang up', value: 'hangup' },
];
