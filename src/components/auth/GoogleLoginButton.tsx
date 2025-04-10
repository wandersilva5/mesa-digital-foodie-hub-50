
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

const GoogleLoginButton = () => {
  const { loginWithGoogle, loading } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // O redirecionamento será tratado pelo sistema de auth no UserContext
      // O usuário será direcionado para a área do cliente automaticamente
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao fazer login com Google",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleGoogleLogin} 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 hover:text-black border-gray-300"
      disabled={loading}
    >
      <Mail size={20} />
      <span>Entrar com Google</span>
    </Button>
  );
};

export default GoogleLoginButton;
