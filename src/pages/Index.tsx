
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Este é apenas um estado de carregamento enquanto o redirecionamento acontece
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">FoodieHub</h1>
        <p className="text-muted-foreground">Carregando seu sistema de gerenciamento de restaurante...</p>
      </div>
    </div>
  );
};

export default Index;
