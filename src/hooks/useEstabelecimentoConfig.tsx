
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useToast } from "@/components/ui/use-toast";

export interface EstabelecimentoConfig {
  nome: string;
  slogan: string;
  logoUrl: string;
  cores: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface EstabelecimentoConfigContextType {
  config: EstabelecimentoConfig;
  updateConfig: (newConfig: Partial<EstabelecimentoConfig>) => void;
  saveConfig: () => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  loading: boolean;
}

const defaultConfig: EstabelecimentoConfig = {
  nome: "Sabor Express",
  slogan: "O melhor sabor da cidade",
  logoUrl: "",
  cores: {
    primary: "#10b981",
    secondary: "#3b82f6",
    accent: "#8b5cf6",
  }
};

const EstabelecimentoConfigContext = createContext<EstabelecimentoConfigContextType | undefined>(undefined);

export const EstabelecimentoConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<EstabelecimentoConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const { saveEstabelecimentoConfig, getEstabelecimentoConfig, uploadLogo: uploadLogoToFirebase, error } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    // Load config from Firebase on mount
    const loadConfig = async () => {
      try {
        const data = await getEstabelecimentoConfig();
        setConfig(data);
      } catch (err) {
        console.error("Failed to load config:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações do estabelecimento",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const updateConfig = (newConfig: Partial<EstabelecimentoConfig>) => {
    setConfig(currentConfig => ({
      ...currentConfig,
      ...newConfig,
    }));
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await saveEstabelecimentoConfig(config);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const url = await uploadLogoToFirebase(file);
      if (url) {
        updateConfig({ logoUrl: url });
        toast({
          title: "Sucesso",
          description: "Logo enviado com sucesso",
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o logo",
        variant: "destructive",
      });
    }
  };

  return (
    <EstabelecimentoConfigContext.Provider
      value={{
        config,
        updateConfig,
        saveConfig,
        uploadLogo,
        loading,
      }}
    >
      {children}
    </EstabelecimentoConfigContext.Provider>
  );
};

export const useEstabelecimentoConfig = () => {
  const context = useContext(EstabelecimentoConfigContext);
  if (context === undefined) {
    throw new Error("useEstabelecimentoConfig must be used within an EstabelecimentoConfigProvider");
  }
  return context;
};
