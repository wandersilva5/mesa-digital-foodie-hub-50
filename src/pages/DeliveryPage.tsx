
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, MapPin, Phone, Clock, CheckCircle, Truck, AlertTriangle, User, Home } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

// Dados fictícios de entregas
const deliveries = [
  {
    id: 1,
    orderId: 3,
    customerName: "Pedro Santos",
    phone: "(11) 98765-4321",
    address: "Rua das Flores, 123, Apto 101",
    district: "Centro",
    city: "São Paulo",
    items: [
      { name: "X-Bacon", quantity: 2, price: 22.90 },
      { name: "Onion Rings", quantity: 1, price: 14.90 },
      { name: "Refrigerante Lata", quantity: 2, price: 5.90 }
    ],
    status: "ready",
    estimatedTime: "30-45 min",
    assignedTo: null,
    createdAt: "2023-05-10T16:00:00",
    totalAmount: 72.50
  },
  {
    id: 2,
    orderId: 5,
    customerName: "Carlos Mendes",
    phone: "(11) 91234-5678",
    address: "Avenida Central, 456",
    district: "Jardins",
    city: "São Paulo",
    items: [
      { name: "X-Burger Tradicional", quantity: 1, price: 18.90 },
      { name: "Refrigerante Lata", quantity: 1, price: 5.90 }
    ],
    status: "inTransit",
    estimatedTime: "10-20 min",
    assignedTo: "Lucas",
    createdAt: "2023-05-10T16:30:00",
    totalAmount: 24.80
  },
  {
    id: 3,
    orderId: 9,
    customerName: "Amanda Silva",
    phone: "(11) 97777-8888",
    address: "Rua Palmeiras, 789",
    district: "Vila Madalena",
    city: "São Paulo",
    items: [
      { name: "X-Salada", quantity: 2, price: 19.90 },
      { name: "Batata Frita", quantity: 1, price: 12.90 },
      { name: "Milk Shake", quantity: 2, price: 13.90 }
    ],
    status: "pending",
    estimatedTime: "45-60 min",
    assignedTo: null,
    createdAt: "2023-05-10T17:15:00",
    totalAmount: 80.50
  },
  {
    id: 4,
    orderId: 12,
    customerName: "Mariana Costa",
    phone: "(11) 94444-5555",
    address: "Rua dos Pinheiros, 321",
    district: "Pinheiros",
    city: "São Paulo",
    items: [
      { name: "X-Burger Tradicional", quantity: 1, price: 18.90 },
      { name: "X-Bacon", quantity: 1, price: 22.90 },
      { name: "Refrigerante Lata", quantity: 2, price: 5.90 }
    ],
    status: "delivered",
    estimatedTime: "30-45 min",
    assignedTo: "Miguel",
    createdAt: "2023-05-10T15:30:00",
    totalAmount: 53.60
  }
];

// Lista de entregadores
const deliveryDrivers = [
  { id: 1, name: "Lucas", available: true, ordersDelivered: 5, currentDelivery: 2 },
  { id: 2, name: "Miguel", available: false, ordersDelivered: 3, currentDelivery: null },
  { id: 3, name: "Gabriel", available: true, ordersDelivered: 7, currentDelivery: null }
];

const DeliveryPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState<null | typeof deliveries[0]>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [newAddress, setNewAddress] = useState({
    customerName: "",
    phone: "",
    address: "",
    district: "",
    city: "",
    items: "",
    notes: ""
  });
  
  const userRole = user?.role;
  
  const handleAssignDriver = () => {
    if (!selectedDelivery || !selectedDriver) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um entregador",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Entrega Atribuída",
      description: `Pedido #${selectedDelivery.orderId} foi atribuído a ${selectedDriver}`,
    });
    
    setIsAssignDialogOpen(false);
  };
  
  const handleCreateDelivery = () => {
    // Validar campos
    if (
      !newAddress.customerName ||
      !newAddress.phone ||
      !newAddress.address ||
      !newAddress.district ||
      !newAddress.city
    ) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Pedido Criado",
      description: `Novo pedido de delivery para ${newAddress.customerName} foi criado com sucesso`,
    });
    
    setNewAddress({
      customerName: "",
      phone: "",
      address: "",
      district: "",
      city: "",
      items: "",
      notes: ""
    });
    
    setIsNewOrderDialogOpen(false);
  };
  
  const handleUpdateStatus = (deliveryId: number, newStatus: string) => {
    toast({
      title: "Status Atualizado",
      description: `Entrega #${deliveryId} foi atualizada para ${translateStatus(newStatus)}`,
    });
  };
  
  const translateStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      "pending": "Pendente",
      "ready": "Pronto para Entrega",
      "inTransit": "Em Trânsito",
      "delivered": "Entregue",
      "cancelled": "Cancelado"
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status: string): string => {
    const statusColor: { [key: string]: string } = {
      "pending": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
      "ready": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      "inTransit": "bg-primary/10 text-primary hover:bg-primary/20",
      "delivered": "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      "cancelled": "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    };
    return statusColor[status] || "";
  };
  
  const filteredDeliveries = deliveries.filter(delivery => {
    // Filtrar por termo de busca
    const searchMatch = 
      delivery.id.toString().includes(searchTerm) || 
      delivery.orderId.toString().includes(searchTerm) ||
      delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por permissões de usuário
    if (userRole === "customer") {
      // Cliente só vê suas próprias entregas
      return searchMatch && delivery.customerName === user?.name;
    } else {
      return searchMatch;
    }
  });
  
  const openAssignDialog = (delivery: typeof deliveries[0]) => {
    setSelectedDelivery(delivery);
    setSelectedDriver("");
    setIsAssignDialogOpen(true);
  };
  
  const DeliveryCard = ({ delivery }: { delivery: typeof deliveries[0] }) => {
    return (
      <Card key={delivery.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                Pedido #{delivery.orderId}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {delivery.customerName} • {delivery.estimatedTime}
              </div>
            </div>
            <Badge className={getStatusColor(delivery.status)}>
              {translateStatus(delivery.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
              <div className="text-sm flex-1">
                {delivery.address}, {delivery.district}, {delivery.city}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">{delivery.phone}</div>
            </div>
            
            {delivery.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Entregador: {delivery.assignedTo}</div>
              </div>
            )}
            
            <div className="border-t mt-2 pt-2">
              <div className="font-medium mb-1 text-sm">Itens do pedido:</div>
              {delivery.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 font-bold flex justify-between text-sm">
                <span>Total</span>
                <span>R$ {delivery.totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              {(userRole === "admin" || userRole === "waiter") && delivery.status === "ready" && !delivery.assignedTo && (
                <Button onClick={() => openAssignDialog(delivery)} className="flex-1" size="sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Atribuir Entregador
                </Button>
              )}
              
              {userRole === "waiter" && delivery.status === "inTransit" && (
                <Button 
                  onClick={() => handleUpdateStatus(delivery.id, "delivered")}
                  className="flex-1"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Entregue
                </Button>
              )}
              
              {userRole === "kitchen" && delivery.status === "pending" && (
                <Button 
                  onClick={() => handleUpdateStatus(delivery.id, "ready")}
                  className="flex-1"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pronto para Entrega
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
          <h1 className="text-2xl font-bold tracking-tight">Delivery</h1>
          <p className="text-muted-foreground">Gerenciamento de entregas e pedidos para entrega</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar delivery..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {(userRole === "admin" || userRole === "waiter") && (
            <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Novo Pedido de Delivery</DialogTitle>
                  <DialogDescription>
                    Preencha as informações de entrega do cliente.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customerName">Nome do Cliente</Label>
                    <Input
                      id="customerName"
                      value={newAddress.customerName}
                      onChange={(e) => setNewAddress({...newAddress, customerName: e.target.value})}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      placeholder="Ex: (11) 98765-4321"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                      placeholder="Ex: Rua das Flores, 123, Apto 101"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="district">Bairro</Label>
                      <Input
                        id="district"
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                        placeholder="Ex: Centro"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="items">Itens do Pedido</Label>
                    <Textarea
                      id="items"
                      value={newAddress.items}
                      onChange={(e) => setNewAddress({...newAddress, items: e.target.value})}
                      placeholder="Ex: 1x X-Bacon, 1x Batata Frita, 2x Refrigerante"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={newAddress.notes}
                      onChange={(e) => setNewAddress({...newAddress, notes: e.target.value})}
                      placeholder="Ex: Sem cebola, entregar na portaria..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateDelivery}>Criar Pedido</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="all">
            <TabsList className="w-full h-auto flex flex-wrap justify-start mb-2">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="ready">Prontas</TabsTrigger>
              <TabsTrigger value="inTransit">Em Trânsito</TabsTrigger>
              <TabsTrigger value="delivered">Entregues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(delivery => <DeliveryCard key={delivery.id} delivery={delivery} />)
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Nenhuma entrega encontrada</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Não há entregas para exibir com os filtros atuais.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-4">
              {filteredDeliveries.filter(d => d.status === "pending").map(delivery => 
                <DeliveryCard key={delivery.id} delivery={delivery} />
              )}
            </TabsContent>
            
            <TabsContent value="ready" className="mt-4">
              {filteredDeliveries.filter(d => d.status === "ready").map(delivery => 
                <DeliveryCard key={delivery.id} delivery={delivery} />
              )}
            </TabsContent>
            
            <TabsContent value="inTransit" className="mt-4">
              {filteredDeliveries.filter(d => d.status === "inTransit").map(delivery => 
                <DeliveryCard key={delivery.id} delivery={delivery} />
              )}
            </TabsContent>
            
            <TabsContent value="delivered" className="mt-4">
              {filteredDeliveries.filter(d => d.status === "delivered").map(delivery => 
                <DeliveryCard key={delivery.id} delivery={delivery} />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {(userRole === "admin" || userRole === "waiter") && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Entregadores</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {deliveryDrivers.map(driver => (
                    <div key={driver.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${driver.available ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="font-medium">{driver.name}</span>
                        </div>
                        <Badge variant="outline">
                          {driver.ordersDelivered} entregas
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {driver.available ? 
                          driver.currentDelivery ? 
                          `Em entrega: #${driver.currentDelivery}` : 
                          "Disponível" : 
                          "Indisponível"
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atribuir Entregador</DialogTitle>
                  <DialogDescription>
                    Selecione um entregador disponível para esta entrega.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    {selectedDelivery && (
                      <div className="text-sm">
                        <div className="font-medium">Pedido #{selectedDelivery.orderId}</div>
                        <div>{selectedDelivery.address}, {selectedDelivery.district}</div>
                        <div className="mt-2 font-medium">Selecione um entregador:</div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {deliveryDrivers
                        .filter(driver => driver.available && !driver.currentDelivery)
                        .map(driver => (
                          <div 
                            key={driver.id}
                            className={`p-3 border rounded-md cursor-pointer flex items-center justify-between ${
                              selectedDriver === driver.name ? "border-primary bg-primary/5" : ""
                            }`}
                            onClick={() => setSelectedDriver(driver.name)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span>{driver.name}</span>
                            </div>
                            <Badge variant="outline">{driver.ordersDelivered} entregas</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAssignDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAssignDriver}>
                    Atribuir Entregador
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;
