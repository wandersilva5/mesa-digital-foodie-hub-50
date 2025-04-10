
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { Separator } from "@/components/ui/separator";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { Loader2, Coffee, User, Lock } from "lucide-react";

const LoginPage = () => {
  const { login, isAuthenticated, user, loading } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redireciona o usuário com base no perfil após autenticação
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redireciona com base no perfil
      switch (user.role) {
        case "admin":
          navigate("/");
          break;
        case "waiter":
          navigate("/tables");
          break;
        case "cashier":
          navigate("/checkout");
          break;
        case "kitchen":
          navigate("/orders");
          break;
        case "customer":
          navigate("/menu");
          break;
        default:
          navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
      // Redirecionamento é feito no useEffect acima
    } catch (error) {
      // Erro tratado no contexto de usuário
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Se o usuário já estiver autenticado, não exibe a tela de login
  if (isAuthenticated && !loading) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100">
      <div className="w-full max-w-4xl px-4 flex flex-col md:flex-row gap-8 items-center">
        {/* Lado esquerdo - Ilustração e mensagem de boas-vindas */}
        <div className="flex-1 hidden md:flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-orange-600 mb-2">FoodieHub</h1>
            <p className="text-gray-600 max-w-md">
              Gerencie seu restaurante com facilidade e proporcione uma experiência incrível para seus clientes.
            </p>
          </div>
          <div className="flex justify-center">
            <Coffee size={180} className="text-orange-500" strokeWidth={1.5} />
          </div>
        </div>
        
        {/* Lado direito - Formulário de login */}
        <div className="w-full md:w-1/2">
          <Card className="w-full border-orange-200 shadow-lg bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-orange-600">
                <span className="md:hidden">FoodieHub</span>
                <span className="hidden md:inline">Bem-vindo de volta!</span>
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Digite suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700">Senha</Label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 transition-colors"
                  disabled={loading || isSubmitting}
                >
                  {(loading || isSubmitting) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
                
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-muted-foreground text-sm">
                      ou
                    </span>
                  </div>
                </div>
                
                <GoogleLoginButton />
              </CardContent>
            </form>
            <CardFooter className="flex justify-center pt-0">
              <p className="text-xs text-gray-500 text-center">
                Ao entrar, você concorda com nossos termos de serviço e política de privacidade.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
