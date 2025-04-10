
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, CreditCard, Loader2, ShoppingCart, UserCheck, Utensils } from "lucide-react";

const DashboardPage = () => {
  const { user } = useUser();
  
  // Cards de estatísticas com base na função do usuário
  const getStatCards = () => {
    switch (user?.role) {
      case "admin":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Vendas de Hoje" 
              value="R$ 1.240,56" 
              description="+12% em relação a ontem"
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Pedidos Ativos" 
              value="32" 
              description="4 aguardando preparo"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Mesas Ocupadas" 
              value="8/12" 
              description="66% de taxa de ocupação"
              icon={<Utensils className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Clientes Atendidos" 
              value="146" 
              description="+8% em relação a ontem"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      case "waiter":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Suas Mesas" 
              value="5" 
              description="2 precisam de atenção"
              icon={<Utensils className="h-5 w-5 text-muted-foreground" />}
              trend="none"
              alert
            />
            <StatCard 
              title="Pedidos Pendentes" 
              value="7" 
              description="3 prontos para entrega"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Atendimentos Hoje" 
              value="24" 
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
              value="12" 
              description="4 alta prioridade"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="up"
              alert
            />
            <StatCard 
              title="Em Preparo" 
              value="5" 
              description="Estimado 15 min"
              icon={<Loader2 className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Completados Hoje" 
              value="87" 
              description="65 no local, 22 delivery"
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
              value="R$ 1.240,56" 
              description="+12% em relação a ontem"
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Pagamentos Pendentes" 
              value="5" 
              description="Mesas prontas para pagar"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
              alert
            />
            <StatCard 
              title="Transações Concluídas" 
              value="32" 
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
            <div className="space-y-2">
              {["admin", "waiter", "kitchen", "cashier"].includes(user?.role as string) && (
                <>
                  <OrderItem 
                    table="Mesa 5" 
                    items="2x Hambúrguer, 1x Batata Frita, 2x Refrigerante" 
                    time="5 min atrás" 
                    status="pending" 
                  />
                  <OrderItem 
                    table="Mesa 2" 
                    items="1x Pizza, 2x Cerveja" 
                    time="12 min atrás" 
                    status="preparing" 
                  />
                  <OrderItem 
                    table="Mesa 8" 
                    items="3x Macarrão, 1x Salada, 3x Água" 
                    time="18 min atrás" 
                    status="ready" 
                  />
                  <OrderItem 
                    table="Mesa 1" 
                    items="2x Filé, 1x Vinho" 
                    time="25 min atrás" 
                    status="delivered" 
                  />
                </>
              )}
              {user?.role === "customer" && (
                <p className="text-center py-4 text-muted-foreground">
                  Seu histórico de pedidos aparecerá aqui
                </p>
              )}
            </div>
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
                  <QuickAction label="Adicionar novo item ao menu" />
                  <QuickAction label="Gerenciar mesas" />
                  <QuickAction label="Verificar estoque" />
                </>
              )}
              {user?.role === "waiter" && (
                <>
                  <QuickAction label="Verificar status das mesas" />
                  <QuickAction label="Criar novo pedido" />
                  <QuickAction label="Processar fechamento" />
                </>
              )}
              {user?.role === "kitchen" && (
                <>
                  <QuickAction label="Ver fila de pedidos" />
                  <QuickAction label="Marcar pedido como pronto" />
                  <QuickAction label="Atualizar estoque" />
                </>
              )}
              {user?.role === "cashier" && (
                <>
                  <QuickAction label="Processar pagamento" />
                  <QuickAction label="Ver resumo diário" />
                  <QuickAction label="Fechar caixa" />
                </>
              )}
              {user?.role === "customer" && (
                <>
                  <QuickAction label="Ver cardápio" />
                  <QuickAction label="Acompanhar pedido" />
                  <QuickAction label="Solicitar atendimento" />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Componente de Card de Estatísticas
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

// Componente de Item de Pedido
const OrderItem = ({ 
  table, 
  items, 
  time, 
  status 
}: { 
  table: string, 
  items: string, 
  time: string, 
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
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
          {status === "cancelled" && "Cancelado"}
        </div>
      </div>
    </div>
  );
};

// Componente de Ação Rápida
const QuickAction = ({ label }: { label: string }) => {
  return (
    <Button variant="outline" className="w-full justify-start text-left">
      {label}
    </Button>
  );
};

export default DashboardPage;
