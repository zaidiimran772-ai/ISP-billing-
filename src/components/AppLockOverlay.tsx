import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Delete, Fingerprint, KeyRound, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAppLock } from '../context/AppLockContext';

export const AppLockOverlay: React.FC = () => {
  const {
    isLocked,
    unlockWithPin,
    unlockWithBiometrics,
    resetPinWithSecurityAnswer,
    securityQuestion,
    currentPin
  } = useAppLock();

  const [pinInput, setPinInput] = useState<string>('');
  const [errorShake, setErrorShake] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isScanningBiometric, setIsScanningBiometric] = useState<boolean>(false);
  const [isForgotOpen, setIsForgotOpen] = useState<boolean>(false);
  
  // Forgot PIN state
  const [securityAnswerInput, setSecurityAnswerInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [forgotError, setForgotError] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isLocked) {
      setPinInput('');
      setErrorMessage('');
      setIsForgotOpen(false);
    }
  }, [isLocked]);

  // Handle keyboard typing
  useEffect(() => {
    if (!isLocked || isForgotOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter' && pinInput.length === 4) {
        verifyPin(pinInput);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, isForgotOpen, pinInput]);

  const handleDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMessage('');
      
      if (nextPin.length === 4) {
        // Auto verify upon 4 digits
        setTimeout(() => {
          verifyPin(nextPin);
        }, 120);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMessage('');
  };

  const verifyPin = (candidatePin: string) => {
    const success = unlockWithPin(candidatePin);
    if (!success) {
      setErrorShake(true);
      setErrorMessage('Incorrect PIN. Please try again.');
      setTimeout(() => {
        setErrorShake(false);
        setPinInput('');
      }, 500);
    }
  };

  const handleBiometricClick = async () => {
    setIsScanningBiometric(true);
    setErrorMessage('');
    try {
      await unlockWithBiometrics();
    } catch {
      setErrorMessage('Biometrics verification failed');
    } finally {
      setIsScanningBiometric(false);
    }
  };

  const handleResetPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (newPinInput.length < 4) {
      setForgotError('New PIN must be at least 4 digits');
      return;
    }
    const success = resetPinWithSecurityAnswer(securityAnswerInput, newPinInput);
    if (success) {
      setForgotSuccess(true);
      setTimeout(() => {
        setIsForgotOpen(false);
        setForgotSuccess(false);
        setSecurityAnswerInput('');
        setNewPinInput('');
      }, 1200);
    } else {
      setForgotError('Incorrect security answer. Default answer is: fibernet');
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden text-center z-10"
      >
        {/* Top Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>WasooliPK Secured Access</span>
        </div>

        {/* Brand & Lock Icon */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Lock className="w-9 h-9 text-slate-950" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-700">
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">WasooliPK Billing Lock</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter 4-digit master PIN to unlock ISP accounts & cash drawer
        </p>

        {/* PIN Dots Display */}
        <motion.div
          animate={errorShake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 my-6"
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-lg shadow-emerald-400/50'
                    : 'border-2 border-slate-700 bg-slate-800/80'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Error message */}
        <div className="h-5 mb-2">
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
            </motion.p>
          )}
        </div>

        {/* Virtual Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold text-slate-100 transition-all border border-slate-700/50 flex flex-col items-center justify-center shadow-sm cursor-pointer"
            >
              <span>{num}</span>
            </button>
          ))}

          {/* Biometrics button */}
          <button
            onClick={handleBiometricClick}
            disabled={isScanningBiometric}
            title="Biometric Scanner"
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 transition-all border border-slate-700/50 flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Fingerprint className={`w-6 h-6 ${isScanningBiometric ? 'animate-pulse text-emerald-300' : ''}`} />
          </button>

          {/* Zero */}
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold text-slate-100 transition-all border border-slate-700/50 flex flex-col items-center justify-center shadow-sm cursor-pointer"
          >
            <span>0</span>
          </button>

          {/* Backspace */}
          <button
            onClick={handleBackspace}
            title="Backspace"
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-rose-500/20 active:scale-95 text-slate-300 hover:text-rose-400 transition-all border border-slate-700/50 flex items-center justify-center shadow-sm cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Hint */}
        <div className="w-full bg-slate-800/40 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Default PIN:</span>
          </span>
          <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
            {currentPin}
          </span>
          <button
            onClick={() => unlockWithPin(currentPin)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer"
          >
            Quick Unlock
          </button>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between w-full text-xs text-slate-400 px-1">
          <button
            onClick={() => setIsForgotOpen(true)}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Forgot PIN?</span>
          </button>

          <button
            onClick={handleClear}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </motion.div>

      {/* Forgot PIN Modal */}
      <AnimatePresence>
        {isForgotOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Reset Master PIN</h3>
                  <p className="text-xs text-slate-400">Answer security question to recover</p>
                </div>
              </div>

              {forgotSuccess ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-emerald-400 font-semibold text-sm">PIN Reset Successfully!</p>
                  <p className="text-xs text-slate-400 mt-1">Unlocking WasooliPK now...</p>
                </div>
              ) : (
                <form onSubmit={handleResetPinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Security Question:
                    </label>
                    <p className="text-xs text-slate-200 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                      {securityQuestion}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Your Answer:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. fibernet"
                      value={securityAnswerInput}
                      onChange={(e) => setSecurityAnswerInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Hint: fibernet</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Set New 4-Digit PIN:
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="e.g. 5678"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 tracking-widest font-mono"
                      required
                    />
                  </div>

                  {forgotError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {forgotError}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(false)}
                      className="flex-1 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
                    >
                      Verify & Unlock
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
