export type AlertType = 'info' | 'success' | 'error' | 'warning';

type Listener = (message: string, emoji: string, type: AlertType) => void;

let _listener: Listener | null = null;

export const alertEmitter = {
  on: (fn: Listener) => { _listener = fn; },
  off: () => { _listener = null; },
};

export function showAlert(message: string, emoji = '🍎', type: AlertType = 'info') {
  _listener?.(message, emoji, type);
}
