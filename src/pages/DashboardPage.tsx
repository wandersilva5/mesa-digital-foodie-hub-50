import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, CreditCard, Loader2, ShoppingCart, UserCheck, Utensils } from "lucide-react";
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySales: 0,
    activeOrders: 0,
    occupiedTables: 0,
    totalTables: 0,
    servedCustomers: 0,
    pendingOrders: 0,
    readyOrders: 0,
    ordersInPreparation: 0,
    completedOrders: 0,
    pendingPayments: 0,
    completedTransactions: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayTimestamp = Timestamp.fromDate(startOfToday);
        
        const paymentsRef = collection(db, "payments");
        const paymentsQuery = query(
          paymentsRef,
          where("createdAt", ">=", todayTimestamp),
          where("status", "==", "completed")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        let todaySales = 0;
        paymentsSnapshot.forEach((doc) => {
          const payment = doc.data();
          todaySales += payment.amount;
        });
        
        const ordersRef = collection(db, "orders");
        const activeOrdersQuery = query(
          ordersRef,
          where("status", "in", ["pending", "preparing", "ready"])
        );
        const activeOrdersSnapshot = await getDocs(activeOrdersQuery);
        
        const tablesRef = collection(db, "tables");
        const tablesSnapshot = await getDocs(tablesRef);
        const occupiedTablesSnapshot = await getDocs(
          query(tablesRef, where("status", "==", "occupied"))
        );
        
        const recentOrdersQuery = query(
          ordersRef,
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrdersList: any[] = [];
        
        recentOrdersSnapshot.forEach((doc) => {
          const data = doc.data();
          recentOrdersList.push({
            id: doc.id,
            tableNumber: data.tableNumber,
            items: data.items,
            status: data.status,
            createdAt: data.createdAt,
          });
        });
        
        const pendingOrdersQuery = query(ordersRef, where("status", "==", "pending"));
        const pendingOrdersSnapshot = await getDocs(pendingOrdersQuery);
        
        const preparingOrdersQuery = query(ordersRef, where("status", "==", "preparing"));
        const preparingOrdersSnapshot = await getDocs(preparingOrdersQuery);
        
        const readyOrdersQuery = query(ordersRef, where("status", "==", "ready"));
        const readyOrdersSnapshot = await getDocs(readyOrdersQuery);
        
        const completedOrdersQuery = query(
          ordersRef,
          where("status", "==", "delivered"),
          where("createdAt", ">=", todayTimestamp)
        );
        const completedOrdersSnapshot = await getDocs(completedOrdersQuery);
        
        const pendingPaymentsQuery = query(
          ordersRef,
          where("status", "==", "delivered"),
          where("paymentStatus", "==", "pending")
        );
        const pendingPaymentsSnapshot = await getDocs(pendingPaymentsQuery);
        
        setStats({
          todaySales,
          activeOrders: activeOrdersSnapshot.size,
          occupiedTables: occupiedTablesSnapshot.size,
          totalTables: tablesSnapshot.size,
          servedCustomers: completedOrdersSnapshot.size,
          pendingOrders: pendingOrdersSnapshot.size,
          readyOrders: readyOrdersSnapshot.size,
          ordersInPreparation: preparingOrdersSnapshot.size,
          completedOrders: completedOrdersSnapshot.size,
          pendingPayments: pendingPaymentsSnapshot.size,
          completedTransactions: paymentsSnapshot.size
        });
        
        setRecentOrders(recentOrdersList);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  const getStatCards = () => {
    if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-7 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }
    
    switch (user?.role) {
      case "admin":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Vendas de Hoje" 
              value={`R$ ${stats.todaySales.toFixed(2).replace('.', ',')}`} 
              description="Faturamento total do dia"
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Pedidos Ativos" 
              value={stats.activeOrders.toString()} 
              description={`${stats.pendingOrders} aguardando preparo`}
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Mesas Ocupadas" 
              value={`${stats.occupiedTables}/${stats.totalTables}`} 
              description={`${Math.round((stats.occupiedTables / (stats.totalTables || 1)) * 100)}% de taxa de ocupação`}
              icon={<Utensils className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Clientes Atendidos" 
              value={stats.servedCustomers.toString()} 
              description="Pedidos entregues hoje"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      case "waiter":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Mesas Ocupadas" 
              value={`${stats.occupiedTables}/${stats.totalTables}`} 
              description={`${Math.round((stats.occupiedTables / (stats.totalTables || 1)) * 100)}% de ocupação`}
              icon={<Utensils className="h-5 w-5 text-muted-foreground" />}
              trend="none"
              alert={stats.occupiedTables > stats.totalTables / 2}
            />
            <StatCard 
              title="Pedidos Pendentes" 
              value={stats.activeOrders.toString()} 
              description={`${stats.readyOrders} prontos para entrega`}
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Atendimentos Hoje" 
              value={stats.completedOrders.toString()} 
              description="Pedidos completados"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      case "kitchen":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Fila de Pedidos" 
              value={stats.pendingOrders.toString()} 
              description="Aguardando preparo"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="up"
              alert={stats.pendingOrders > 5}
            />
            <StatCard 
              title="Em Preparo" 
              value={stats.ordersInPreparation.toString()} 
              description="Sendo preparados"
              icon={<Loader2 className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Completados Hoje" 
              value={stats.completedOrders.toString()} 
              description="Pedidos finalizados"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      case "cashier":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Vendas de Hoje" 
              value={`R$ ${stats.todaySales.toFixed(2).replace('.', ',')}`} 
              description="Faturamento total do dia"
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Pagamentos Pendentes" 
              value={stats.pendingPayments.toString()} 
              description="Mesas prontas para pagar"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
              alert={stats.pendingPayments > 0}
            />
            <StatCard 
              title="Transações Concluídas" 
              value={stats.completedTransactions.toString()} 
              description="Pagamentos processados hoje"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      default:
        return (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">Bem-vindo ao FoodieHub!</h3>
            <p className="text-muted-foreground mt-2">Não há dados para exibir para esta função de usuário.</p>
          </div>
        );
    }
  };
  
  const handleQuickAction = (action: string) => {
    switch(action) {
      case "gerenciar-mesas":
        navigate("/tables");
        break;
      case "verificar-estoque":
        navigate("/inventory");
        break;
      case "adicionar-item-menu":
        navigate("/menu");
        break;
      case "criar-pedido":
        navigate("/orders/new");
        break;
      case "processar-pagamento":
        navigate("/checkout");
        break;
      case "ver-fila-pedidos":
        navigate("/orders");
        break;
      default:
        console.log("Action not implemented:", action);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta, {user?.name}</h1>
      <p className="text-muted-foreground">Aqui está uma visão geral das atividades do seu restaurante</p>
      
      {getStatCards()}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos pedidos de clientes recebidos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex justify-between border-b pb-2">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ["admin", "waiter", "kitchen", "cashier"].includes(user?.role as string) ? (
              <div className="space-y-2">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <OrderItem 
                      key={order.id}
                      table={order.tableNumber ? `Mesa ${order.tableNumber}` : "Delivery"}
                      items={order.items.map((item: any) => `${item.quantity}x ${item.name || 'Item'}`).join(', ')}
                      time={formatTimeAgo(order.createdAt?.toDate())}
                      status={order.status}
                    />
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Nenhum pedido recente encontrado
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Seu histórico de pedidos aparecerá aqui
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Tarefas comuns para sua função</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user?.role === "admin" && (
                <>
                  <QuickAction label="Adicionar novo item ao menu" onClick={() => handleQuickAction("adicionar-item-menu")} />
                  <QuickAction label="Gerenciar mesas" onClick={() => handleQuickAction("gerenciar-mesas")} />
                  <QuickAction label="Verificar estoque" onClick={() => handleQuickAction("verificar-estoque")} />
                </>
              )}
              {user?.role === "waiter" && (
                <>
                  <QuickAction label="Verificar status das mesas" onClick={() => handleQuickAction("gerenciar-mesas")} />
                  <QuickAction label="Criar novo pedido" onClick={() => handleQuickAction("criar-pedido")} />
                  <QuickAction label="Processar fechamento" onClick={() => handleQuickAction("processar-pagamento")} />
                </>
              )}
              {user?.role === "kitchen" && (
                <>
                  <QuickAction label="Ver fila de pedidos" onClick={() => handleQuickAction("ver-fila-pedidos")} />
                  <QuickAction label="Marcar pedido como pronto" onClick={() => handleQuickAction("ver-fila-pedidos")} />
                  <QuickAction label="Atualizar estoque" onClick={() => handleQuickAction("verificar-estoque")} />
                </>
              )}
              {user?.role === "cashier" && (
                <>
                  <QuickAction label="Processar pagamento" onClick={() => handleQuickAction("processar-pagamento")} />
                  <QuickAction label="Ver resumo diário" onClick={() => handleQuickAction("processar-pagamento")} />
                  <QuickAction label="Fechar caixa" onClick={() => handleQuickAction("processar-pagamento")} />
                </>
              )}
              {user?.role === "customer" && (
                <>
                  <QuickAction label="Ver cardápio" onClick={() => handleQuickAction("ver-cardapio")} />
                  <QuickAction label="Acompanhar pedido" onClick={() => handleQuickAction("acompanhar-pedido")} />
                  <QuickAction label="Solicitar atendimento" onClick={() => handleQuickAction("solicitar-atendimento")} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  alert 
}: { 
  title: string, 
  value: string, 
  description: string, 
  icon: React.ReactNode, 
  trend: "up" | "down" | "none",
  alert?: boolean
}) => {
  return (
    <Card className={alert ? "border-l-4 border-l-orange-500" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center">
          {trend === "up" && <ArrowUp className="h-3 w-3 text-green-500 mr-1" />}
          {trend === "down" && <ArrowDown className="h-3 w-3 text-red-500 mr-1" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

const OrderItem = ({ 
  table, 
  items, 
  time, 
  status 
}: { 
  table: string, 
  items: string, 
  time: string, 
  status: "pending" | "preparing" | "ready" | "delivered" | "canceled"
}) => {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <div>
        <p className="font-medium">{table}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{items}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">{time}</p>
        <div className={`status-${status} inline-block mt-1`}>
          {status === "pending" && "Pendente"}
          {status === "preparing" && "Em preparo"}
          {status === "ready" && "Pronto"}
          {status === "delivered" && "Entregue"}
          {status === "canceled" && "Cancelado"}
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ label, onClick }: { label: string, onClick: () => void }) => {
  return (
    <Button variant="outline" className="w-full justify-start text-left" onClick={onClick}>
      {label}
    </Button>
  );
};

const formatTimeAgo = (date: Date) => {
  if (!date) return "";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin} min atrás`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  return format(date, "dd/MM/yyyy");
};

export default DashboardPage;
