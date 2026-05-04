import { AlertType } from './alertEmitter';

export interface ConfirmOptions {
  message: string;
  emoji?: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
}

type ConfirmListener = (options: ConfirmOptions, resolve: (value: boolean) => void) => void;

let _listener: ConfirmListener | null = null;

export const confirmEmitter = {
  on: (fn: ConfirmListener) => { _listener = fn; },
  off: () => { _listener = null; },
};

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (_listener) {
      _listener(options, resolve);
    } else {
      resolve(window.confirm(options.message));
    }
  });
}
