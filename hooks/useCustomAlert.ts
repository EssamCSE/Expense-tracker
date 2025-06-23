import { useState, useCallback } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
  showIcon?: boolean;
}

interface AlertState extends AlertOptions {
  visible: boolean;
}

export const useCustomAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'info',
    showIcon: true,
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      visible: true,
      title: options.title,
      message: options.message,
      buttons: options.buttons || [{ text: 'OK', style: 'default' }],
      type: options.type || 'info',
      showIcon: options.showIcon !== false,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods for different alert types
  const showSuccess = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons,
      type: 'success',
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons,
      type: 'error',
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons,
      type: 'warning',
    });
  }, [showAlert]);

  const showConfirmation = useCallback((
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: onConfirm,
        },
      ],
    });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showConfirmation,
  };
};