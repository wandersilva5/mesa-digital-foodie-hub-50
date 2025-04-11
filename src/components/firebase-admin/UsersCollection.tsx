
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
import { PlusCircle, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/contexts/UserContext";

interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  isGoogleUser?: boolean;
}

const UsersCollection: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "waiter",
  });
  const [isNewUser, setIsNewUser] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        // Ignorar usuários marcados como "deleted"
        const userData = doc.data();
        if (!userData.deleted) {
          usersList.push({ id: doc.id, ...userData } as User);
        }
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "waiter",
    });
    setIsNewUser(true);
    setEditingUserId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isNewUser) {
        // Gerar um novo ID para usuário
        const newUserId = `user_${Date.now()}`;
        const newUser: User = {
          id: newUserId,
          name: formData.name!,
          email: formData.email,
          role: formData.role!,
        };
        
        // Salvar no Firestore
        await setDoc(doc(db, "users", newUserId), newUser);
        
        setUsers(prev => [...prev, newUser]);
        toast({
          title: "Sucesso",
          description: "Usuário adicionado com sucesso",
        });
      } else if (editingUserId) {
        // Atualizar usuário existente
        const updatedData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        
        await setDoc(doc(db, "users", editingUserId), updatedData, { merge: true });
        
        setUsers(prev => 
          prev.map(user => 
            user.id === editingUserId ? { ...user, ...updatedData } : user
          )
        );
        
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsNewUser(false);
    setEditingUserId(user.id);
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    try {
      // Marcar como deletado em vez de excluir permanentemente
      await setDoc(doc(db, "users", userId), { deleted: true }, { merge: true });
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const translateRole = (role: UserRole | null): string => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "waiter":
        return "Garçom";
      case "kitchen":
        return "Cozinha";
      case "cashier":
        return "Caixa";
      case "customer":
        return "Cliente";
      default:
        return "Desconhecido";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerencie os usuários do sistema</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers}
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
                  <span className="hidden sm:inline">Novo Usuário</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isNewUser ? "Adicionar Usuário" : "Editar Usuário"}</DialogTitle>
                  <DialogDescription>
                    {isNewUser 
                      ? "Preencha os detalhes para adicionar um novo usuário." 
                      : "Atualize as informações do usuário."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      placeholder="Nome do usuário"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select 
                      value={formData.role || ""} 
                      onValueChange={(value) => handleRoleChange(value as UserRole)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="waiter">Garçom</SelectItem>
                        <SelectItem value="cashier">Caixa</SelectItem>
                        <SelectItem value="kitchen">Cozinha</SelectItem>
                        <SelectItem value="customer">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
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
                      {isNewUser ? "Adicionar" : "Atualizar"}
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
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    <span className="text-sm text-muted-foreground">Carregando...</span>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userItem) => (
                  <TableRow key={userItem.id}>
                    <TableCell className="font-medium">{userItem.name}</TableCell>
                    <TableCell>{userItem.email || "Não informado"}</TableCell>
                    <TableCell>{translateRole(userItem.role)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditUser(userItem)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Usuário</DialogTitle>
                              <DialogDescription>
                                Atualize as informações do usuário.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Nome</Label>
                                <Input
                                  id="edit-name"
                                  name="name"
                                  value={formData.name || ""}
                                  onChange={handleInputChange}
                                  placeholder="Nome do usuário"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  name="email"
                                  type="email"
                                  value={formData.email || ""}
                                  onChange={handleInputChange}
                                  placeholder="email@exemplo.com"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-role">Função</Label>
                                <Select 
                                  value={formData.role || ""} 
                                  onValueChange={(value) => handleRoleChange(value as UserRole)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma função" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="waiter">Garçom</SelectItem>
                                    <SelectItem value="cashier">Caixa</SelectItem>
                                    <SelectItem value="kitchen">Cozinha</SelectItem>
                                    <SelectItem value="customer">Cliente</SelectItem>
                                  </SelectContent>
                                </Select>
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
                              <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => handleDeleteUser(userItem.id)}
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

export default UsersCollection;
