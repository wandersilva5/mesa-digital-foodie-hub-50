
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorPicker } from "@/components/configuracao/ColorPicker";
import { useEstabelecimentoConfig } from "@/hooks/useEstabelecimentoConfig";

const ConfiguracaoPage = () => {
  const { toast } = useToast();
  const { config, updateConfig } = useEstabelecimentoConfig();
  
  const [formState, setFormState] = useState({
    nome: "",
    slogan: "",
    logoUrl: "",
    corPrimaria: "",
    corSecundaria: "",
    corAcento: ""
  });

  // Carrega as configurações atuais quando o componente é montado
  useEffect(() => {
    setFormState({
      nome: config.nome,
      slogan: config.slogan,
      logoUrl: config.logoUrl,
      corPrimaria: config.corPrimaria,
      corSecundaria: config.corSecundaria,
      corAcento: config.corAcento
    });
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (cor: string, tipo: 'corPrimaria' | 'corSecundaria' | 'corAcento') => {
    setFormState(prev => ({ ...prev, [tipo]: cor }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formState);
    
    toast({
      title: "Configurações salvas",
      description: "As alterações foram aplicadas com sucesso.",
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular upload de imagem com URL local
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormState(prev => ({ 
            ...prev, 
            logoUrl: event.target.result as string 
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações do Estabelecimento</h1>
      
      <Tabs defaultValue="geral">
        <TabsList className="mb-4">
          <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
          <TabsTrigger value="visual">Identidade Visual</TabsTrigger>
          <TabsTrigger value="previa">Prévia</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Estabelecimento</CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu estabelecimento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Estabelecimento</Label>
                  <Input 
                    id="nome" 
                    name="nome" 
                    value={formState.nome} 
                    onChange={handleChange} 
                    placeholder="Ex: Sabor Express"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Textarea 
                    id="slogan" 
                    name="slogan" 
                    value={formState.slogan} 
                    onChange={handleChange} 
                    placeholder="Ex: O melhor sabor da cidade!"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logotipo</Label>
                  <div className="flex items-center gap-4">
                    {formState.logoUrl && (
                      <div className="w-16 h-16 rounded border overflow-hidden">
                        <img 
                          src={formState.logoUrl} 
                          alt="Logo do estabelecimento" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <Input 
                      id="logo" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="visual">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>
                  Personalize as cores do seu estabelecimento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <ColorPicker 
                    color={formState.corPrimaria} 
                    onChange={(cor) => handleColorChange(cor, 'corPrimaria')} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <ColorPicker 
                    color={formState.corSecundaria} 
                    onChange={(cor) => handleColorChange(cor, 'corSecundaria')} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <ColorPicker 
                    color={formState.corAcento} 
                    onChange={(cor) => handleColorChange(cor, 'corAcento')} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="previa">
            <Card>
              <CardHeader>
                <CardTitle>Prévia das Configurações</CardTitle>
                <CardDescription>
                  Veja como ficará a aparência do seu sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="p-6 rounded-lg shadow-md" 
                  style={{ 
                    backgroundColor: formState.corPrimaria || "#FF9800",
                    color: "#ffffff"
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {formState.logoUrl && (
                      <img 
                        src={formState.logoUrl} 
                        alt="Logo" 
                        className="w-16 h-16 object-contain"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold">{formState.nome || "Nome do Estabelecimento"}</h2>
                      <p>{formState.slogan || "Slogan do estabelecimento"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: formState.corSecundaria || "#4CAF50",
                        color: "#ffffff"
                      }}
                    >
                      Botão Secundário
                    </Button>
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: formState.corAcento || "#F44336",
                        color: "#ffffff"
                      }}
                    >
                      Botão de Destaque
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="mt-6 flex justify-end">
            <Button type="submit">Salvar Configurações</Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};

export default ConfiguracaoPage;
