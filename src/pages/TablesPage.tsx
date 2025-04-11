
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Eye, Plus, QrCode, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  currentOrderId?: string | null;
  lastOrderTimestamp?: any;
}

const TablesPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [tables, setTables] = useState<Table[]>([]);
  const [newTable, setNewTable] = useState({ number: "", capacity: "" });
  const [selectedTable, setSelectedTable] = useState<null | string>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = user?.role === "admin";
  
  useEffect(() => {
    const tablesRef = collection(db, "tables");
    const unsubscribe = onSnapshot(tablesRef, (snapshot) => {
      const tablesList: Table[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Record<string, any>;
        tablesList.push({ 
          id: doc.id, 
          number: data.number,
          capacity: data.capacity,
          status: data.status,
          currentOrderId: data.currentOrderId,
          lastOrderTimestamp: data.lastOrderTimestamp
        });
      });
      
      // Sort tables by number
      tablesList.sort((a, b) => a.number - b.number);
      
      setTables(tablesList);
      setLoading(false);
    }, (error) => {
      console.error("Error getting tables:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mesas",
        variant: "destructive",
      });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleAddTable = async () => {
    if (!newTable.number || !newTable.capacity) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    const tableNumber = parseInt(newTable.number);
    const capacity = parseInt(newTable.capacity);
    
    // Check if table number already exists
    const existingTable = tables.find(table => table.number === tableNumber);
    if (existingTable) {
      toast({
        title: "Erro",
        description: "Número de mesa já existe",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Add new table to Firestore
      const tablesRef = collection(db, "tables");
      await addDoc(tablesRef, {
        number: tableNumber,
        capacity: capacity,
        status: "available",
        currentOrderId: null,
        lastOrderTimestamp: null
      });
      
      setNewTable({ number: "", capacity: "" });
      
      toast({
        title: "Sucesso",
        description: `Mesa ${tableNumber} foi adicionada`,
      });
    } catch (error) {
      console.error("Error adding table:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a mesa",
        variant: "destructive",
      });
    }
  };
  
  const handleViewQr = (tableId: string) => {
    setSelectedTable(tableId);
    setIsQrDialogOpen(true);
  };
  
  const handleDeleteTable = async (tableId: string) => {
    try {
      // Get the table to check its status
      const tableRef = doc(db, "tables", tableId);
      const tableSnap = await getDoc(tableRef);
      
      if (tableSnap.exists()) {
        const tableData = tableSnap.data() as Table;
        
        // Only allow deletion if table is available
        if (tableData.status === "occupied") {
          toast({
            title: "Erro",
            description: "Não é possível excluir uma mesa ocupada",
            variant: "destructive",
          });
          return;
        }
        
        // Delete the table
        await deleteDoc(tableRef);
        
        toast({
          title: "Sucesso",
          description: "Mesa foi excluída",
        });
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mesa",
        variant: "destructive",
      });
    }
  };
  
  const TableItem = ({ table }: { table: Table }) => {
    const [activeOrders, setActiveOrders] = useState(0);
    
    useEffect(() => {
      if (table.status === "occupied" && table.currentOrderId) {
        // Count active orders for this table
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef, 
          where("tableId", "==", table.id),
          where("status", "in", ["pending", "preparing", "ready"])
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setActiveOrders(snapshot.size);
        });
        
        return () => unsubscribe();
      }
    }, [table.id, table.status, table.currentOrderId]);
    
    return (
      <Card className={`${table.status === 'occupied' ? "border-l-4 border-l-primary" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
          <CardDescription>
            {table.capacity} Lugares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={
                table.status === 'occupied' 
                  ? "text-primary font-medium" 
                  : table.status === 'reserved'
                    ? "text-yellow-500"
                    : "text-green-500"
              }>
                {table.status === 'occupied' 
                  ? "Ocupada" 
                  : table.status === 'reserved'
                    ? "Reservada"
                    : "Disponível"}
              </span>
            </div>
            {table.status === "occupied" && (
              <div className="flex justify-between">
                <span>Pedidos Ativos:</span>
                <span>{activeOrders}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => handleViewQr(table.id)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Código QR
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => handleDeleteTable(table.id)}
              disabled={table.status === "occupied"}
            >
              <Trash className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Mesas</h1>
          <p className="text-muted-foreground">Gerencie as mesas do seu restaurante e códigos QR</p>
        </div>
        
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Mesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Mesa</DialogTitle>
                <DialogDescription>
                  Adicione uma nova mesa à configuração do seu restaurante.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Número da Mesa</Label>
                  <Input
                    id="tableNumber"
                    placeholder="ex: 7"
                    type="number"
                    value={newTable.number}
                    onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade de Lugares</Label>
                  <Input
                    id="capacity"
                    placeholder="ex: 4"
                    type="number"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTable}>Adicionar Mesa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas as Mesas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
          <TabsTrigger value="occupied">Ocupadas</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tables.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tables.map(table => (
                <TableItem key={table.id} table={table} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma mesa encontrada. Adicione uma mesa para começar.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tables.filter(table => table.status === "available").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tables.filter(table => table.status === "available").map(table => (
                <TableItem key={table.id} table={table} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma mesa disponível no momento.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="occupied" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tables.filter(table => table.status === "occupied").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tables.filter(table => table.status === "occupied").map(table => (
                <TableItem key={table.id} table={table} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma mesa ocupada no momento.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Dialog do Código QR */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Código QR da Mesa {tables.find(t => t.id === selectedTable)?.number}</DialogTitle>
            <DialogDescription>
              Imprima este código QR e coloque-o na mesa para os clientes escanearem.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-muted-foreground">
                <QrCode size={160} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline">Baixar</Button>
            <Button>Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TablesPage;
