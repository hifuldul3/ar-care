import React, { createContext, useState, useEffect } from 'react';
import { loginUser, getCurrentUser } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('arcare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('arcare_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setToken(data.access_token);
      localStorage.setItem('arcare_token', data.access_token);

      const userObj = {
        id: data.user_id,
        email: data.email,
        name: data.name,
        role: data.role
      };
      setUser(userObj);
      localStorage.setItem('arcare_user', JSON.stringify(userObj));
      setLoading(false);
      return userObj;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('arcare_user');
    localStorage.removeItem('arcare_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
