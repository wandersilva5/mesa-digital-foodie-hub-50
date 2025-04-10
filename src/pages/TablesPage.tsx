
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Eye, Plus, QrCode, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";

// Mock initial tables data
const initialTables = [
  { id: 1, number: 1, capacity: 4, occupied: true, orders: 2 },
  { id: 2, number: 2, capacity: 2, occupied: false, orders: 0 },
  { id: 3, number: 3, capacity: 6, occupied: true, orders: 1 },
  { id: 4, number: 4, capacity: 4, occupied: false, orders: 0 },
  { id: 5, number: 5, capacity: 8, occupied: true, orders: 3 },
  { id: 6, number: 6, capacity: 4, occupied: false, orders: 0 },
];

const TablesPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [tables, setTables] = useState(initialTables);
  const [newTable, setNewTable] = useState({ number: "", capacity: "" });
  const [selectedTable, setSelectedTable] = useState<null | number>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  const isAdmin = user?.role === "admin";
  
  const handleAddTable = () => {
    if (!newTable.number || !newTable.capacity) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    const tableNumber = parseInt(newTable.number);
    const capacity = parseInt(newTable.capacity);
    
    if (tables.some(table => table.number === tableNumber)) {
      toast({
        title: "Error",
        description: "Table number already exists",
        variant: "destructive",
      });
      return;
    }
    
    setTables([
      ...tables,
      { 
        id: Math.max(...tables.map(t => t.id), 0) + 1,
        number: tableNumber,
        capacity,
        occupied: false,
        orders: 0
      }
    ]);
    
    setNewTable({ number: "", capacity: "" });
    
    toast({
      title: "Success",
      description: `Table ${tableNumber} has been added`,
    });
  };
  
  const handleViewQr = (tableId: number) => {
    setSelectedTable(tableId);
    setIsQrDialogOpen(true);
  };
  
  const handleDeleteTable = (tableId: number) => {
    setTables(tables.filter(table => table.id !== tableId));
    toast({
      title: "Success",
      description: "Table has been deleted",
    });
  };
  
  const TableItem = ({ table }: { table: typeof tables[0] }) => {
    return (
      <Card className={`${table.occupied ? "border-l-4 border-l-primary" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Table {table.number}</CardTitle>
          <CardDescription>
            {table.capacity} Seats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={table.occupied ? "text-primary font-medium" : "text-green-500"}>
                {table.occupied ? "Occupied" : "Available"}
              </span>
            </div>
            {table.occupied && (
              <div className="flex justify-between">
                <span>Active Orders:</span>
                <span>{table.orders}</span>
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
            QR Code
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => handleDeleteTable(table.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
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
          <h1 className="text-2xl font-bold tracking-tight">Tables Management</h1>
          <p className="text-muted-foreground">Manage your restaurant tables and QR codes</p>
        </div>
        
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
                <DialogDescription>
                  Add a new table to your restaurant configuration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    placeholder="e.g. 7"
                    type="number"
                    value={newTable.number}
                    onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Seating Capacity</Label>
                  <Input
                    id="capacity"
                    placeholder="e.g. 4"
                    type="number"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTable}>Add Table</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tables</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="occupied">Occupied</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tables.map(table => (
              <TableItem key={table.id} table={table} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tables.filter(table => !table.occupied).map(table => (
              <TableItem key={table.id} table={table} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="occupied" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tables.filter(table => table.occupied).map(table => (
              <TableItem key={table.id} table={table} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table {tables.find(t => t.id === selectedTable)?.number} QR Code</DialogTitle>
            <DialogDescription>
              Print this QR code and place it on the table for customers to scan.
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
            <Button variant="outline">Download</Button>
            <Button>Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TablesPage;
