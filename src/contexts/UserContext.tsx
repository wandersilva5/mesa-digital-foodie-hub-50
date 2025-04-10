
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "admin" | "customer" | "waiter" | "cashier" | "kitchen" | null;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  isGoogleUser?: boolean;
}

interface UserContextType {
  user: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  addUser: (user: User) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Dados iniciais para a simulação
const initialUsers: User[] = [
  {
    id: "admin1",
    name: "Administrador",
    role: "admin",
    email: "admin@foodiehub.com",
  },
  {
    id: "waiter1",
    name: "Carlos Garçom",
    role: "waiter",
    email: "carlos@foodiehub.com",
  },
  {
    id: "kitchen1",
    name: "Ana Cozinheira",
    role: "kitchen",
    email: "ana@foodiehub.com",
  },
  {
    id: "cashier1",
    name: "Paula Caixa",
    role: "cashier",
    email: "paula@foodiehub.com",
  }
];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Recuperar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("foodiehub_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("foodiehub_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("foodiehub_user");
  };
  
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const addUser = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id ? { ...user, ...userData } : user
      )
    );
    
    // Se o usuário sendo atualizado for o usuário atual, atualize também o estado do usuário
    if (user && user.id === id) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("foodiehub_user", JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    
    // Se o usuário sendo excluído for o usuário atual, faça logout
    if (user && user.id === id) {
      logout();
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        users,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
