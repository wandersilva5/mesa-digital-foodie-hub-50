
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateOrderStatus } from "@/services/orderService";
import { useUser } from "@/contexts/UserContext";

interface UseOrderManagementProps {
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

export const useOrderManagement = ({ onStatusUpdate }: UseOrderManagementProps = {}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  
  const changeOrderStatus = async (orderId: string, newStatus: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }
    
    setLoading(true);
    try {
      const result = await updateOrderStatus(
        orderId, 
        newStatus as "pending" | "preparing" | "ready" | "delivered" | "canceled",
        user.id // Changed from user.uid to user.id
      );
      
      if (result) {
        toast({
          title: "Status atualizado",
          description: `Pedido #${orderId.substring(0, 6)} foi atualizado para ${translateStatus(newStatus)}`,
        });
        
        // Call the callback if provided
        if (onStatusUpdate) {
          onStatusUpdate(orderId, newStatus);
        }
        
        return true;
      } else {
        throw new Error("Falha ao atualizar status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const translateStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      "pending": "Pendente",
      "preparing": "Em preparo",
      "ready": "Pronto",
      "delivered": "Entregue",
      "canceled": "Cancelado"
    };
    return statusMap[status] || status;
  };
  
  return {
    loading,
    changeOrderStatus,
    translateStatus
  };
};

export default useOrderManagement;
