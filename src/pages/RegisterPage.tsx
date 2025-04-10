
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/contexts/UserContext";
import { Loader2, Coffee, User, Lock, Mail, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const RegisterPage = () => {
  const { register, loading } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await register(email, password, name, role);
      toast({
        title: "Sucesso",
        description: "Registro realizado com sucesso! Faça o login para continuar.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Erro ao registrar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível concluir o registro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-orange-100">
      <div className="w-full max-w-4xl px-4 flex flex-col md:flex-row gap-8 items-center">
        {/* Lado esquerdo - Ilustração e mensagem de boas-vindas */}
        <div className="flex-1 hidden md:flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-orange-600 mb-2">FoodieHub</h1>
            <p className="text-gray-600 max-w-md">
              Junte-se a nós e comece a aproveitar todas as funcionalidades da nossa plataforma.
            </p>
          </div>
          <div className="flex justify-center">
            <Coffee size={180} className="text-orange-500" strokeWidth={1.5} />
          </div>
        </div>
        
        {/* Lado direito - Formulário de registro */}
        <div className="w-full md:w-1/2">
          <Card className="w-full border-orange-200 shadow-lg bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-orange-600 flex items-center justify-center gap-2">
                <UserPlus className="h-6 w-6" />
                <span>Criar Conta</span>
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Preencha os dados abaixo para se registrar
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Nome completo</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Senha</Label>
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
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar senha</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
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
                      Registrando...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
                
                <div className="text-center pt-4">
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={() => navigate("/login")}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    Já tem uma conta? Faça login
                  </Button>
                </div>
              </CardContent>
            </form>
            <CardFooter className="flex justify-center pt-0">
              <p className="text-xs text-gray-500 text-center">
                Ao se registrar, você concorda com nossos termos de serviço e política de privacidade.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
