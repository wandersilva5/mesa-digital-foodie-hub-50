
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, writeBatch } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Database, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

// Collection types
interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  available: boolean;
  featured?: boolean;
  ingredients?: string[];
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qrCode?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  tableId?: string;
  customerId?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  type: 'dine-in' | 'takeaway' | 'delivery';
  createdAt: string;
  updatedAt: string;
}

const FirebaseSetupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    categories: boolean;
    products: boolean;
    tables: boolean;
    orders: boolean;
  }>({
    categories: false,
    products: false,
    tables: false,
    orders: false,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sample data for initialization
  const sampleCategories: Category[] = [
    {
      id: 'cat_bebidas',
      name: 'Bebidas',
      description: 'Refrigerantes, sucos, cervejas e drinks',
      order: 1,
    },
    {
      id: 'cat_lanches',
      name: 'Lanches',
      description: 'Hambúrgueres, sanduíches e porções',
      order: 2,
    },
    {
      id: 'cat_sobremesas',
      name: 'Sobremesas',
      description: 'Doces, sorvetes e sobremesas',
      order: 3,
    },
    {
      id: 'cat_pratos',
      name: 'Pratos',
      description: 'Pratos executivos e refeições completas',
      order: 4,
    }
  ];

  const sampleProducts: Product[] = [
    {
      id: 'prod_1',
      name: 'Hambúrguer Clássico',
      description: 'Pão, hambúrguer, queijo, alface, tomate e molho especial',
      price: 25.90,
      categoryId: 'cat_lanches',
      available: true,
      featured: true,
      ingredients: ['Pão', 'Hambúrguer', 'Queijo', 'Alface', 'Tomate', 'Molho especial']
    },
    {
      id: 'prod_2',
      name: 'Refrigerante Cola',
      description: 'Refrigerante sabor cola 350ml',
      price: 6.90,
      categoryId: 'cat_bebidas',
      available: true,
    },
    {
      id: 'prod_3',
      name: 'Suco de Laranja',
      description: 'Suco natural de laranja 300ml',
      price: 8.90,
      categoryId: 'cat_bebidas',
      available: true,
    },
    {
      id: 'prod_4',
      name: 'Pudim',
      description: 'Pudim de leite condensado',
      price: 12.90,
      categoryId: 'cat_sobremesas',
      available: true,
    },
    {
      id: 'prod_5',
      name: 'Filé com fritas',
      description: 'Filé mignon grelhado com batatas fritas',
      price: 42.90,
      categoryId: 'cat_pratos',
      available: true,
      featured: true,
      ingredients: ['Filé mignon', 'Batata frita', 'Sal', 'Azeite']
    },
  ];

  const sampleTables: Table[] = [
    {
      id: 'table_1',
      number: 1,
      capacity: 4,
      status: 'available',
    },
    {
      id: 'table_2',
      number: 2,
      capacity: 2,
      status: 'available',
    },
    {
      id: 'table_3',
      number: 3,
      capacity: 6,
      status: 'available',
    },
    {
      id: 'table_4',
      number: 4,
      capacity: 4,
      status: 'available',
    },
  ];

  const sampleOrders: Order[] = [
    {
      id: 'order_1',
      tableId: 'table_1',
      items: [
        {
          productId: 'prod_1',
          quantity: 2,
          price: 25.90,
        },
        {
          productId: 'prod_2',
          quantity: 2,
          price: 6.90,
        }
      ],
      total: 65.60,
      status: 'completed',
      type: 'dine-in',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 86000000).toISOString(),
    },
    {
      id: 'order_2',
      customerId: 'admin1',
      items: [
        {
          productId: 'prod_5',
          quantity: 1,
          price: 42.90,
        },
        {
          productId: 'prod_3',
          quantity: 1,
          price: 8.90,
        }
      ],
      total: 51.80,
      status: 'pending',
      type: 'delivery',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const initializeCollection = async <T extends { id: string }>(
    collectionName: string,
    data: T[],
    statusKey: keyof typeof setupStatus
  ) => {
    try {
      // Check if collection already has data
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (snapshot.empty) {
        // Collection is empty, add sample data
        const batch = writeBatch(db);
        
        data.forEach((item) => {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, item);
        });
        
        await batch.commit();
        
        setSetupStatus(prev => ({
          ...prev,
          [statusKey]: true
        }));
        
        toast({
          title: "Sucesso",
          description: `Coleção ${collectionName} inicializada com sucesso`,
        });
      } else {
        // Collection already has data
        setSetupStatus(prev => ({
          ...prev,
          [statusKey]: true
        }));
        toast({
          title: "Informação",
          description: `Coleção ${collectionName} já possui dados`,
        });
      }
    } catch (err) {
      console.error(`Erro ao inicializar ${collectionName}:`, err);
      setError(`Erro ao inicializar ${collectionName}: ${(err as Error).message}`);
      toast({
        title: "Erro",
        description: `Falha ao inicializar ${collectionName}`,
        variant: "destructive",
      });
    }
  };

  const handleInitializeAll = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize all collections in sequence
      await initializeCollection('categories', sampleCategories, 'categories');
      await initializeCollection('products', sampleProducts, 'products');
      await initializeCollection('tables', sampleTables, 'tables');
      await initializeCollection('orders', sampleOrders, 'orders');
      
      toast({
        title: "Sucesso",
        description: "Banco de dados inicializado com sucesso",
      });
      
      // Navigate to admin page after successful initialization
      setTimeout(() => {
        navigate('/firebase-admin');
      }, 2000);
    } catch (err) {
      console.error("Erro ao inicializar banco de dados:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const allInitialized = Object.values(setupStatus).every(status => status);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Database className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold">Configuração do Banco de Dados</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inicialização do Firebase</CardTitle>
          <CardDescription>
            Configure o banco de dados do Firebase com estruturas iniciais para o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Categorias</span>
              {setupStatus.categories ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <span className="text-sm text-muted-foreground">Pendente</span>
              )}
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Produtos</span>
              {setupStatus.products ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <span className="text-sm text-muted-foreground">Pendente</span>
              )}
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Mesas</span>
              {setupStatus.tables ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <span className="text-sm text-muted-foreground">Pendente</span>
              )}
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Pedidos</span>
              {setupStatus.orders ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <span className="text-sm text-muted-foreground">Pendente</span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {allInitialized ? (
            <div className="w-full flex justify-between items-center">
              <span className="text-green-600 font-medium">
                Banco de dados inicializado com sucesso!
              </span>
              <Button
                onClick={() => navigate('/firebase-admin')}
              >
                Ir para Administração
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleInitializeAll}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inicializando...
                </>
              ) : (
                'Inicializar Banco de Dados'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FirebaseSetupPage;
