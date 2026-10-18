import React, { createContext, useState } from 'react';
import { initialUsers } from '../data/users';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // This state keeps the signed-in user available across screens and clears it on logout.
  const [user, setUser] = useState(null);
  // This state preserves locally registered accounts when the Login screen unmounts.
  const [users, setUsers] = useState(initialUsers);

  const login = (nextUser) => {
    const { password, ...safeUser } = nextUser;
    setUser(safeUser);
  };

  const logout = () => setUser(null);
  const registerUser = (newUser) => setUsers((currentUsers) => [...currentUsers, newUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, users, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
}
