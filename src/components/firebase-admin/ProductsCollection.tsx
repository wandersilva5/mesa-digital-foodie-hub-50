
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Pencil, Trash2, Loader2, RefreshCw, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: string;
  active: boolean;
  ingredients?: string[];
  prepTime?: number;
  featured?: boolean;
}

const ProductsCollection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    categoryId: "",
    active: true,
    ingredients: [],
    prepTime: 15,
    featured: false,
  });
  const [isNewProduct, setIsNewProduct] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const { toast } = useToast();

  // Fetch products and categories data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories first
      const categoriesCollection = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList: Category[] = [];
      
      categoriesSnapshot.forEach((doc) => {
        categoriesList.push({ id: doc.id, name: doc.data().name } as Category);
      });
      
      setCategories(categoriesList);
      
      // Then fetch products
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const productsList: Product[] = [];
      
      productsSnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      setProducts(productsList);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle price as number
    if (name === "price" || name === "prepTime") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), ingredientInput.trim()]
      }));
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index)
    }));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: "",
      active: true,
      ingredients: [],
      prepTime: 15,
      featured: false,
    });
    setIsNewProduct(true);
    setEditingProductId(null);
    setImageFile(null);
    setImagePreview(null);
    setIngredientInput("");
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.price === undefined) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.imageUrl;
      
      if (imageFile) {
        const uploadedImageUrl = await uploadImage();
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }
      
      if (isNewProduct) {
        // Gerar um novo ID para produto
        const newProductId = `product_${Date.now()}`;
        const newProduct: Product = {
          id: newProductId,
          name: formData.name!,
          description: formData.description,
          price: formData.price!,
          imageUrl: imageUrl,
          categoryId: formData.categoryId,
          active: formData.active !== undefined ? formData.active : true,
          ingredients: formData.ingredients,
          prepTime: formData.prepTime,
          featured: formData.featured,
        };
        
        // Salvar no Firestore
        await setDoc(doc(db, "products", newProductId), newProduct);
        
        setProducts(prev => [...prev, newProduct]);
        toast({
          title: "Sucesso",
          description: "Produto adicionado com sucesso",
        });
      } else if (editingProductId) {
        // Atualizar produto existente
        const updatedData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          categoryId: formData.categoryId,
          active: formData.active,
          ingredients: formData.ingredients,
          prepTime: formData.prepTime,
          featured: formData.featured,
          ...(imageUrl && { imageUrl }),
        };
        
        await setDoc(doc(db, "products", editingProductId), updatedData, { merge: true });
        
        setProducts(prev => 
          prev.map(product => 
            product.id === editingProductId ? { ...product, ...updatedData, imageUrl } : product
          )
        );
        
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      active: product.active,
      ingredients: product.ingredients || [],
      prepTime: product.prepTime,
      featured: product.featured,
    });
    setIsNewProduct(false);
    setEditingProductId(product.id);
    setImagePreview(product.imageUrl || null);
  };

  const handleDeleteProduct = async (productId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      
      setProducts(prev => prev.filter(product => product.id !== productId));
      
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "Sem categoria";
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Categoria não encontrada";
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Gerencie os produtos do cardápio</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData}
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
                  <span className="hidden sm:inline">Novo Produto</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isNewProduct ? "Adicionar Produto" : "Editar Produto"}</DialogTitle>
                  <DialogDescription>
                    {isNewProduct 
                      ? "Preencha os detalhes para adicionar um novo produto." 
                      : "Atualize as informações do produto."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        placeholder="Nome do produto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price || ""}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      placeholder="Descrição do produto"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={formData.categoryId || ""} 
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sem categoria</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Imagem</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                    </div>
                    {(imagePreview || formData.imageUrl) && (
                      <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={imagePreview || formData.imageUrl} 
                          alt="Prévia da imagem" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ingredientes</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={ingredientInput}
                        onChange={e => setIngredientInput(e.target.value)}
                        placeholder="Adicionar ingrediente"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                      />
                      <Button type="button" onClick={handleAddIngredient} variant="outline">Adicionar</Button>
                    </div>
                    {formData.ingredients && formData.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.ingredients.map((ingredient, index) => (
                          <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="text-sm">{ingredient}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveIngredient(index)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prepTime">Tempo de Preparo (min)</Label>
                      <Input
                        id="prepTime"
                        name="prepTime"
                        type="number"
                        min="1"
                        value={formData.prepTime || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="active"
                          checked={formData.active || false}
                          onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                        />
                        <Label htmlFor="active">Produto Ativo</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="featured"
                          checked={formData.featured || false}
                          onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                        />
                        <Label htmlFor="featured">Produto em Destaque</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading || uploadingImage}
                    >
                      {(loading || uploadingImage) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isNewProduct ? "Adicionar" : "Atualizar"}
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
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {product.active ? "Ativo" : "Inativo"}
                        </span>
                        
                        {product.featured && (
                          <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                            Destaque
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Editar Produto</DialogTitle>
                              <DialogDescription>
                                Atualize as informações do produto.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nome</Label>
                                  <Input
                                    id="edit-name"
                                    name="name"
                                    value={formData.name || ""}
                                    onChange={handleInputChange}
                                    placeholder="Nome do produto"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-price">Preço (R$)</Label>
                                  <Input
                                    id="edit-price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price || ""}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Descrição</Label>
                                <Textarea
                                  id="edit-description"
                                  name="description"
                                  value={formData.description || ""}
                                  onChange={handleInputChange}
                                  placeholder="Descrição do produto"
                                  rows={3}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-category">Categoria</Label>
                                <Select 
                                  value={formData.categoryId || ""} 
                                  onValueChange={handleCategoryChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Sem categoria</SelectItem>
                                    {categories.map(category => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="edit-image">Imagem</Label>
                                <div className="flex items-center gap-4">
                                  <Input
                                    id="edit-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="flex-1"
                                  />
                                </div>
                                {(imagePreview || formData.imageUrl) && (
                                  <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                                    <img 
                                      src={imagePreview || formData.imageUrl} 
                                      alt="Prévia da imagem" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Ingredientes</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    value={ingredientInput}
                                    onChange={e => setIngredientInput(e.target.value)}
                                    placeholder="Adicionar ingrediente"
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                                  />
                                  <Button type="button" onClick={handleAddIngredient} variant="outline">Adicionar</Button>
                                </div>
                                {formData.ingredients && formData.ingredients.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.ingredients.map((ingredient, index) => (
                                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="text-sm">{ingredient}</span>
                                        <button 
                                          type="button" 
                                          onClick={() => handleRemoveIngredient(index)}
                                          className="text-gray-500 hover:text-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-prepTime">Tempo de Preparo (min)</Label>
                                  <Input
                                    id="edit-prepTime"
                                    name="prepTime"
                                    type="number"
                                    min="1"
                                    value={formData.prepTime || ""}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch 
                                      id="edit-active"
                                      checked={formData.active || false}
                                      onCheckedChange={(checked) => handleSwitchChange("active", checked)}
                                    />
                                    <Label htmlFor="edit-active">Produto Ativo</Label>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Switch 
                                      id="edit-featured"
                                      checked={formData.featured || false}
                                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                                    />
                                    <Label htmlFor="edit-featured">Produto em Destaque</Label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button 
                                  onClick={handleSubmit} 
                                  disabled={loading || uploadingImage}
                                >
                                  {(loading || uploadingImage) ? (
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
                              <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive text-destructive-foreground"
                                onClick={() => handleDeleteProduct(product.id)}
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

export default ProductsCollection;
