export type ActionButton = {
  id: string;
  label: string;
  /** Command value sent to the OPi when the button is pressed. */
  value: string;
};

export type ConnectionSettings = {
  serverUrl: string;
  token: string;
};
