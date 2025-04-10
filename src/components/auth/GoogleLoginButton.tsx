
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react"; // Substituímos Google por Mail

const GoogleLoginButton = () => {
  const { login } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Simulação de login com Google
    // Em um aplicativo real, isso seria integrado com Firebase Auth ou outra solução
    const googleUser = {
      id: "google_" + Math.random().toString(36).substring(2, 9),
      name: "Usuário Google", // Em um app real, isso viria da API do Google
      email: "usuario@gmail.com", // Em um app real, isso viria da API do Google
      role: "customer" as const,
      isGoogleUser: true
    };
    
    login(googleUser);
    
    toast({
      title: "Sucesso",
      description: "Logado com Google como cliente",
    });
    
    navigate("/");
  };

  return (
    <Button 
      onClick={handleGoogleLogin} 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 hover:text-black border-gray-300"
    >
      <Mail size={20} />
      <span>Entrar com Google</span>
    </Button>
  );
};

export default GoogleLoginButton;
