import React, { createContext, useCallback, useContext, useState } from 'react';
import LoginRequiredModal from './LoginRequiredModal';

type OpenOptions = { onClose?: () => void } | undefined;

const AuthModalContext = createContext<{ open: (opts?: OpenOptions) => void; close: () => void }>({
  open: () => {},
  close: () => {},
});

export const AuthModalProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [openState, setOpenState] = useState(false);
  const [onCloseCb, setOnCloseCb] = useState<(() => void) | undefined>(undefined);

  const open = useCallback((opts?: OpenOptions) => {
    setOnCloseCb(() => opts?.onClose);
    setOpenState(true);
  }, []);

  const close = useCallback(() => {
    setOpenState(false);
    onCloseCb?.();
    setOnCloseCb(undefined);
  }, [onCloseCb]);

  return (
    <AuthModalContext.Provider value={{ open, close }}>
      {children}
      <LoginRequiredModal isOpen={openState} onClose={close} />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
