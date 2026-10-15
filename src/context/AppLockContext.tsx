import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialCompanySettings } from '../data/seedData';

interface AppLockContextType {
  isLocked: boolean;
  lockApp: () => void;
  unlockWithPin: (pin: string) => boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  resetPinWithSecurityAnswer: (answer: string, newPin: string) => boolean;
  changePin: (currentPin: string, newPin: string) => boolean;
  appLockEnabled: boolean;
  setAppLockEnabled: (enabled: boolean) => void;
  autoLockMinutes: number;
  setAutoLockMinutes: (minutes: number) => void;
  currentPin: string;
  securityQuestion: string;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LOCKED: 'wasoolipk_is_locked',
  PIN: 'wasoolipk_pin',
  ENABLED: 'wasoolipk_lock_enabled',
  AUTOLOCK_MINS: 'wasoolipk_autolock_minutes',
  SECURITY_Q: 'wasoolipk_sec_q',
  SECURITY_A: 'wasoolipk_sec_a',
  LAST_ACTIVITY: 'wasoolipk_last_activity'
};

export const AppLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pin, setPin] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PIN) || initialCompanySettings.appLockPin;
  });

  const [appLockEnabled, setAppLockEnabledState] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.ENABLED);
    return val !== null ? JSON.parse(val) : true;
  });

  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.AUTOLOCK_MINS);
    return val ? parseInt(val, 10) : initialCompanySettings.autoLockMinutes;
  });

  const [securityQuestion] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SECURITY_Q) || initialCompanySettings.securityQuestion;
  });

  const [securityAnswer, setSecurityAnswer] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SECURITY_A) || initialCompanySettings.securityAnswer;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    // If lock is enabled, start locked for true security
    const enabled = localStorage.getItem(STORAGE_KEYS.ENABLED);
    const isEn = enabled !== null ? JSON.parse(enabled) : true;
    return isEn;
  });

  // Track user activity to trigger auto-lock
  useEffect(() => {
    if (!appLockEnabled || autoLockMinutes <= 0) return;

    let timeoutId: number;

    const resetTimer = () => {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsLocked(true);
        localStorage.setItem(STORAGE_KEYS.LOCKED, 'true');
      }, autoLockMinutes * 60 * 1000);
    };

    const handleUserActivity = () => {
      if (!isLocked) {
        resetTimer();
      }
    };

    resetTimer();

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [appLockEnabled, autoLockMinutes, isLocked]);

  const lockApp = () => {
    setIsLocked(true);
    localStorage.setItem(STORAGE_KEYS.LOCKED, 'true');
  };

  const unlockWithPin = (enteredPin: string): boolean => {
    if (enteredPin === pin) {
      setIsLocked(false);
      localStorage.setItem(STORAGE_KEYS.LOCKED, 'false');
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
      return true;
    }
    return false;
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    // Simulate fingerprint / FaceID sensor recognition
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLocked(false);
    localStorage.setItem(STORAGE_KEYS.LOCKED, 'false');
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    return true;
  };

  const changePin = (currentPinInput: string, newPinInput: string): boolean => {
    if (currentPinInput === pin && newPinInput.length >= 4) {
      setPin(newPinInput);
      localStorage.setItem(STORAGE_KEYS.PIN, newPinInput);
      return true;
    }
    return false;
  };

  const resetPinWithSecurityAnswer = (answer: string, newPinInput: string): boolean => {
    if (answer.trim().toLowerCase() === securityAnswer.trim().toLowerCase() && newPinInput.length >= 4) {
      setPin(newPinInput);
      localStorage.setItem(STORAGE_KEYS.PIN, newPinInput);
      setIsLocked(false);
      localStorage.setItem(STORAGE_KEYS.LOCKED, 'false');
      return true;
    }
    return false;
  };

  const setAppLockEnabled = (enabled: boolean) => {
    setAppLockEnabledState(enabled);
    localStorage.setItem(STORAGE_KEYS.ENABLED, JSON.stringify(enabled));
    if (!enabled) {
      setIsLocked(false);
      localStorage.setItem(STORAGE_KEYS.LOCKED, 'false');
    }
  };

  const setAutoLockMinutes = (minutes: number) => {
    setAutoLockMinutesState(minutes);
    localStorage.setItem(STORAGE_KEYS.AUTOLOCK_MINS, minutes.toString());
  };

  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        lockApp,
        unlockWithPin,
        unlockWithBiometrics,
        resetPinWithSecurityAnswer,
        changePin,
        appLockEnabled,
        setAppLockEnabled,
        autoLockMinutes,
        setAutoLockMinutes,
        currentPin: pin,
        securityQuestion
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

export const useAppLock = () => {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
};
