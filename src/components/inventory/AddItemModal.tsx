import { useState } from 'react';
import { InventoryItem } from '../../services/inventoryService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";


interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
}
const AddItemModal = ({ onClose, onAdd }: AddItemModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'outros',
    currentStock: 0,
    minimumStock: 0,
    pricePerUnit: 0,
    unit: 'unidade(s)',
  });


  const { toast } = useToast();
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    currentStock: "",
    minStock: "",
    unit: "",
    price: ""
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.currentStock || !newItem.minStock || !newItem.unit || !newItem.price) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `${newItem.name} foi adicionado ao estoque`,
    });

    setNewItem({
      name: "",
      category: "",
      currentStock: "",
      minStock: "",
      unit: "",
      price: ""
    });

    setIsAddDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'currentStock' || name === 'minimumStock' || name === 'pricePerUnit'
        ? parseFloat(value)
        : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo item para adicionar ao estoque.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="itemName">Nome</Label>
            <Input
              id="itemName"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Ex: Pão para Hambúrguer"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              placeholder="Ex: Pães"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currentStock">Estoque Atual</Label>
              <Input
                id="currentStock"
                type="number"
                value={newItem.currentStock}
                onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                placeholder="Ex: 100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                placeholder="Ex: 50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="Ex: kg, unidade, litro"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Preço por Unidade (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Ex: 12.90"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddItem}>Adicionar Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;