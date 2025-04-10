
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  UserCredential
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

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
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Dados iniciais para a simulação (serão migrados para o Firestore)
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Inicializar usuários de exemplo no Firestore, se não existirem
  const initializeUsers = async () => {
    try {
      const usersQuery = await getDocs(collection(db, "users"));
      if (usersQuery.empty) {
        // Adicionar usuários iniciais ao Firestore
        for (const initialUser of initialUsers) {
          await setDoc(doc(db, "users", initialUser.id), initialUser);
        }
        setUsers(initialUsers);
      } else {
        // Carregar usuários do Firestore
        const loadedUsers: User[] = [];
        usersQuery.forEach((doc) => {
          loadedUsers.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(loadedUsers);
      }
    } catch (err) {
      console.error("Erro ao inicializar usuários:", err);
      setError((err as Error).message);
    }
  };

  // Escutar mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          setFirebaseUser(authUser);
          
          // Verificar se o usuário existe no Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.uid));
          
          if (userDoc.exists()) {
            // Usuário existente
            const userData = userDoc.data() as User;
            setUser({ ...userData, id: authUser.uid });
          } else {
            // Novo usuário (provavelmente do Google)
            const newUser: User = {
              id: authUser.uid,
              name: authUser.displayName || 'Usuário',
              email: authUser.email || undefined,
              role: 'customer', // Padrão para novos usuários
              isGoogleUser: authUser.providerData[0]?.providerId === 'google.com'
            };
            
            await setDoc(doc(db, "users", authUser.uid), newUser);
            setUser(newUser);
            
            // Adicionar à lista de usuários
            setUsers(prev => [...prev, newUser]);
          }
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Erro ao processar autenticação:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    });
    
    // Carregar todos os usuários após autenticação
    initializeUsers();
    
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError((err as Error).message);
      toast({
        title: "Erro",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: "Sucesso",
        description: "Login com Google realizado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao fazer login com Google:", err);
      setError((err as Error).message);
      toast({
        title: "Erro",
        description: "Falha ao conectar com Google",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        id: result.user.uid,
        name,
        email,
        role,
      };
      
      await setDoc(doc(db, "users", result.user.uid), newUser);
      
      toast({
        title: "Sucesso",
        description: "Usuário registrado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      setError((err as Error).message);
      toast({
        title: "Erro",
        description: "Falha ao registrar usuário",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast({
        title: "Sucesso",
        description: "Logout realizado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      setError((err as Error).message);
      toast({
        title: "Erro",
        description: "Falha ao fazer logout",
        variant: "destructive",
      });
    }
  };
  
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const addUser = async (userData: Omit<User, "id">) => {
    setLoading(true);
    setError(null);
    try {
      // Gerar ID único para o usuário
      const newUserId = `user_${Date.now()}`;
      const newUser = { id: newUserId, ...userData };
      
      await setDoc(doc(db, "users", newUserId), newUser);
      setUsers(prev => [...prev, newUser]);
      
      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao adicionar usuário:", err);
      setError((err as Error).message);
      toast({
        title: "Erro",
        description: "Falha ao adicionar usuário",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const userRef = doc(db, "users", id);
      await setDoc(userRef, userData, { merge: true });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, ...userData } : user
        )
      );
      
      // Se o usuário sendo atualizado for o usuário atual, atualize também o estado do usuário
      if (user && user.id === id) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
      }
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      setError((err as Error).message);
      toast({
        title: "Erro",
        description: "Falha ao atualizar usuário",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await setDoc(doc(db, "users", id), { deleted: true }, { merge: true });
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      
      // Se o usuário sendo excluído for o usuário atual, faça logout
      if (user && user.id === id) {
        await logout();
      }
      
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      setError((err as Error).message);
      toast({
        title: "Erro",
        description: "Falha ao excluir usuário",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        users,
        firebaseUser,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user,
        hasRole,
        addUser,
        updateUser,
        deleteUser,
        loading,
        error,
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
