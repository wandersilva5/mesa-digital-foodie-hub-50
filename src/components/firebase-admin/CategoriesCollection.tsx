import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  order: number;
}

const CategoriesCollection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
    active: true,
    order: 0
  });
  const [isNewCategory, setIsNewCategory] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesCollection = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList: Category[] = [];
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        categoriesList.push({
          id: Number(doc.id),
          name: data.name,
          description: data.description,
          active: data.active,
          order: data.order
        });
      });
      
      setCategories(categoriesList);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getNextId = async (): Promise<number> => {
    try {
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("id", "desc"), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return 1;
      
      const lastCategory = snapshot.docs[0].data();
      return (lastCategory.id || 0) + 1;
    } catch (error) {
      console.error("Error getting next ID:", error);
      return Date.now(); // Fallback
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      active: true,
      order: 0
    });
    setIsNewCategory(true);
    setEditingCategoryId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "O nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isNewCategory) {
        const nextId = await getNextId();
        const newCategory: Category = {
          id: nextId,
          name: formData.name,
          description: formData.description,
          active: formData.active ?? true,
          order: nextId
        };
        
        await setDoc(doc(db, "categories", nextId.toString()), newCategory);
        setCategories(prev => [...prev, newCategory]);
        
        toast({
          title: "Sucesso",
          description: "Categoria adicionada com sucesso",
        });
      } else if (editingCategoryId) {
        const updatedData = {
          name: formData.name,
          description: formData.description,
          active: formData.active
        };
        
        await setDoc(doc(db, "categories", editingCategoryId.toString()), updatedData, { merge: true });
        
        setCategories(prev => 
          prev.map(category => 
            category.id === Number(editingCategoryId) ? { ...category, ...updatedData } : category
          )
        );
        
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      active: category.active,
      order: category.order
    });
    setIsNewCategory(false);
    setEditingCategoryId(category.id);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "categories", categoryId.toString()));
      
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Gerencie as categorias de produtos</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCategories}
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
                  <span className="hidden sm:inline">Nova Categoria</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isNewCategory ? "Adicionar Categoria" : "Editar Categoria"}</DialogTitle>
                  <DialogDescription>
                    {isNewCategory 
                      ? "Preencha os detalhes para adicionar uma nova categoria." 
                      : "Atualize as informações da categoria."}
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
                      placeholder="Nome da categoria"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      placeholder="Descrição da categoria"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isNewCategory ? "Adicionar" : "Atualizar"}
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
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
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
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || "—"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {category.active ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Categoria</DialogTitle>
                              <DialogDescription>
                                Atualize as informações da categoria.
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
                                  placeholder="Nome da categoria"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Descrição</Label>
                                <Input
                                  id="edit-description"
                                  name="description"
                                  value={formData.description || ""}
                                  onChange={handleInputChange}
                                  placeholder="Descrição da categoria"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button 
                                  onClick={handleSubmit} 
                                  disabled={loading}
                                >
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
                              <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e pode afetar produtos vinculados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => handleDeleteCategory(category.id)}
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

export default CategoriesCollection;
