import React, { createContext, useContext, useState } from 'react';

// Define the shape of our User data
interface User {
  id: string;
  email: string;
  role: string;
}

// Define the shape of our Context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Create the Context with a default value (null but casted)
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// 📚 INTERVIEW EXPLANATION: React Context API
// Context provides a way to pass data through the component tree without having to
// pass props down manually at every level ("prop drilling").
// Here, we store the logged-in user and their JWT token so ANY component (like Navbar or Dashboard)
// can easily check if the user is logged in, or get their role.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously check localStorage so we don't get kicked out on refresh!
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    // Save to localStorage so they stay logged in if they refresh the page
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to make it easy to consume the context
export const useAuth = () => useContext(AuthContext);
