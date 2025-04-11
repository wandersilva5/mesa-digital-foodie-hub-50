
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Eye, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
  observations?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "canceled";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tableId?: string;
  tableNumber?: number;
  customerName?: string;
  paymentMethod?: string;
  delivery?: boolean;
  address?: string;
}

const OrderStatusColor = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  preparing: "bg-blue-100 text-blue-800 border-blue-300",
  ready: "bg-green-100 text-green-800 border-green-300",
  delivered: "bg-purple-100 text-purple-800 border-purple-300",
  canceled: "bg-red-100 text-red-800 border-red-300",
};

const OrderStatusTranslations = {
  pending: "Pendente",
  preparing: "Em preparo",
  ready: "Pronto",
  delivered: "Entregue",
  canceled: "Cancelado",
};

const PaymentMethodTranslations = {
  cash: "Dinheiro",
  credit: "Cartão de Crédito",
  debit: "Cartão de Débito",
  pix: "PIX",
  app: "Aplicativo",
};

const OrdersCollection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar produtos primeiro para ter as informações completas
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productsMap: Record<string, Product> = {};
      
      productsSnapshot.forEach((doc) => {
        productsMap[doc.id] = { id: doc.id, ...doc.data() } as Product;
      });
      
      setProducts(productsMap);
      
      // Depois buscar os pedidos
      const ordersCollection = collection(db, "orders");
      const ordersQuery = query(ordersCollection, orderBy("createdAt", "desc"));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersList: Order[] = [];
      
      ordersSnapshot.forEach((doc) => {
        const orderData = doc.data() as Order;
        
        // Enriquecer itens do pedido com informações do produto
        const enrichedItems = orderData.items.map(item => ({
          ...item,
          product: productsMap[item.productId]
        }));
        
        ordersList.push({ 
          id: doc.id, 
          ...orderData, 
          items: enrichedItems,
          createdAt: orderData.createdAt,
          updatedAt: orderData.updatedAt
        });
      });
      
      setOrders(ordersList);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = (status: string) => {
    setOrderStatus(status);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrderDetails || !orderStatus) return;
    
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", selectedOrderDetails.id);
      await updateDoc(orderRef, { 
        status: orderStatus,
        updatedAt: new Date()
      });
      
      // Atualizar o estado local
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrderDetails.id 
            ? { ...order, status: orderStatus as any, updatedAt: Timestamp.now() } 
            : order
        )
      );
      
      setSelectedOrderDetails(null);
      setOrderStatus("");
      
      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (activeTab === "all") return orders;
    return orders.filter(order => order.status === activeTab);
  };

  const formatDate = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Gerencie os pedidos do estabelecimento</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="preparing">Em Preparo</TabsTrigger>
            <TabsTrigger value="ready">Prontos</TabsTrigger>
            <TabsTrigger value="delivered">Entregues</TabsTrigger>
            <TabsTrigger value="canceled">Cancelados</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente/Mesa</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    <span className="text-sm text-muted-foreground">Carregando...</span>
                  </TableCell>
                </TableRow>
              ) : getFilteredOrders().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum pedido encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredOrders().map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(order.createdAt.toDate(), "dd/MM/yyyy", { locale: ptBR })}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(order.createdAt.toDate(), "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.tableNumber ? (
                        <span>Mesa {order.tableNumber}</span>
                      ) : order.customerName ? (
                        <span>{order.customerName}</span>
                      ) : (
                        <span className="text-muted-foreground">Não informado</span>
                      )}
                      
                      {order.delivery && (
                        <Badge variant="outline" className="ml-2">Delivery</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${OrderStatusColor[order.status]}`}>
                        {OrderStatusTranslations[order.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Pedido</DialogTitle>
                              <DialogDescription>
                                Pedido #{order.id.substring(0, 8).toUpperCase()}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6 py-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Data</span>
                                <span className="text-sm">{formatDate(order.createdAt)}</span>
                              </div>
                              
                              {order.tableNumber && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Mesa</span>
                                  <span className="text-sm">Mesa {order.tableNumber}</span>
                                </div>
                              )}
                              
                              {order.customerName && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Cliente</span>
                                  <span className="text-sm">{order.customerName}</span>
                                </div>
                              )}
                              
                              {order.delivery && order.address && (
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-medium">Endereço</span>
                                  <span className="text-sm text-right">{order.address}</span>
                                </div>
                              )}
                              
                              {order.paymentMethod && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Pagamento</span>
                                  <span className="text-sm">
                                    {PaymentMethodTranslations[order.paymentMethod as keyof typeof PaymentMethodTranslations] || order.paymentMethod}
                                  </span>
                                </div>
                              )}
                              
                              <div className="border-t border-gray-200 pt-4">
                                <h3 className="font-medium mb-2">Itens do Pedido</h3>
                                <div className="space-y-2">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between">
                                      <div className="flex items-start">
                                        <span className="text-sm font-medium mr-2">{item.quantity}x</span>
                                        <div>
                                          <span className="text-sm">{item.product?.name || `Produto #${item.productId.substring(0, 6)}`}</span>
                                          {item.observations && (
                                            <p className="text-xs text-muted-foreground">
                                              Obs: {item.observations}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-sm">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between font-bold">
                                  <span>Total</span>
                                  <span>{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                              
                              <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Status</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${OrderStatusColor[order.status]}`}>
                                    {OrderStatusTranslations[order.status]}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedOrderDetails(order);
                                  setOrderStatus(order.status);
                                }}
                              >
                                Alterar Status
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={!!selectedOrderDetails} onOpenChange={(open) => !open && setSelectedOrderDetails(null)}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Alterar Status do Pedido</DialogTitle>
                              <DialogDescription>
                                Selecione um novo status para este pedido
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="space-y-2">
                                <Label htmlFor="status">Novo Status</Label>
                                <Select 
                                  value={orderStatus} 
                                  onValueChange={handleStatusChange}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="preparing">Em Preparo</SelectItem>
                                    <SelectItem value="ready">Pronto</SelectItem>
                                    <SelectItem value="delivered">Entregue</SelectItem>
                                    <SelectItem value="canceled">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedOrderDetails(null)}>
                                Cancelar
                              </Button>
                              <Button onClick={updateOrderStatus} disabled={!orderStatus || loading}>
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Atualizar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersCollection;
