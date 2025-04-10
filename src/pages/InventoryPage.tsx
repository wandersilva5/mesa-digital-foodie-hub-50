import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, AlertTriangle, AlertCircle, Edit, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const inventoryItems = [
  {
    id: 1,
    name: "Pão para Hambúrguer",
    category: "Pães",
    currentStock: 120,
    minStock: 50,
    unit: "unidade",
    lastRestock: "2023-05-01",
    price: 1.20
  },
  {
    id: 2,
    name: "Carne para Hambúrguer",
    category: "Carnes",
    currentStock: 80,
    minStock: 30,
    unit: "kg",
    lastRestock: "2023-05-05",
    price: 28.90
  },
  {
    id: 3,
    name: "Queijo Cheddar",
    category: "Laticínios",
    currentStock: 15,
    minStock: 20,
    unit: "kg",
    lastRestock: "2023-05-03",
    price: 32.50
  },
  {
    id: 4,
    name: "Alface",
    category: "Vegetais",
    currentStock: 25,
    minStock: 10,
    unit: "kg",
    lastRestock: "2023-05-09",
    price: 8.90
  },
  {
    id: 5,
    name: "Tomate",
    category: "Vegetais",
    currentStock: 30,
    minStock: 15,
    unit: "kg",
    lastRestock: "2023-05-09",
    price: 12.50
  },
  {
    id: 6,
    name: "Batata",
    category: "Vegetais",
    currentStock: 50,
    minStock: 30,
    unit: "kg",
    lastRestock: "2023-05-08",
    price: 5.90
  },
  {
    id: 7,
    name: "Bacon",
    category: "Carnes",
    currentStock: 8,
    minStock: 10,
    unit: "kg",
    lastRestock: "2023-05-02",
    price: 39.90
  },
  {
    id: 8,
    name: "Refrigerante Lata",
    category: "Bebidas",
    currentStock: 200,
    minStock: 100,
    unit: "unidade",
    lastRestock: "2023-05-07",
    price: 3.90
  },
  {
    id: 9,
    name: "Embalagens para Delivery",
    category: "Utensílios",
    currentStock: 150,
    minStock: 50,
    unit: "unidade",
    lastRestock: "2023-04-20",
    price: 1.90
  }
];

const InventoryPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    currentStock: "",
    minStock: "",
    unit: "",
    price: ""
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<null | typeof inventoryItems[0]>(null);
  const [restockAmount, setRestockAmount] = useState("");
  
  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const lowStockItems = filteredItems.filter(item => item.currentStock <= item.minStock);
  
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
  
  const handleRestock = () => {
    if (!selectedItem || !restockAmount || parseInt(restockAmount) <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, informe uma quantidade válida",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Sucesso",
      description: `Estoque de ${selectedItem.name} foi atualizado`,
    });
    
    setRestockAmount("");
    setIsRestockDialogOpen(false);
  };
  
  const openRestockDialog = (item: typeof inventoryItems[0]) => {
    setSelectedItem(item);
    setIsRestockDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Gerencie o estoque de produtos do restaurante</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar item..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Ex: Pão para Hambúrguer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
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
                      onChange={(e) => setNewItem({...newItem, currentStock: e.target.value})}
                      placeholder="Ex: 100"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minStock">Estoque Mínimo</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({...newItem, minStock: e.target.value})}
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
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
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
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
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
        </div>
      </div>
      
      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Alerta de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">Os seguintes itens estão com estoque abaixo do mínimo:</p>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {item.currentStock} {item.unit}(s) em estoque (mínimo: {item.minStock})
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openRestockDialog(item)}
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Repor
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="all">
        <TabsList className="w-full h-auto flex flex-wrap justify-start mb-2">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="low">Estoque Baixo</TabsTrigger>
          <TabsTrigger value="vegetables">Vegetais</TabsTrigger>
          <TabsTrigger value="meat">Carnes</TabsTrigger>
          <TabsTrigger value="drinks">Bebidas</TabsTrigger>
          <TabsTrigger value="other">Outros</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(item => (
              <InventoryCard key={item.id} item={item} onRestock={openRestockDialog} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="low" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lowStockItems.map(item => (
              <InventoryCard key={item.id} item={item} onRestock={openRestockDialog} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="vegetables" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems
              .filter(item => item.category === "Vegetais")
              .map(item => (
                <InventoryCard key={item.id} item={item} onRestock={openRestockDialog} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="meat" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems
              .filter(item => item.category === "Carnes")
              .map(item => (
                <InventoryCard key={item.id} item={item} onRestock={openRestockDialog} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="drinks" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems
              .filter(item => item.category === "Bebidas")
              .map(item => (
                <InventoryCard key={item.id} item={item} onRestock={openRestockDialog} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="other" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems
              .filter(item => !["Vegetais", "Carnes", "Bebidas"].includes(item.category))
              .map(item => (
                <InventoryCard key={item.id} item={item} onRestock={openRestockDialog} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Repor Estoque</DialogTitle>
            <DialogDescription>
              Informe a quantidade a ser adicionada ao estoque atual.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Item</Label>
                <div className="font-medium">{selectedItem.name}</div>
              </div>
              <div className="grid gap-2">
                <Label>Estoque Atual</Label>
                <div className="font-medium">{selectedItem.currentStock} {selectedItem.unit}(s)</div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="restockAmount">Quantidade a Adicionar</Label>
                <Input
                  id="restockAmount"
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder={`Ex: 10 ${selectedItem.unit}(s)`}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleRestock}>Confirmar Reposição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InventoryCard = ({ 
  item, 
  onRestock 
}: { 
  item: typeof inventoryItems[0];
  onRestock: (item: typeof inventoryItems[0]) => void;
}) => {
  const isLowStock = item.currentStock <= item.minStock;
  
  return (
    <Card className={isLowStock ? "border-l-4 border-l-orange-500" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <Badge variant="outline">{item.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Estoque Atual:</span>
            <span className={isLowStock ? "text-orange-500 font-bold" : "font-medium"}>
              {item.currentStock} {item.unit}(s)
              {isLowStock && <AlertCircle className="inline-block ml-1 h-4 w-4" />}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estoque Mínimo:</span>
            <span>{item.minStock} {item.unit}(s)</span>
          </div>
          <div className="flex justify-between">
            <span>Última Reposição:</span>
            <span>{new Date(item.lastRestock).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between">
            <span>Preço por Unidade:</span>
            <span>R$ {item.price.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => onRestock(item)} 
            className="flex-1"
            size="sm"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Repor Estoque
          </Button>
          <Button 
            variant="outline" 
            size="icon"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryPage;
