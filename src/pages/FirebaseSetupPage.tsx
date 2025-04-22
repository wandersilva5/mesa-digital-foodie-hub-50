
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "@/components/ui/code";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface CollectionStatus {
  [key: string]: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
}

const initializeCollection = async (
  collectionName: string,
  initialData: any,
  customId?: string
) => {
  try {
    console.log(`Iniciando criação da coleção ${collectionName}...`);
    console.log('Dados iniciais:', initialData);

    const docRef = customId
      ? doc(db, collectionName, customId)
      : doc(collection(db, collectionName));

    console.log('DocRef criado:', docRef.path);

    await setDoc(docRef, {
      ...initialData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`Coleção ${collectionName} criada com sucesso!`);
    console.log('ID do documento:', docRef.id);

    return true;
  } catch (error) {
    console.error(`Erro detalhado ao inicializar ${collectionName}:`, error);
    throw error;
  }
};

const FirebaseSetupPage = () => {

  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus>({
    tables: { loading: false, error: null, success: false },
    categories: { loading: false, error: null, success: false },
    products: { loading: false, error: null, success: false },
    users: { loading: false, error: null, success: false },
    configuracao: { loading: false, error: null, success: false }
  });

  const handleInitializeCollection = async (collection: string) => {
    setCollectionStatus(prev => ({
      ...prev,
      [collection]: { loading: true, error: null, success: false }
    }));

    try {
      switch (collection) {
        case 'tables':
          await initializeCollection('tables', {
            number: 1,
            capacity: 4,
            status: "available",
            location: "internal",
            active: true
          });
          break;

        case 'categories':
          await initializeCollection('categories', {
            name: "Categoria Exemplo",
            description: "Descrição da categoria exemplo",
            active: true,
            order: 1
          });
          break;

        case 'products':
          await initializeCollection('products', {
            name: "Produto Exemplo",
            description: "Descrição do produto exemplo",
            price: 0,
            active: true,
            ingredients: [],
            prepTime: 15,
            featured: false,
            stockManagement: false
          });
          break;

        case 'users':
          await initializeCollection('users', {
            name: "Admin",
            email: "admin@exemplo.com",
            role: "admin",
            active: true
          });
          break;

        case 'configuracao':
          await initializeCollection('configuracao', {
            nome: "Nome do Estabelecimento",
            slogan: "Seu slogan aqui",
            corPrimaria: "#10b981",
            corSecundaria: "#3b82f6",
            corAcento: "#8b5cf6",
            exibirTaxaServico: true,
            valorTaxaServico: "10",
            permitirReservas: true
          }, 'estabelecimento');
          break;
      }

      setCollectionStatus(prev => ({
        ...prev,
        [collection]: { loading: false, error: null, success: true }
      }));
    } catch (error) {
      setCollectionStatus(prev => ({
        ...prev,
        [collection]: {
          loading: false,
          error: (error as Error).message,
          success: false
        }
      }));
    }
  };

  // Adicione este componente de botão dentro de cada Card após o CardContent
  const InitializeButton = ({ collection }: { collection: string }) => (
    <div className="px-6 py-4 border-t">
      <Button
        onClick={() => handleInitializeCollection(collection)}
        disabled={collectionStatus[collection].loading}
        variant={collectionStatus[collection].success ? "outline" : "default"}
        className="w-full"
      >
        {collectionStatus[collection].loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {collectionStatus[collection].success
          ? "Coleção Inicializada ✓"
          : "Inicializar Coleção"}
      </Button>
      {collectionStatus[collection].error && (
        <p className="text-sm text-red-500 mt-2">
          Erro: {collectionStatus[collection].error}
        </p>
      )}
    </div>
  );

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
  "nutritionalInfo": object, // (Opcional) Informações nutricionais
  "stockManagement": boolean, // Se o produto tem gestão de estoque
  "stockQuantity": number, // Quantidade atual em estoque
  "stockReserved": number, // Quantidade reservada por pedidos pendentes
  "stockMinimum": number // Quantidade mínima de alerta
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
  "paymentStatus": string, // Status do pagamento: "pending", "paid", "refunded", "failed"
  "paymentId": string, // ID da transação de pagamento (se aplicável)
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

            {/* Estrutura da coleção de pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: payments</CardTitle>
                <CardDescription>
                  Transações de pagamento realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
                    {`// Estrutura da coleção "payments"
{
  "id": string, // ID único do pagamento (ex: "payment_1632456789")
  "orderId": string, // ID do pedido relacionado
  "userId": string, // ID do usuário que efetuou o pagamento (se aplicável)
  "staffId": string, // ID do funcionário que processou o pagamento (se aplicável)
  "method": string, // Método de pagamento: "cash", "credit", "debit", "pix", "app"
  "amount": number, // Valor pago
  "tip": number, // Valor da gorjeta (se aplicável)
  "taxes": number, // Valor de impostos/taxas (se aplicável)
  "serviceCharge": number, // Valor da taxa de serviço (se aplicável)
  "amountReceived": number, // Valor recebido (para pagamentos em dinheiro)
  "change": number, // Troco (para pagamentos em dinheiro)
  "status": string, // Status: "completed", "refunded", "canceled", "failed"
  "reference": string, // Referência externa (NSU, autorização, etc.)
  "notes": string, // Observações adicionais
  "createdAt": timestamp, // Data/hora da transação
  "updatedAt": timestamp // Data/hora da última atualização
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
              <InitializeButton collection="tables" />
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
              <InitializeButton collection="tables" />
            </Card>

            {/* Estrutura da configuração do estabelecimento */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: configuracao</CardTitle>
                <CardDescription>
                  Configurações do estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
                    {`// Estrutura da coleção "configuracao" (documento "estabelecimento")
{
  "nome": string, // Nome do estabelecimento
  "slogan": string, // Slogan ou descrição curta
  "logoUrl": string, // URL da imagem do logo
  "corPrimaria": string, // Cor primária (hex, ex: "#10b981")
  "corSecundaria": string, // Cor secundária (hex, ex: "#3b82f6")
  "corAcento": string, // Cor de destaque (hex, ex: "#8b5cf6")
  "cores": {
    "primary": string, // Cor primária (mantido para compatibilidade)
    "secondary": string, // Cor secundária (mantido para compatibilidade)
    "accent": string // Cor de destaque (mantido para compatibilidade)
  },
  "endereco": string, // Endereço completo
  "telefone": string, // Telefone de contato
  "horarioFuncionamento": string, // Horário de funcionamento (texto)
  "exibirTaxaServico": boolean, // Se deve exibir taxa de serviço
  "valorTaxaServico": string, // Valor da taxa de serviço (%)
  "permitirReservas": boolean, // Se permite reservas de mesa
  "tempoEstimadoEntrega": string, // Tempo estimado para entrega (ex: "30-45")
  "raioEntrega": string // Raio de entrega em km
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
              <InitializeButton collection="tables" />
            </Card>

            {/* Estrutura da coleção de movimentações de estoque */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: inventory_transactions</CardTitle>
                <CardDescription>
                  Movimentações de entrada e saída do estoque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
                    {`// Estrutura da coleção "inventory_transactions"
{
  "id": string, // ID único da transação
  "productId": string, // ID do produto
  "type": string, // Tipo: "in" (entrada), "out" (saída), "reserved" (reservado), "released" (liberado)
  "quantity": number, // Quantidade movimentada
  "orderId": string, // ID do pedido relacionado (se aplicável)
  "reason": string, // Motivo: "purchase", "sale", "adjustment", "return", "loss"
  "notes": string, // Observações adicionais
  "userId": string, // ID do usuário que realizou a movimentação
  "previousQuantity": number, // Quantidade em estoque antes da movimentação
  "newQuantity": number, // Quantidade em estoque após a movimentação
  "createdAt": timestamp // Data/hora da movimentação
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
              <InitializeButton collection="tables" />
            </Card>

            {/* Estrutura do registro de caixa */}
            <Card>
              <CardHeader>
                <CardTitle>Coleção: register_sessions</CardTitle>
                <CardDescription>
                  Sessões de abertura e fechamento de caixa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Code className="text-sm">
                    {`// Estrutura da coleção "register_sessions"
{
  "id": string, // ID único da sessão
  "userId": string, // ID do usuário/operador
  "status": string, // Status: "open", "closed"
  "openingAmount": number, // Valor inicial do caixa
  "expectedClosingAmount": number, // Valor esperado no fechamento (calculado)
  "actualClosingAmount": number, // Valor real contado no fechamento
  "difference": number, // Diferença entre esperado e real
  "openedAt": timestamp, // Data/hora de abertura
  "closedAt": timestamp, // Data/hora de fechamento
  "notes": string, // Observações adicionais
  "transactions": [
    {
      "paymentId": string, // ID do pagamento
      "orderId": string, // ID do pedido
      "method": string, // Método de pagamento
      "amount": number, // Valor da transação
      "timestamp": timestamp // Data/hora da transação
    }
  ] // Transações realizadas durante a sessão
}`}
                  </Code>
                </ScrollArea>
              </CardContent>
              <InitializeButton collection="tables" />
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
    
    // Regras para pagamentos
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && (
        isStaff() || 
        request.auth.uid == resource.data.userId
      );
      allow create, update: if isStaff();
      allow delete: if isAdmin();
    }
    
    // Regras para transações de estoque
    match /inventory_transactions/{transactionId} {
      allow read: if isStaff();
      allow write: if isStaff();
    }
    
    // Regras para sessões de caixa
    match /register_sessions/{sessionId} {
      allow read: if isStaff();
      allow write: if isStaff();
    }
    
    // Regras para configurações do estabelecimento
    match /configuracao/{configId} {
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
                <CardTitle>Inicialização de Dados</CardTitle>
                <CardDescription>
                  Código para inicializar as coleções no Firebase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <Code className="text-sm">
                    {`// Código para inicializar as coleções básicas
import { setDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

// Inicializar a configuração do estabelecimento
async function inicializarConfiguracao() {
  const configPadrao = {
    nome: "",
    slogan: "",
    logoUrl: "",
    corPrimaria: "#10b981",
    corSecundaria: "#3b82f6",
    corAcento: "#8b5cf6",
    cores: {
      primary: "#10b981",
      secondary: "#3b82f6",
      accent: "#8b5cf6",
    },
    endereco: "",
    telefone: "",
    horarioFuncionamento: "",
    exibirTaxaServico: true,
    valorTaxaServico: "10",
    permitirReservas: true,
    tempoEstimadoEntrega: "30-45",
    raioEntrega: "5"
  };

  try {
    // Criar o documento na coleção "configuracao" com ID "estabelecimento"
    await setDoc(doc(db, "configuracao", "estabelecimento"), configPadrao);
    console.log("Configuração do estabelecimento inicializada com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar configuração:", error);
  }
}

// Inicializar funções de gerenciamento de estoque
async function criarFuncoesEstoque() {
  // Estas funções devem ser implementadas na sua lógica de negócio
  
  // Exemplo de função para atualizar estoque
  const atualizarEstoque = async (produtoId, quantidade, tipo, motivo, orderId = null) => {
    // 1. Buscar produto atual
    // 2. Calcular nova quantidade baseada no tipo (in, out, reserved, released)
    // 3. Atualizar documento do produto
    // 4. Criar documento de transação de estoque
  };
  
  // Exemplo de função para reservar estoque quando um pedido é criado
  const reservarEstoque = async (orderId, itens) => {
    // Para cada item do pedido:
    // 1. Buscar produto
    // 2. Verificar se há estoque suficiente
    // 3. Atualizar campo stockReserved do produto
    // 4. Criar documento de transação tipo "reserved"
  };
  
  // Exemplo de função para liberar estoque reservado (pedido cancelado)
  const liberarReservaEstoque = async (orderId) => {
    // 1. Buscar pedido
    // 2. Para cada item, reverter a reserva
    // 3. Atualizar campos dos produtos
    // 4. Criar documentos de transação tipo "released"
  };
  
  // Exemplo de função para finalizar saída do estoque (pedido concluído)
  const finalizarSaidaEstoque = async (orderId) => {
    // 1. Buscar pedido
    // 2. Para cada item, converter reserva em saída definitiva
    // 3. Atualizar campos dos produtos (diminuir stockReserved e stockQuantity)
    // 4. Criar documentos de transação tipo "out"
  };
}

// Função para criar uma nova sessão de caixa
async function abrirSessaoCaixa(usuarioId, valorInicial, observacoes = "") {
  const novaSessao = {
    userId: usuarioId,
    status: "open",
    openingAmount: valorInicial,
    expectedClosingAmount: valorInicial,
    actualClosingAmount: 0,
    difference: 0,
    openedAt: new Date(),
    closedAt: null,
    notes: observacoes,
    transactions: []
  };
  
  try {
    const sessaoRef = doc(db, "register_sessions", \`session_\${Date.now()}\`);
    await setDoc(sessaoRef, novaSessao);
    console.log("Sessão de caixa aberta com sucesso!");
    return sessaoRef.id;
  } catch (error) {
    console.error("Erro ao abrir sessão de caixa:", error);
    throw error;
  }
}

// Função para fechar uma sessão de caixa
async function fecharSessaoCaixa(sessaoId, valorFinal, observacoes = "") {
  try {
    const sessaoRef = doc(db, "register_sessions", sessaoId);
    // Buscar dados atuais da sessão
    // Calcular diferença entre esperado e real
    // Atualizar documento com:
    // - status: "closed"
    // - actualClosingAmount: valorFinal
    // - difference: calculado
    // - closedAt: new Date()
    // - notes: observacoes adicionais
    
    console.log("Sessão de caixa fechada com sucesso!");
  } catch (error) {
    console.error("Erro ao fechar sessão de caixa:", error);
    throw error;
  }
}

// Chame estas funções conforme necessário para configurar seu banco de dados
// inicializarConfiguracao();
// criarFuncoesEstoque();`}
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
