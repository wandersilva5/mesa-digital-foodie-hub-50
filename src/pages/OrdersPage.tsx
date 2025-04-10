
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Search, Clock, CheckCircle, AlertTriangle, Ban, ExternalLink } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Dados fictícios de pedidos
const orders = [
  {
    id: 1,
    tableNumber: 5,
    customerName: "João Silva",
    items: [
      { name: "X-Burger Tradicional", quantity: 2, price: 18.90 },
      { name: "Batata Frita", quantity: 1, price: 12.90 },
      { name: "Refrigerante Lata", quantity: 2, price: 5.90 }
    ],
    status: "pending",
    createdAt: "2023-05-10T15:30:00",
    totalAmount: 62.50,
    deliveryAddress: null,
    isDelivery: false
  },
  {
    id: 2,
    tableNumber: 3,
    customerName: "Maria Oliveira",
    items: [
      { name: "X-Salada", quantity: 1, price: 19.90 },
      { name: "Milk Shake", quantity: 1, price: 13.90 }
    ],
    status: "preparing",
    createdAt: "2023-05-10T15:45:00",
    totalAmount: 33.80,
    deliveryAddress: null,
    isDelivery: false
  },
  {
    id: 3,
    tableNumber: null,
    customerName: "Pedro Santos",
    items: [
      { name: "X-Bacon", quantity: 2, price: 22.90 },
      { name: "Onion Rings", quantity: 1, price: 14.90 },
      { name: "Refrigerante Lata", quantity: 2, price: 5.90 }
    ],
    status: "ready",
    createdAt: "2023-05-10T16:00:00",
    totalAmount: 72.50,
    deliveryAddress: "Rua das Flores, 123, Apto 101",
    isDelivery: true
  },
  {
    id: 4,
    tableNumber: 8,
    customerName: "Ana Souza",
    items: [
      { name: "X-Salada", quantity: 1, price: 19.90 },
      { name: "Batata Frita", quantity: 1, price: 12.90 },
      { name: "Suco Natural", quantity: 1, price: 8.90 }
    ],
    status: "completed",
    createdAt: "2023-05-10T16:15:00",
    totalAmount: 41.70,
    deliveryAddress: null,
    isDelivery: false
  },
  {
    id: 5,
    tableNumber: null,
    customerName: "Carlos Mendes",
    items: [
      { name: "X-Burger Tradicional", quantity: 1, price: 18.90 },
      { name: "Refrigerante Lata", quantity: 1, price: 5.90 }
    ],
    status: "cancelled",
    createdAt: "2023-05-10T16:30:00",
    totalAmount: 24.80,
    deliveryAddress: "Avenida Central, 456",
    isDelivery: true
  }
];

const OrdersPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  
  const userRole = user?.role;
  
  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    toast({
      title: "Status atualizado",
      description: `Pedido #${orderId} foi atualizado para ${translateStatus(newStatus)}`,
    });
  };
  
  const translateStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      "pending": "Pendente",
      "preparing": "Em preparo",
      "ready": "Pronto",
      "completed": "Entregue",
      "cancelled": "Cancelado"
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status: string): string => {
    const statusColor: { [key: string]: string } = {
      "pending": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      "preparing": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      "ready": "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      "completed": "bg-primary/10 text-primary hover:bg-primary/20",
      "cancelled": "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return statusColor[status] || "";
  };
  
  const filteredOrders = orders.filter(order => {
    // Filtrar por termo de busca
    const searchMatch = 
      order.id.toString().includes(searchTerm) || 
      (order.tableNumber && order.tableNumber.toString().includes(searchTerm)) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por permissões de usuário
    if (userRole === "customer") {
      // Cliente só vê seus próprios pedidos
      return searchMatch && order.customerName === user?.name;
    } else {
      return searchMatch;
    }
  });
  
  const OrderCard = ({ order }: { order: typeof orders[0] }) => {
    return (
      <Card key={order.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                Pedido #{order.id}
                {order.isDelivery && (
                  <Badge variant="outline" className="ml-2">Delivery</Badge>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {order.tableNumber ? `Mesa ${order.tableNumber}` : "Delivery"} • {order.customerName}
              </div>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {translateStatus(order.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm">
              <div className="font-medium mb-1">Itens do pedido:</div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>R$ {order.totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            
            {order.deliveryAddress && (
              <div className="text-sm mt-2">
                <div className="font-medium mb-1">Endereço de entrega:</div>
                <p>{order.deliveryAddress}</p>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              {userRole === "kitchen" && order.status === "pending" && (
                <Button onClick={() => handleUpdateStatus(order.id, "preparing")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Iniciar Preparo
                </Button>
              )}
              
              {userRole === "kitchen" && order.status === "preparing" && (
                <Button onClick={() => handleUpdateStatus(order.id, "ready")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Pronto
                </Button>
              )}
              
              {userRole === "waiter" && order.status === "ready" && !order.isDelivery && (
                <Button onClick={() => handleUpdateStatus(order.id, "completed")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Entregar ao Cliente
                </Button>
              )}
              
              {(userRole === "admin" || userRole === "waiter") && 
               (order.status === "pending" || order.status === "preparing") && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleUpdateStatus(order.id, "cancelled")}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
              
              {userRole === "cashier" && order.status === "completed" && !order.isDelivery && (
                <Button onClick={() => window.location.href = `/checkout?order=${order.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir para Pagamento
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie todos os pedidos do restaurante</p>
        </div>
        
        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pedido..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full h-auto flex flex-wrap justify-start mb-2">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="preparing">Em Preparo</TabsTrigger>
          <TabsTrigger value="ready">Prontos</TabsTrigger>
          <TabsTrigger value="completed">Entregues</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Nenhum pedido encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Não há pedidos para exibir com os filtros atuais.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          {filteredOrders.filter(o => o.status === "pending").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="preparing" className="mt-4">
          {filteredOrders.filter(o => o.status === "preparing").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="ready" className="mt-4">
          {filteredOrders.filter(o => o.status === "ready").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {filteredOrders.filter(o => o.status === "completed").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="delivery" className="mt-4">
          {filteredOrders.filter(o => o.isDelivery).map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
