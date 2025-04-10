
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, CreditCard, Loader2, ShoppingCart, UserCheck, Utensils } from "lucide-react";

const DashboardPage = () => {
  const { user } = useUser();
  
  // Stats cards based on user role
  const getStatCards = () => {
    switch (user?.role) {
      case "admin":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Today's Sales" 
              value="$1,240.56" 
              description="+12% from yesterday"
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Active Orders" 
              value="32" 
              description="4 pending preparation"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Tables Occupied" 
              value="8/12" 
              description="66% occupancy rate"
              icon={<Utensils className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Customers Served" 
              value="146" 
              description="+8% from yesterday"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      case "waiter":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Your Tables" 
              value="5" 
              description="2 need attention"
              icon={<Utensils className="h-5 w-5 text-muted-foreground" />}
              trend="none"
              alert
            />
            <StatCard 
              title="Pending Orders" 
              value="7" 
              description="3 ready for delivery"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Today's Service" 
              value="24" 
              description="Orders completed"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      case "kitchen":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Orders Queue" 
              value="12" 
              description="4 high priority"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="up"
              alert
            />
            <StatCard 
              title="In Preparation" 
              value="5" 
              description="Estimated 15 min"
              icon={<Loader2 className="h-5 w-5 text-muted-foreground" />}
              trend="none"
            />
            <StatCard 
              title="Completed Today" 
              value="87" 
              description="65 dine-in, 22 delivery"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      case "cashier":
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
              title="Today's Sales" 
              value="$1,240.56" 
              description="+12% from yesterday"
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
            <StatCard 
              title="Pending Checkouts" 
              value="5" 
              description="Tables ready to pay"
              icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
              trend="none"
              alert
            />
            <StatCard 
              title="Completed Transactions" 
              value="32" 
              description="Today's processed payments"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              trend="up"
            />
          </div>
        );
      default:
        return (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">Welcome to FoodieHub!</h3>
            <p className="text-muted-foreground mt-2">No data to display for this user role.</p>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
      <p className="text-muted-foreground">Here's an overview of your restaurant activities</p>
      
      {getStatCards()}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["admin", "waiter", "kitchen", "cashier"].includes(user?.role as string) && (
                <>
                  <OrderItem 
                    table="Table 5" 
                    items="2x Burger, 1x Fries, 2x Soda" 
                    time="5 min ago" 
                    status="pending" 
                  />
                  <OrderItem 
                    table="Table 2" 
                    items="1x Pizza, 2x Beer" 
                    time="12 min ago" 
                    status="preparing" 
                  />
                  <OrderItem 
                    table="Table 8" 
                    items="3x Pasta, 1x Salad, 3x Water" 
                    time="18 min ago" 
                    status="ready" 
                  />
                  <OrderItem 
                    table="Table 1" 
                    items="2x Steak, 1x Wine" 
                    time="25 min ago" 
                    status="delivered" 
                  />
                </>
              )}
              {user?.role === "customer" && (
                <p className="text-center py-4 text-muted-foreground">
                  Your order history will appear here
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user?.role === "admin" && (
                <>
                  <QuickAction label="Add new menu item" />
                  <QuickAction label="Manage tables" />
                  <QuickAction label="Inventory check" />
                </>
              )}
              {user?.role === "waiter" && (
                <>
                  <QuickAction label="Check table status" />
                  <QuickAction label="Create new order" />
                  <QuickAction label="Process checkout" />
                </>
              )}
              {user?.role === "kitchen" && (
                <>
                  <QuickAction label="View order queue" />
                  <QuickAction label="Mark order as ready" />
                  <QuickAction label="Update inventory" />
                </>
              )}
              {user?.role === "cashier" && (
                <>
                  <QuickAction label="Process payment" />
                  <QuickAction label="View daily summary" />
                  <QuickAction label="Close register" />
                </>
              )}
              {user?.role === "customer" && (
                <>
                  <QuickAction label="View menu" />
                  <QuickAction label="Track order" />
                  <QuickAction label="Request assistance" />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Stat Card Component
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

// Order Item Component
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
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
    </div>
  );
};

// Quick Action Component
const QuickAction = ({ label }: { label: string }) => {
  return (
    <Button variant="outline" className="w-full justify-start text-left">
      {label}
    </Button>
  );
};

export default DashboardPage;
