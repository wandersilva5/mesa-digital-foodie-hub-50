
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "@/components/ui/code";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const FirebaseSetupPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuração do Firebase</h1>
      
      <Alert className="mb-6">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Esta página contém informações sobre a estrutura do banco de dados Firebase utilizada nesta aplicação.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="collections">
        <TabsList className="mb-4">
          <TabsTrigger value="collections">Coleções</TabsTrigger>
          <TabsTrigger value="rules">Regras de Segurança</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
        </TabsList>
        
        <TabsContent value="collections">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estrutura da coleção de mesas */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: tables</CardTitle>
                <CardDescription>
                  Estrutura para gerenciar mesas do estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
{`// Estrutura da coleção "tables"
{
  "id": string, // ID único da mesa (ex: "table_1632456789")
  "number": number, // Número da mesa (ex: 1, 2, 3...)
  "capacity": number, // Capacidade da mesa (ex: 2, 4, 6...)
  "status": string, // Status da mesa: "available", "occupied", "reserved", "unavailable"
  "location": string, // Localização da mesa (ex: "internal", "external", "balcony", "vip")
  "active": boolean, // Se a mesa está ativa no sistema
  "qrCodeUrl": string, // (Opcional) URL do QR Code da mesa
  "lastOrderTimestamp": timestamp, // (Opcional) Data/hora do último pedido
  "currentOrderId": string // (Opcional) ID do pedido atual
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Estrutura da coleção de categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: categories</CardTitle>
                <CardDescription>
                  Categorias de produtos no cardápio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
{`// Estrutura da coleção "categories"
{
  "id": string, // ID único da categoria (ex: "category_1632456789")
  "name": string, // Nome da categoria (ex: "Bebidas", "Lanches", "Sobremesas")
  "description": string, // Descrição da categoria
  "imageUrl": string, // URL da imagem da categoria
  "active": boolean, // Se a categoria está ativa
  "order": number // Ordem de exibição da categoria no cardápio (opcional)
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Estrutura da coleção de produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: products</CardTitle>
                <CardDescription>
                  Produtos do cardápio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
{`// Estrutura da coleção "products"
{
  "id": string, // ID único do produto (ex: "product_1632456789")
  "name": string, // Nome do produto
  "description": string, // Descrição do produto
  "price": number, // Preço do produto
  "imageUrl": string, // URL da imagem do produto
  "categoryId": string, // ID da categoria a que pertence
  "active": boolean, // Se o produto está ativo
  "ingredients": array, // Array de ingredientes (strings)
  "prepTime": number, // Tempo de preparo em minutos
  "featured": boolean, // Se o produto está em destaque
  "allergens": array, // (Opcional) Array de alérgenos
  "nutritionalInfo": object // (Opcional) Informações nutricionais
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Estrutura da coleção de pedidos */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: orders</CardTitle>
                <CardDescription>
                  Pedidos realizados pelos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
{`// Estrutura da coleção "orders"
{
  "id": string, // ID único do pedido (ex: "order_1632456789")
  "tableId": string, // ID da mesa (se aplicável)
  "tableNumber": number, // Número da mesa (se aplicável)
  "userId": string, // ID do usuário (se aplicável)
  "customerName": string, // Nome do cliente (opcional)
  "items": [
    {
      "productId": string, // ID do produto
      "quantity": number, // Quantidade
      "price": number, // Preço unitário
      "observations": string // Observações específicas do item
    }
  ],
  "total": number, // Valor total do pedido
  "status": string, // Status do pedido: "pending", "preparing", "ready", "delivered", "canceled"
  "paymentMethod": string, // Método de pagamento (se aplicável)
  "paymentStatus": string, // Status do pagamento (se aplicável)
  "delivery": boolean, // Se é para entrega
  "address": string, // Endereço de entrega (se aplicável)
  "createdAt": timestamp, // Data/hora de criação
  "updatedAt": timestamp, // Data/hora da última atualização
  "completedAt": timestamp // Data/hora de finalização (opcional)
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Estrutura da coleção de usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: users</CardTitle>
                <CardDescription>
                  Usuários do sistema (funcionários e clientes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
{`// Estrutura da coleção "users"
{
  "id": string, // ID único do usuário (geralmente gerado pelo Auth)
  "name": string, // Nome completo
  "email": string, // Email
  "phone": string, // Número de telefone (opcional)
  "role": string, // Papel: "admin", "cashier", "waiter", "kitchen", "customer"
  "active": boolean, // Se o usuário está ativo
  "address": {
    "street": string,
    "number": string,
    "complement": string,
    "neighborhood": string,
    "city": string,
    "state": string,
    "zipCode": string
  }, // Endereço (opcional)
  "favorites": array, // Array de IDs de produtos favoritos (opcional)
  "createdAt": timestamp, // Data de criação
  "lastLoginAt": timestamp // Data do último login
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Estrutura da configuração do estabelecimento */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: establishment</CardTitle>
                <CardDescription>
                  Configurações do estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
{`// Estrutura da coleção "establishment" (geralmente apenas um documento)
{
  "id": string, // ID único (geralmente "config" ou ID do estabelecimento)
  "name": string, // Nome do estabelecimento
  "description": string, // Descrição do estabelecimento
  "logo": string, // URL do logo
  "coverImage": string, // URL da imagem de capa
  "colors": {
    "primary": string, // Cor primária (ex: "#FF9800")
    "secondary": string, // Cor secundária (ex: "#4CAF50")
    "accent": string // Cor de destaque (ex: "#F44336")
  },
  "contact": {
    "phone": string,
    "email": string,
    "website": string,
    "socialMedia": {
      "facebook": string,
      "instagram": string,
      "twitter": string
    }
  },
  "address": {
    "street": string,
    "number": string,
    "neighborhood": string,
    "city": string,
    "state": string,
    "zipCode": string,
    "coordinates": {
      "latitude": number,
      "longitude": number
    }
  },
  "businessHours": [
    {
      "day": number, // 0 (domingo) a 6 (sábado)
      "open": boolean, // Se está aberto neste dia
      "openTime": string, // Horário de abertura (ex: "08:00")
      "closeTime": string // Horário de fechamento (ex: "22:00")
    }
  ],
  "delivery": {
    "available": boolean,
    "minimumOrderValue": number,
    "deliveryFee": number,
    "estimatedTimeMin": number,
    "estimatedTimeMax": number,
    "radius": number // Raio de entrega em km
  },
  "settings": {
    "allowReservations": boolean,
    "requireLoginForOrdering": boolean,
    "autoAcceptOrders": boolean,
    "taxRate": number
  }
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Segurança do Firestore</CardTitle>
              <CardDescription>
                Exemplo de regras de segurança para o banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Code className="text-sm">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função para verificar se o usuário é admin
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Função para verificar se o usuário é funcionário
    function isStaff() {
      return isAuthenticated() && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'cashier' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'waiter' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'kitchen');
    }
    
    // Regras para usuários
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }
    
    // Regras para mesas
    match /tables/{tableId} {
      allow read: if isAuthenticated();
      allow write: if isStaff();
    }
    
    // Regras para categorias
    match /categories/{categoryId} {
      allow read: if true; // Público para leitura
      allow write: if isAdmin(); // Somente admin pode modificar
    }
    
    // Regras para produtos
    match /products/{productId} {
      allow read: if true; // Público para leitura
      allow write: if isAdmin(); // Somente admin pode modificar
    }
    
    // Regras para pedidos
    match /orders/{orderId} {
      allow read: if isAuthenticated() && (
        isStaff() || 
        request.auth.uid == resource.data.userId
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        isStaff() || 
        (request.auth.uid == resource.data.userId && 
         resource.data.status == "pending")
      );
      allow delete: if isAdmin();
    }
    
    // Regras para configurações do estabelecimento
    match /establishment/{configId} {
      allow read: if true; // Público para leitura
      allow write: if isAdmin(); // Somente admin pode modificar
    }
  }
}`}
                </Code>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="config">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Firebase</CardTitle>
                <CardDescription>
                  Exemplo de como inicializar o Firebase no projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Code className="text-sm">
{`// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-messaging-sender-id",
  appId: "seu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;`}
                  </Code>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Instruções de Uso</CardTitle>
                <CardDescription>
                  Como configurar e usar o Firebase no projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">1. Criar projeto no Firebase</h3>
                    <p className="text-muted-foreground">
                      Acesse o console do Firebase (firebase.google.com) e crie um novo projeto.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">2. Ativar serviços necessários</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Authentication (Email/Senha e Google)</li>
                      <li>Firestore Database</li>
                      <li>Storage</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">3. Adicionar aplicativo web</h3>
                    <p className="text-muted-foreground">
                      Registre um aplicativo web no seu projeto Firebase e obtenha as credenciais de configuração.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">4. Configurar o arquivo firebase.ts</h3>
                    <p className="text-muted-foreground">
                      Substitua as credenciais de exemplo no arquivo firebase.ts pelas suas credenciais reais.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">5. Configurar regras de segurança</h3>
                    <p className="text-muted-foreground">
                      Aplique as regras de segurança sugeridas ao seu Firestore Database e Storage.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">6. Criar coleções</h3>
                    <p className="text-muted-foreground">
                      Inicialize as coleções conforme as estruturas documentadas nesta página.
                    </p>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-medium">Recursos Úteis</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>Documentação do Firebase: <a href="https://firebase.google.com/docs" target="_blank" rel="noopener noreferrer" className="text-primary">firebase.google.com/docs</a></li>
                      <li>Guia do Firestore: <a href="https://firebase.google.com/docs/firestore" target="_blank" rel="noopener noreferrer" className="text-primary">firebase.google.com/docs/firestore</a></li>
                      <li>Autenticação Firebase: <a href="https://firebase.google.com/docs/auth" target="_blank" rel="noopener noreferrer" className="text-primary">firebase.google.com/docs/auth</a></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FirebaseSetupPage;
