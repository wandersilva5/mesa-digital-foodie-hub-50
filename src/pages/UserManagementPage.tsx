
import React, { useState } from "react";
import { useUser, User, UserRole } from "@/contexts/UserContext";
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
import { useToast } from "@/components/ui/use-toast";
import { PencilIcon, Trash2Icon, PlusCircleIcon, SearchIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UserManagementPage = () => {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "waiter",
  });
  const [isNewUser, setIsNewUser] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Filtra usuários de acordo com o termo de busca
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (isNewUser) {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      
      addUser(newUser);
      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso",
      });
    } else if (editingUserId) {
      updateUser(editingUserId, formData);
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
    }
    
    resetForm();
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

  const handleDeleteUser = (userId: string) => {
    deleteUser(userId);
    toast({
      title: "Sucesso",
      description: "Usuário excluído com sucesso",
    });
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Novo Usuário
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
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleSubmit}>
                  {isNewUser ? "Adicionar" : "Atualizar"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="rounded-md border">
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
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((userItem) => (
                <TableRow key={userItem.id}>
                  <TableCell className="font-medium">{userItem.name}</TableCell>
                  <TableCell>{userItem.email || "Não informado"}</TableCell>
                  <TableCell>{translateRole(userItem.role)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditUser(userItem)}
                        >
                          <PencilIcon className="h-4 w-4" />
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
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button onClick={handleSubmit}>Atualizar</Button>
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
                          disabled={userItem.id === currentUser?.id}
                        >
                          <Trash2Icon className="h-4 w-4" />
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
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementPage;
