import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { InventoryItem, getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/services/inventoryService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "0",
    unit: "",
    minQuantity: "0",
    category: "",
    cost: "0",
    supplier: ""
  });
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      const data = await getInventoryItems();
      console.log("Fetched inventory data:", data); // Debug log
      setItems(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o inventário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Simplificar a renderização inicial para debug
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">Total de itens: {items.length}</p>
        </div>
        
        <Button onClick={() => {
          setEditingItem(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mínimo:</span>
                  <span>{item.minQuantity} {item.unit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Dialog component here */}
    </div>
  );
};

export default InventoryPage;