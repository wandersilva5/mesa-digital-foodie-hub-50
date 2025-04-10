
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Heart, ShoppingCart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Dados fictícios dos produtos do menu
const menuItems = [
  {
    id: 1,
    name: "X-Burger Tradicional",
    description: "Hambúrguer de carne bovina, queijo, alface, tomate e maionese especial",
    price: 18.90,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "hamburgueres",
    popular: true
  },
  {
    id: 2,
    name: "X-Bacon",
    description: "Hambúrguer de carne bovina, queijo, bacon crocante, alface, tomate e maionese especial",
    price: 22.90,
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "hamburgueres",
    popular: true
  },
  {
    id: 3,
    name: "X-Salada",
    description: "Hambúrguer de carne bovina, queijo, alface, tomate, cebola, picles e maionese verde",
    price: 19.90,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "hamburgueres",
    popular: false
  },
  {
    id: 4,
    name: "Batata Frita",
    description: "Porção de batatas fritas crocantes com sal",
    price: 12.90,
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "acompanhamentos",
    popular: true
  },
  {
    id: 5,
    name: "Onion Rings",
    description: "Anéis de cebola empanados e fritos",
    price: 14.90,
    image: "https://images.unsplash.com/photo-1639024471684-284ecd526156?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "acompanhamentos",
    popular: false
  },
  {
    id: 6,
    name: "Refrigerante Lata",
    description: "Coca-cola, Guaraná Antarctica, Sprite ou Fanta (350ml)",
    price: 5.90,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "bebidas",
    popular: true
  },
  {
    id: 7,
    name: "Suco Natural",
    description: "Laranja, limão, maracujá ou abacaxi (400ml)",
    price: 8.90,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "bebidas",
    popular: false
  },
  {
    id: 8,
    name: "Milk Shake",
    description: "Chocolate, morango ou baunilha (400ml)",
    price: 13.90,
    image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "bebidas",
    popular: true
  },
  {
    id: 9,
    name: "Sobremesa do Dia",
    description: "Pudim, mousse de chocolate ou sorvete",
    price: 9.90,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=350&q=80",
    category: "sobremesas",
    popular: false
  }
];

const MenuPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<Array<{item: typeof menuItems[0], quantity: number}>>([]);
  
  const isAdmin = user?.role === "admin";
  
  const handleAddToCart = (item: typeof menuItems[0]) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.item.id === item.id);
    
    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    
    toast({
      title: "Item adicionado",
      description: `${item.name} foi adicionado ao carrinho`,
    });
  };
  
  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const categories = [
    { id: "popular", name: "Populares" },
    { id: "hamburgueres", name: "Hambúrgueres" },
    { id: "acompanhamentos", name: "Acompanhamentos" },
    { id: "bebidas", name: "Bebidas" },
    { id: "sobremesas", name: "Sobremesas" }
  ];
  
  const renderMenuItems = (categoryId: string) => {
    const itemsToShow = categoryId === "popular" 
      ? filteredItems.filter(item => item.popular)
      : filteredItems.filter(item => item.category === categoryId);
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {itemsToShow.length > 0 ? (
          itemsToShow.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <span className="font-bold text-primary">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  onClick={() => handleAddToCart(item)} 
                  className="w-full"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhum item encontrado para esta categoria.</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cardápio</h1>
          <p className="text-muted-foreground">Conheça nossos produtos deliciosos!</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isAdmin && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        {cart.length > 0 && (
          <div className="fixed bottom-4 right-4 z-10">
            <Button className="shadow-lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span>{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
              <span className="ml-2">
                R$ {cart.reduce((acc, item) => acc + (item.item.price * item.quantity), 0).toFixed(2).replace('.', ',')}
              </span>
            </Button>
          </div>
        )}
        
        <Tabs defaultValue="popular">
          <TabsList className="w-full h-auto flex flex-wrap justify-start mb-2">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              {renderMenuItems(category.id)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default MenuPage;
