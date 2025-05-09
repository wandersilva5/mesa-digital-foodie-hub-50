import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Search, Clock, CheckCircle, AlertTriangle, Ban, ExternalLink } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getOrdersByStatus, getOrderById, updateOrderStatus } from "@/services/orderService";
import { collection, query, where, onSnapshot, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  observations?: string;
  name?: string;
}

interface Order {
  id: string;
  tableId?: string;
  tableNumber?: number;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "canceled";
  paymentMethod?: string;
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  paymentId?: string;
  delivery?: boolean;
  address?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

const OrdersPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { changeOrderStatus, translateStatus } = useOrderManagement();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const userRole = user?.role;
  
  useEffect(() => {
    setLoading(true);
    
    let statusesToFetch = ["pending", "preparing", "ready", "delivered", "canceled"];
    
    if (userRole === "kitchen") {
      statusesToFetch = ["pending", "preparing", "ready"];
    }
    
    if (userRole === "waiter") {
      statusesToFetch = ["pending", "preparing", "ready", "delivered"];
    }
    
    try {
      const ordersRef = collection(db, "orders");
      // Usar uma query mais simples para garantir que todos os pedidos sejam buscados
      const q = query(ordersRef);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const fetchedOrders: Order[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Validar e converter os dados do pedido
            const order: Order = {
              id: doc.id,
              items: Array.isArray(data.items) ? data.items : [],
              total: Number(data.total) || 0,
              status: data.status || "pending",
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
              updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : Timestamp.now(),
              completedAt: data.completedAt instanceof Timestamp ? data.completedAt : null,
              tableNumber: data.tableNumber,
              customerName: data.customerName || "Cliente",
              delivery: Boolean(data.delivery),
              address: data.address || "",
              tableId: data.tableId || null,
              paymentMethod: data.paymentMethod,
              paymentStatus: data.paymentStatus,
            };
            
            // Incluir o pedido se estiver nos status desejados
            if (statusesToFetch.includes(order.status)) {
              fetchedOrders.push(order);
            }
          });
          
          // Ordenar pedidos por data de criação (mais recentes primeiro)
          const sortedOrders = fetchedOrders.sort((a, b) => 
            b.createdAt.toMillis() - a.createdAt.toMillis()
          );
          
          setOrders(sortedOrders);
          setLoading(false);
        } catch (error) {
          console.error("Error processing orders:", error);
          toast({
            title: "Erro",
            description: "Erro ao processar dados dos pedidos",
            variant: "destructive",
          });
          setLoading(false);
        }
      }, (error) => {
        console.error("Error fetching orders:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar pedidos: " + error.message,
          variant: "destructive",
        });
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up orders listener:", error);
      setLoading(false);
    }
  }, [user, userRole]);
  
  const getStatusColor = (status: string): string => {
    const statusColor: { [key: string]: string } = {
      "pending": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      "preparing": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      "ready": "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      "delivered": "bg-primary/10 text-primary hover:bg-primary/20",
      "canceled": "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return statusColor[status] || "";
  };
  
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!user) return;
    
    const success = await changeOrderStatus(orderId, newStatus);
    if (success) {
      toast({
        title: "Status atualizado",
        description: `Pedido #${orderId} foi atualizado para ${translateStatus(newStatus)}`,
      });
    }
  };
  
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp || !(timestamp instanceof Timestamp)) {
      return "Data indisponível";
    }
    try {
      return format(timestamp.toDate(), "dd/MM/yyyy HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Data inválida";
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const searchMatch = 
      order.id.toString().includes(searchTerm) || 
      (order.tableNumber && order.tableNumber.toString().includes(searchTerm)) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtrar por data
    const orderDate = order.createdAt.toDate();
    const isWithinSelectedDay = isWithinInterval(orderDate, {
      start: startOfDay(selectedDate),
      end: endOfDay(selectedDate)
    });

    return searchMatch && isWithinSelectedDay;
  });
  
  const OrderCard = ({ order }: { order: Order }) => {
    return (
      <Card key={order.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                Pedido #{order.id.substring(0, 6)}
                {order.delivery && (
                  <Badge variant="outline" className="ml-2">Delivery</Badge>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {order.tableNumber ? `Mesa ${order.tableNumber}` : "Delivery"} • {order.customerName || "Cliente"}
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
                  <span>{item.quantity}x {item.name || `Item #${item.productId.substring(0, 6)}`}</span>
                  <span>R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            
            {order.address && (
              <div className="text-sm mt-2">
                <div className="font-medium mb-1">Endereço de entrega:</div>
                <p>{order.address}</p>
              </div>
            )}
            
            <div className="text-sm mt-2">
              <div className="font-medium mb-1">Data do pedido:</div>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            
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
              
              {userRole === "waiter" && order.status === "ready" && !order.delivery && (
                <Button onClick={() => handleUpdateStatus(order.id, "delivered")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Entregar ao Cliente
                </Button>
              )}
              
              {(userRole === "admin" || userRole === "waiter") && 
               (order.status === "pending" || order.status === "preparing") && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleUpdateStatus(order.id, "canceled")}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
              
              {userRole === "cashier" && order.status === "delivered" && !order.delivery && (
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
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date || new Date())}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

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
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="w-full h-auto flex flex-wrap justify-start mb-2">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="preparing">Em Preparo</TabsTrigger>
          <TabsTrigger value="ready">Prontos</TabsTrigger>
          <TabsTrigger value="delivered">Entregues</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
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
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.filter(o => o.status === "pending").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="preparing" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.filter(o => o.status === "preparing").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="ready" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.filter(o => o.status === "ready").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="delivered" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.filter(o => o.status === "delivered").map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
        
        <TabsContent value="delivery" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.filter(o => o.delivery).map(order => 
            <OrderCard key={order.id} order={order} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersPage;
