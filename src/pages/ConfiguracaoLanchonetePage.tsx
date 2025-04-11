import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ColorPicker } from "@/components/configuracao/ColorPicker";
import { useEstabelecimentoConfig } from "@/hooks/useEstabelecimentoConfig";
import { SaveIcon, ImageIcon, PaletteIcon, SettingsIcon, InfoIcon, Loader2 } from "lucide-react";

const ConfiguracaoLanchonetePage = () => {
  const { toast } = useToast();
  const { config, updateConfig, saveConfig, uploadLogo, loading } = useEstabelecimentoConfig();
  
  const [formState, setFormState] = useState({
    nome: "",
    slogan: "",
    logoUrl: "",
    corPrimaria: "#10b981",
    corSecundaria: "#3b82f6",
    corAcento: "#8b5cf6",
    endereco: "",
    telefone: "",
    horarioFuncionamento: "",
    exibirTaxaServico: true,
    valorTaxaServico: "10",
    permitirReservas: true,
    tempoEstimadoEntrega: "30-45",
    raioEntrega: "5"
  });

  useEffect(() => {
    if (config) {
      setFormState({
        nome: config.nome || "",
        slogan: config.slogan || "",
        logoUrl: config.logoUrl || "",
        corPrimaria: config.corPrimaria || "#10b981",
        corSecundaria: config.corSecundaria || "#3b82f6",
        corAcento: config.corAcento || "#8b5cf6",
        endereco: config.endereco || "",
        telefone: config.telefone || "",
        horarioFuncionamento: config.horarioFuncionamento || "",
        exibirTaxaServico: config.exibirTaxaServico !== undefined ? config.exibirTaxaServico : true,
        valorTaxaServico: config.valorTaxaServico || "10",
        permitirReservas: config.permitirReservas !== undefined ? config.permitirReservas : true,
        tempoEstimadoEntrega: config.tempoEstimadoEntrega || "30-45",
        raioEntrega: config.raioEntrega || "5"
      });
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const handleColorChange = (cor: string, tipo: 'corPrimaria' | 'corSecundaria' | 'corAcento') => {
    setFormState(prev => ({ ...prev, [tipo]: cor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formState);
    await saveConfig();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadLogo(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuração da Lanchonete</h1>
        <p className="text-muted-foreground">Personalize seu estabelecimento com cores, logo e informações.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="informacoes" className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
            <TabsTrigger value="informacoes" className="data-[state=active]:border-primary data-[state=active]:bg-primary/10">
              <InfoIcon className="h-4 w-4 mr-2" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="visual" className="data-[state=active]:border-primary data-[state=active]:bg-primary/10">
              <PaletteIcon className="h-4 w-4 mr-2" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="funcionamento" className="data-[state=active]:border-primary data-[state=active]:bg-primary/10">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Funcionamento
            </TabsTrigger>
            <TabsTrigger value="previa" className="data-[state=active]:border-primary data-[state=active]:bg-primary/10">
              <ImageIcon className="h-4 w-4 mr-2" />
              Prévia
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="informacoes">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Configure as informações básicas do seu estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Lanchonete</Label>
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
                    placeholder="Ex: O melhor hambúrguer da cidade!"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input 
                    id="endereco" 
                    name="endereco" 
                    value={formState.endereco} 
                    onChange={handleChange} 
                    placeholder="Ex: Avenida Brasil, 123 - Centro"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      name="telefone" 
                      value={formState.telefone} 
                      onChange={handleChange} 
                      placeholder="Ex: (11) 98765-4321"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horarioFuncionamento">Horário de Funcionamento</Label>
                    <Input 
                      id="horarioFuncionamento" 
                      name="horarioFuncionamento" 
                      value={formState.horarioFuncionamento} 
                      onChange={handleChange} 
                      placeholder="Ex: Seg-Dom 10h às 22h"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logotipo</Label>
                  <div className="flex items-center gap-4">
                    {formState.logoUrl && (
                      <div className="w-20 h-20 rounded-md border overflow-hidden">
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
                  Escolha as cores que representam seu estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cor principal do seu estabelecimento, usada em botões e destaques.
                  </p>
                  <ColorPicker 
                    color={formState.corPrimaria} 
                    onChange={(cor) => handleColorChange(cor, 'corPrimaria')} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cor complementar, usada em elementos secundários da interface.
                  </p>
                  <ColorPicker 
                    color={formState.corSecundaria} 
                    onChange={(cor) => handleColorChange(cor, 'corSecundaria')} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Cor de Destaque</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cor usada para chamar atenção a elementos importantes.
                  </p>
                  <ColorPicker 
                    color={formState.corAcento} 
                    onChange={(cor) => handleColorChange(cor, 'corAcento')} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="funcionamento">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Funcionamento</CardTitle>
                <CardDescription>
                  Personalize como sua lanchonete opera no sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="taxaServico">Exibir Taxa de Serviço</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar taxa de serviço nos pedidos e mesas
                    </p>
                  </div>
                  <Switch
                    id="exibirTaxaServico"
                    checked={formState.exibirTaxaServico}
                    onCheckedChange={(checked) => 
                      handleSwitchChange('exibirTaxaServico', checked)
                    }
                  />
                </div>
                
                {formState.exibirTaxaServico && (
                  <div className="space-y-2 pl-6 border-l-2 border-muted">
                    <Label htmlFor="valorTaxaServico">Valor da Taxa de Serviço (%)</Label>
                    <Input
                      id="valorTaxaServico"
                      name="valorTaxaServico"
                      value={formState.valorTaxaServico}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permitirReservas">Permitir Reservas</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar sistema de reservas de mesas
                    </p>
                  </div>
                  <Switch
                    id="permitirReservas"
                    checked={formState.permitirReservas}
                    onCheckedChange={(checked) => 
                      handleSwitchChange('permitirReservas', checked)
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="tempoEstimadoEntrega">Tempo Estimado de Entrega (minutos)</Label>
                  <Input
                    id="tempoEstimadoEntrega"
                    name="tempoEstimadoEntrega"
                    value={formState.tempoEstimadoEntrega}
                    onChange={handleChange}
                    placeholder="Ex: 30-45"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="raioEntrega">Raio de Entrega (km)</Label>
                  <Input
                    id="raioEntrega"
                    name="raioEntrega"
                    value={formState.raioEntrega}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Ex: 5"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="previa">
            <Card>
              <CardHeader>
                <CardTitle>Prévia da Configuração</CardTitle>
                <CardDescription>
                  Veja como ficará a aparência do seu estabelecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div 
                    className="rounded-lg shadow-md overflow-hidden"
                    style={{ 
                      backgroundColor: formState.corPrimaria || "#FF9800"
                    }}
                  >
                    <div className="p-6 text-white">
                      <div className="flex items-center gap-4">
                        {formState.logoUrl && (
                          <img 
                            src={formState.logoUrl} 
                            alt="Logo" 
                            className="w-16 h-16 object-contain bg-white p-1 rounded-md"
                          />
                        )}
                        <div>
                          <h2 className="text-2xl font-bold">{formState.nome || "Nome da Lanchonete"}</h2>
                          <p className="text-sm opacity-90">{formState.slogan || "Seu slogan aqui"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4">
                      <div className="flex flex-wrap gap-2">
                        <div className="text-sm flex items-center gap-1">
                          <span className="font-medium">Endereço:</span>
                          <span>{formState.endereco || "Não informado"}</span>
                        </div>
                        <div className="text-sm flex items-center gap-1 ml-auto">
                          <span className="font-medium">Horário:</span>
                          <span>{formState.horarioFuncionamento || "Não informado"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border rounded-lg space-y-4">
                    <h3 className="font-medium mb-2">Elementos de Interface</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        className="w-full"
                        style={{ 
                          backgroundColor: formState.corPrimaria || "#FF9800",
                          color: "#ffffff"
                        }}
                      >
                        Botão Primário
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        style={{ 
                          borderColor: formState.corSecundaria || "#4CAF50",
                          color: formState.corSecundaria || "#4CAF50"
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
                        Botão Destaque
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Card>
                        <CardHeader
                          style={{ 
                            borderBottom: `2px solid ${formState.corPrimaria || "#FF9800"}`
                          }}
                        >
                          <CardTitle className="text-base">Exemplo de Card</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-sm">Este é um exemplo de como os cards vão aparecer no sistema.</p>
                        </CardContent>
                      </Card>
                      
                      <div className="border rounded-md p-4">
                        <div className="space-y-2">
                          <div className="font-medium">Produto exemplo</div>
                          <p className="text-sm text-muted-foreground">Descrição do produto exemplo</p>
                          <div className="flex justify-between items-center">
                            <div className="font-bold" style={{ color: formState.corPrimaria || "#FF9800" }}>
                              R$ 19,90
                            </div>
                            <Button 
                              size="sm"
                              style={{ 
                                backgroundColor: formState.corSecundaria || "#4CAF50",
                                color: "#ffffff"
                              }}
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConfiguracaoLanchonetePage;
