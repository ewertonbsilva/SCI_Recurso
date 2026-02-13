import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FullscreenContextType {
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export const useFullscreen = () => {
  const context = useContext(FullscreenContext);
  if (context === undefined) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
};

interface FullscreenProviderProps {
  children: ReactNode;
}

export const FullscreenProvider: React.FC<FullscreenProviderProps> = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      const isCurrentlyFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      console.log('Fullscreen change detectado:', isCurrentlyFullscreen);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Adicionar múltiplos eventos para compatibilidade cross-browser
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    // Verificar estado inicial
    handleFullscreenChange();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, []);

  return (
    <FullscreenContext.Provider value={{ isFullscreen, setIsFullscreen }}>
      {children}
    </FullscreenContext.Provider>
  );
};
