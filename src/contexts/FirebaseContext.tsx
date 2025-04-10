import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface EstabelecimentoConfig {
  nome: string;
  slogan: string;
  logoUrl: string;
  cores: {
    primary: string;
    secondary: string;
    accent: string;
  };
  corPrimaria: string;
  corSecundaria: string;
  corAcento: string;
  endereco: string;
  telefone: string;
  horarioFuncionamento: string;
  exibirTaxaServico: boolean;
  valorTaxaServico: string;
  permitirReservas: boolean;
  tempoEstimadoEntrega: string;
  raioEntrega: string;
}

interface FirebaseContextType {
  saveEstabelecimentoConfig: (data: EstabelecimentoConfig) => Promise<void>;
  getEstabelecimentoConfig: () => Promise<EstabelecimentoConfig>;
  uploadLogo: (file: File) => Promise<string>;
  loading: boolean;
  error: string | null;
}

const defaultConfig: EstabelecimentoConfig = {
  nome: "Sabor Express",
  slogan: "O melhor sabor da cidade",
  logoUrl: "",
  cores: {
    primary: "#10b981",
    secondary: "#3b82f6",
    accent: "#8b5cf6",
  },
  corPrimaria: "#FF9800",
  corSecundaria: "#4CAF50",
  corAcento: "#F44336",
  endereco: "",
  telefone: "",
  horarioFuncionamento: "",
  exibirTaxaServico: true,
  valorTaxaServico: "10",
  permitirReservas: true,
  tempoEstimadoEntrega: "30-45",
  raioEntrega: "5"
};

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveEstabelecimentoConfig = async (data: EstabelecimentoConfig) => {
    try {
      setLoading(true);
      setError(null);
      await setDoc(doc(db, "configuracao", "estabelecimento"), data);
    } catch (err) {
      setError((err as Error).message);
      console.error("Error saving config:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEstabelecimentoConfig = async (): Promise<EstabelecimentoConfig> => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, "configuracao", "estabelecimento");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as EstabelecimentoConfig;
      } else {
        await setDoc(docRef, defaultConfig);
        return defaultConfig;
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Error getting config:", err);
      return defaultConfig;
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      
      const storageRef = ref(storage, `logos/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      setError((err as Error).message);
      console.error("Error uploading logo:", err);
      return "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirebaseContext.Provider 
      value={{ 
        saveEstabelecimentoConfig, 
        getEstabelecimentoConfig, 
        uploadLogo,
        loading,
        error
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};
