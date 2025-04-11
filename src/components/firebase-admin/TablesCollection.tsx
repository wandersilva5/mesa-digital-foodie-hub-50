
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TableData {
  id: string;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "unavailable";
  location?: string;
  active: boolean;
}

const TableStatus = {
  available: { label: "Disponível", class: "bg-green-100 text-green-800" },
  occupied: { label: "Ocupada", class: "bg-red-100 text-red-800" },
  reserved: { label: "Reservada", class: "bg-blue-100 text-blue-800" },
  unavailable: { label: "Indisponível", class: "bg-gray-100 text-gray-800" },
};

const TableLocations = [
  { value: "internal", label: "Área Interna" },
  { value: "external", label: "Área Externa" },
  { value: "balcony", label: "Sacada" },
  { value: "vip", label: "Área VIP" },
];

const TablesCollection: React.FC = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<TableData>>({
    number: 0,
    capacity: 4,
    status: "available",
    location: "internal",
    active: true,
  });
  const [isNewTable, setIsNewTable] = useState(true);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTables = async () => {
    setLoading(true);
    try {
      const tablesCollection = collection(db, "tables");
      const tablesSnapshot = await getDocs(tablesCollection);
      const tablesList: TableData[] = [];
      
      tablesSnapshot.forEach((doc) => {
        tablesList.push({ id: doc.id, ...doc.data() } as TableData);
      });
      
      // Ordenar mesas por número
      tablesList.sort((a, b) => a.number - b.number);
      
      setTables(tablesList);
    } catch (error) {
      console.error("Erro ao buscar mesas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mesas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "number" || name === "capacity") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleStatusChange = (status: "available" | "occupied" | "reserved" | "unavailable") => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleLocationChange = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
  };

  const resetForm = () => {
    setFormData({
      number: 0,
      capacity: 4,
      status: "available",
      location: "internal",
      active: true,
    });
    setIsNewTable(true);
    setEditingTableId(null);
  };

  const handleSubmit = async () => {
    if (formData.number === undefined || formData.capacity === undefined) {
      toast({
        title: "Erro",
        description: "Número e capacidade da mesa são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Verificar se já existe uma mesa com o mesmo número
    if (isNewTable || (editingTableId && tables.find(t => t.id === editingTableId)?.number !== formData.number)) {
      const existingTable = tables.find(t => t.number === formData.number);
      if (existingTable) {
        toast({
          title: "Erro",
          description: `Já existe uma mesa com o número ${formData.number}`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      if (isNewTable) {
        // Gerar um novo ID para mesa
        const newTableId = `table_${Date.now()}`;
        const newTable: TableData = {
          id: newTableId,
          number: formData.number!,
          capacity: formData.capacity!,
          status: formData.status || "available",
          location: formData.location,
          active: formData.active !== undefined ? formData.active : true,
        };
        
        // Salvar no Firestore
        await setDoc(doc(db, "tables", newTableId), newTable);
        
        // Adicionar à lista e ordenar
        const updatedTables = [...tables, newTable].sort((a, b) => a.number - b.number);
        setTables(updatedTables);
        
        toast({
          title: "Sucesso",
          description: "Mesa adicionada com sucesso",
        });
      } else if (editingTableId) {
        // Atualizar mesa existente
        const updatedData = {
          number: formData.number,
          capacity: formData.capacity,
          status: formData.status,
          location: formData.location,
          active: formData.active,
        };
        
        await setDoc(doc(db, "tables", editingTableId), updatedData, { merge: true });
        
        // Atualizar na lista e ordenar
        const updatedTables = tables.map(table => 
          table.id === editingTableId ? { ...table, ...updatedData } : table
        ).sort((a, b) => a.number - b.number);
        
        setTables(updatedTables);
        
        toast({
          title: "Sucesso",
          description: "Mesa atualizada com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar mesa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a mesa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleEditTable = (table: TableData) => {
    setFormData({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      location: table.location,
      active: table.active,
    });
    setIsNewTable(false);
    setEditingTableId(table.id);
  };

  const handleDeleteTable = async (tableId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "tables", tableId));
      
      setTables(prev => prev.filter(table => table.id !== tableId));
      
      toast({
        title: "Sucesso",
        description: "Mesa excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir mesa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a mesa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const translateLocation = (location?: string): string => {
    switch (location) {
      case "internal": return "Área Interna";
      case "external": return "Área Externa";
      case "balcony": return "Sacada";
      case "vip": return "Área VIP";
      default: return "Não definida";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Mesas</CardTitle>
            <CardDescription>Gerencie as mesas do estabelecimento</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTables}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Atualizar</span>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nova Mesa</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isNewTable ? "Adicionar Mesa" : "Editar Mesa"}</DialogTitle>
                  <DialogDescription>
                    {isNewTable 
                      ? "Preencha os detalhes para adicionar uma nova mesa." 
                      : "Atualize as informações da mesa."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number">Número da Mesa</Label>
                      <Input
                        id="number"
                        name="number"
                        type="number"
                        min="1"
                        value={formData.number || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacidade</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        value={formData.capacity || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status || "available"} 
                      onValueChange={(value) => handleStatusChange(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="occupied">Ocupada</SelectItem>
                        <SelectItem value="reserved">Reservada</SelectItem>
                        <SelectItem value="unavailable">Indisponível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Select 
                      value={formData.location || "internal"} 
                      onValueChange={handleLocationChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma localização" />
                      </SelectTrigger>
                      <SelectContent>
                        {TableLocations.map(location => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="active"
                      checked={formData.active || false}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="active">Mesa Ativa</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isNewTable ? "Adicionar" : "Atualizar"}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mesa</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Ativa</TableHead>
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
              ) : tables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhuma mesa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">Mesa {table.number}</TableCell>
                    <TableCell>{table.capacity} lugares</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${TableStatus[table.status].class}`}>
                        {TableStatus[table.status].label}
                      </span>
                    </TableCell>
                    <TableCell>{translateLocation(table.location)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        table.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {table.active ? "Sim" : "Não"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditTable(table)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Mesa</DialogTitle>
                              <DialogDescription>
                                Atualize as informações da mesa.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-number">Número da Mesa</Label>
                                  <Input
                                    id="edit-number"
                                    name="number"
                                    type="number"
                                    min="1"
                                    value={formData.number || ""}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-capacity">Capacidade</Label>
                                  <Input
                                    id="edit-capacity"
                                    name="capacity"
                                    type="number"
                                    min="1"
                                    value={formData.capacity || ""}
                                    onChange={handleInputChange}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select 
                                  value={formData.status || "available"} 
                                  onValueChange={(value) => handleStatusChange(value as any)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="available">Disponível</SelectItem>
                                    <SelectItem value="occupied">Ocupada</SelectItem>
                                    <SelectItem value="reserved">Reservada</SelectItem>
                                    <SelectItem value="unavailable">Indisponível</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-location">Localização</Label>
                                <Select 
                                  value={formData.location || "internal"} 
                                  onValueChange={handleLocationChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma localização" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TableLocations.map(location => (
                                      <SelectItem key={location.value} value={location.value}>
                                        {location.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id="edit-active"
                                  checked={formData.active || false}
                                  onCheckedChange={handleSwitchChange}
                                />
                                <Label htmlFor="edit-active">Mesa Ativa</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={handleSubmit} disabled={loading}>
                                  {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Atualizar
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Mesa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => handleDeleteTable(table.id)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default TablesCollection;
