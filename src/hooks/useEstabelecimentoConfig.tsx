
import { useState, useEffect, createContext, useContext } from "react";

// Interface para as configurações do estabelecimento
export interface EstabelecimentoConfig {
  nome: string;
  slogan: string;
  logoUrl: string;
  corPrimaria: string;
  corSecundaria: string;
  corAcento: string;
  endereco?: string;
  telefone?: string;
  horarioFuncionamento?: string;
  exibirTaxaServico?: boolean;
  valorTaxaServico?: string;
  permitirReservas?: boolean;
  tempoEstimadoEntrega?: string;
  raioEntrega?: string;
}

// Valores padrão
const defaultConfig: EstabelecimentoConfig = {
  nome: "Sabor Express",
  slogan: "O melhor sabor da cidade!",
  logoUrl: "",
  corPrimaria: "#FF9800", // Laranja
  corSecundaria: "#4CAF50", // Verde
  corAcento: "#F44336", // Vermelho
  endereco: "Av. Principal, 123 - Centro",
  telefone: "(11) 98765-4321",
  horarioFuncionamento: "Seg-Dom 10h às 22h",
  exibirTaxaServico: true,
  valorTaxaServico: "10",
  permitirReservas: true,
  tempoEstimadoEntrega: "30-45",
  raioEntrega: "5"
};

// Contexto para compartilhar as configurações
const EstabelecimentoConfigContext = createContext<{
  config: EstabelecimentoConfig;
  updateConfig: (newConfig: Partial<EstabelecimentoConfig>) => void;
}>({
  config: defaultConfig,
  updateConfig: () => {}
});

// Provider para o contexto
export const EstabelecimentoConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<EstabelecimentoConfig>(defaultConfig);
  
  // Carrega configurações do localStorage ao iniciar
  useEffect(() => {
    const savedConfig = localStorage.getItem("estabelecimentoConfig");
    if (savedConfig) {
      try {
        setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) });
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
    
    // Aplicar cores ao CSS
    applyColorsToCssVariables(config);
  }, []);
  
  // Atualiza as configurações
  const updateConfig = (newConfig: Partial<EstabelecimentoConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Salva no localStorage
    localStorage.setItem("estabelecimentoConfig", JSON.stringify(updatedConfig));
    
    // Aplica as cores ao CSS
    applyColorsToCssVariables(updatedConfig);
  };
  
  // Aplica as cores às variáveis CSS
  const applyColorsToCssVariables = (configToApply: EstabelecimentoConfig) => {
    const root = document.documentElement;
    
    // Converte as cores hex para HSL e aplica às variáveis CSS
    if (configToApply.corPrimaria) {
      root.style.setProperty('--primary', hexToHSL(configToApply.corPrimaria));
      root.style.setProperty('--sidebar-primary', hexToHSL(configToApply.corPrimaria));
      root.style.setProperty('--ring', hexToHSL(configToApply.corPrimaria));
      root.style.setProperty('--sidebar-ring', hexToHSL(configToApply.corPrimaria));
    }
    
    if (configToApply.corSecundaria) {
      root.style.setProperty('--secondary', hexToHSL(configToApply.corSecundaria));
    }
    
    if (configToApply.corAcento) {
      root.style.setProperty('--accent', hexToHSL(configToApply.corAcento));
    }
  };
  
  return (
    <EstabelecimentoConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </EstabelecimentoConfigContext.Provider>
  );
};

// Hook para usar as configurações
export const useEstabelecimentoConfig = () => {
  const context = useContext(EstabelecimentoConfigContext);
  if (!context) {
    throw new Error("useEstabelecimentoConfig deve ser usado dentro de EstabelecimentoConfigProvider");
  }
  return context;
};

// Função para converter hex para HSL
function hexToHSL(hex: string): string {
  // Remove o # se presente
  hex = hex.replace(/^#/, '');
  
  // Converte hex para RGB
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Encontrar maior e menor valores
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  
  // Calcula lightness
  let l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    // Calcula saturation
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    
    // Calcula hue
    if (max === r) {
      h = (g - b) / (max - min) + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / (max - min) + 2;
    } else {
      h = (r - g) / (max - min) + 4;
    }
    
    h = h * 60;
  }
  
  // Converte para string no formato "H S% L%"
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
