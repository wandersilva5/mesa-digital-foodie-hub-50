
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, Coffee, CalendarDays, LayoutGrid, ShoppingBag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import UsersCollection from "@/components/firebase-admin/UsersCollection";
import CategoriesCollection from "@/components/firebase-admin/CategoriesCollection";
import ProductsCollection from "@/components/firebase-admin/ProductsCollection";
import TablesCollection from "@/components/firebase-admin/TablesCollection";
import OrdersCollection from "@/components/firebase-admin/OrdersCollection";

const FirebaseAdminPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold">Administração do Firebase</h1>
        </div>
        
        <Button variant="outline" asChild>
          <Link to="/firebase-setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Configurar Banco de Dados</span>
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dados</CardTitle>
          <CardDescription>
            Visualize e gerencie os dados do Firebase para que o sistema utilize dados reais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                <span className="hidden sm:inline">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Mesas</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <UsersCollection />
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              <CategoriesCollection />
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <ProductsCollection />
            </TabsContent>
            
            <TabsContent value="tables" className="space-y-4">
              <TablesCollection />
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <OrdersCollection />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirebaseAdminPage;
