import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { loadConnection, saveConnection } from './connection-store';
import { MOCK_BUTTONS } from './mock-data';
import type { ActionButton, ConnectionSettings } from './types';

type ConfigContextValue = {
  buttons: ActionButton[];
  connection: ConnectionSettings;
  setConnection: (connection: ConnectionSettings) => void;
  addButton: (button: Omit<ActionButton, 'id'>) => void;
  updateButton: (button: ActionButton) => void;
  removeButton: (id: string) => void;
  moveButton: (id: string, direction: -1 | 1) => void;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  // TODO: seed from GET /config/buttons on the OPi instead of mock data
  const [buttons, setButtons] = useState<ActionButton[]>(MOCK_BUTTONS);
  const [connection, setConnectionState] = useState<ConnectionSettings>(loadConnection);

  const value = useMemo<ConfigContextValue>(
    () => ({
      buttons,
      connection,
      setConnection: (next) => {
        setConnectionState(next);
        saveConnection(next);
      },
      // TODO: PUT updated button config to the OPi (in-memory only for now)
      addButton: (button) =>
        setButtons((prev) => [...prev, { ...button, id: `${Date.now()}` }]),
      // TODO: PUT updated button config to the OPi (in-memory only for now)
      updateButton: (button) =>
        setButtons((prev) => prev.map((b) => (b.id === button.id ? button : b))),
      // TODO: PUT updated button config to the OPi (in-memory only for now)
      removeButton: (id) => setButtons((prev) => prev.filter((b) => b.id !== id)),
      // TODO: PUT updated button config to the OPi (in-memory only for now)
      moveButton: (id, direction) =>
        setButtons((prev) => {
          const index = prev.findIndex((b) => b.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= prev.length) return prev;
          const next = [...prev];
          [next[index], next[target]] = [next[target], next[index]];
          return next;
        }),
    }),
    [buttons, connection],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within a ConfigProvider');
  return context;
}
