import React, { createContext, useState, useContext } from 'react';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [sessionEvents, setSessionEvents] = useState([]);

  const addAnnotation = (ann) => {
    setAnnotations((prev) => {
      const idx = prev.findIndex((a) => a.annotationId === ann.annotationId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = ann;
        return updated;
      }
      return [...prev, ann];
    });
  };

  const addSessionEvent = (evt) => {
    setSessionEvents((prev) => [...prev, evt]);
  };

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        setActiveSession,
        annotations,
        setAnnotations,
        addAnnotation,
        sessionEvents,
        addSessionEvent
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
