
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { CreditCard, Banknote, Wallet, Receipt, Clock, QrCode, Check, Printer, Calculator } from "lucide-react";

// Dados fictícios de pedidos para fechamento
const checkoutOrders = [
  {
    id: 1,
    tableNumber: 5,
    customerName: "João Silva",
    items: [
      { name: "X-Burger Tradicional", quantity: 2, price: 18.90 },
      { name: "Batata Frita", quantity: 1, price: 12.90 },
      { name: "Refrigerante Lata", quantity: 2, price: 5.90 }
    ],
    status: "completed",
    createdAt: "2023-05-10T15:30:00",
    totalAmount: 62.50,
    paid: false
  },
  {
    id: 4,
    tableNumber: 8,
    customerName: "Ana Souza",
    items: [
      { name: "X-Salada", quantity: 1, price: 19.90 },
      { name: "Batata Frita", quantity: 1, price: 12.90 },
      { name: "Suco Natural", quantity: 1, price: 8.90 }
    ],
    status: "completed",
    createdAt: "2023-05-10T16:15:00",
    totalAmount: 41.70,
    paid: false
  },
  {
    id: 8,
    tableNumber: 3,
    customerName: "Roberto Almeida",
    items: [
      { name: "X-Bacon", quantity: 1, price: 22.90 },
      { name: "Onion Rings", quantity: 1, price: 14.90 },
      { name: "Refrigerante Lata", quantity: 1, price: 5.90 }
    ],
    status: "completed",
    createdAt: "2023-05-10T17:20:00",
    totalAmount: 43.70,
    paid: false
  }
];

// Dados de transações do dia
const dailyTransactions = [
  { id: 101, orderId: 7, amount: 56.80, method: "Cartão de Crédito", time: "14:30" },
  { id: 102, orderId: 5, amount: 37.50, method: "Pix", time: "15:15" },
  { id: 103, orderId: 2, amount: 82.40, method: "Dinheiro", time: "16:05" },
  { id: 104, orderId: 6, amount: 29.90, method: "Cartão de Débito", time: "16:45" }
];

const CheckoutPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedOrder, setSelectedOrder] = useState<null | typeof checkoutOrders[0]>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(true);
  const [registerSummary, setRegisterSummary] = useState({
    openingAmount: 200.00,
    cashSales: 82.40,
    cardSales: 86.70,
    pixSales: 37.50,
    totalSales: 206.60,
    expectedCash: 282.40, // abertura + vendas em dinheiro
    actualCash: 280.00, // valor que será contado no fim do dia
    difference: -2.40
  });
  
  const handleOpenPayment = (order: typeof checkoutOrders[0]) => {
    setSelectedOrder(order);
    setPaymentMethod("");
    setAmountReceived("");
    setIsPaymentDialogOpen(true);
  };
  
  const handleProcessPayment = () => {
    if (!selectedOrder || !paymentMethod) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um método de pagamento",
        variant: "destructive",
      });
      return;
    }
    
    // Para pagamento em dinheiro, verificar se o valor recebido é suficiente
    if (paymentMethod === "cash") {
      if (!amountReceived || parseFloat(amountReceived) < selectedOrder.totalAmount) {
        toast({
          title: "Erro",
          description: "O valor recebido é menor que o total do pedido",
          variant: "destructive",
        });
        return;
      }
    }
    
    toast({
      title: "Pagamento Processado",
      description: `Pedido #${selectedOrder.id} foi pago com sucesso`,
    });
    
    setIsPaymentDialogOpen(false);
  };
  
  const handleCloseCashRegister = () => {
    toast({
      title: "Caixa Fechado",
      description: "O caixa foi fechado com sucesso",
    });
    
    setIsCashRegisterOpen(false);
  };
  
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "Cartão de Crédito":
      case "Cartão de Débito":
        return <CreditCard className="h-4 w-4" />;
      case "Dinheiro":
        return <Banknote className="h-4 w-4" />;
      case "Pix":
        return <QrCode className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };
  
  const getPaymentMethodText = (method: string) => {
    if (method === "cash") return "Dinheiro";
    if (method === "credit") return "Cartão de Crédito";
    if (method === "debit") return "Cartão de Débito";
    if (method === "pix") return "Pix";
    return method;
  };
  
  const calculateChange = () => {
    if (!selectedOrder || !amountReceived) return 0;
    const received = parseFloat(amountReceived);
    const total = selectedOrder.totalAmount;
    return received > total ? received - total : 0;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Caixa</h1>
          <p className="text-muted-foreground">Gerenciamento de pagamentos e fechamento de caixa</p>
        </div>
        
        <div className="flex gap-2">
          {isCashRegisterOpen ? (
            <Button variant="outline" onClick={handleCloseCashRegister}>
              <Calculator className="h-4 w-4 mr-2" />
              Fechar Caixa
            </Button>
          ) : (
            <Button onClick={() => setIsCashRegisterOpen(true)}>
              <Wallet className="h-4 w-4 mr-2" />
              Abrir Caixa
            </Button>
          )}
          
          <Button>
            <Printer className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          {isCashRegisterOpen ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Pedidos para Pagamento</h2>
              {checkoutOrders.length > 0 ? (
                <div className="space-y-4">
                  {checkoutOrders.map(order => (
                    <Card key={order.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            Mesa {order.tableNumber} - Pedido #{order.id}
                          </CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div className="font-medium mb-1">Itens do pedido:</div>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.quantity}x {item.name}</span>
                                <span>R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}</span>
                              </div>
                            ))}
                            <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                              <span>Total</span>
                              <span>R$ {order.totalAmount.toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full mt-2" 
                            onClick={() => handleOpenPayment(order)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Processar Pagamento
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Check className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Sem pedidos pendentes</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Todos os pedidos foram pagos.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Caixa Fechado</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">
                  O caixa está fechado. Por favor, abra o caixa para processar pagamentos.
                </p>
                <Button className="mt-4" onClick={() => setIsCashRegisterOpen(true)}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Abrir Caixa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 border-b pb-2">
                  <span className="text-muted-foreground">Fundo inicial:</span>
                  <span className="text-right font-medium">R$ {registerSummary.openingAmount.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Vendas em dinheiro:</span>
                  <span className="text-right font-medium">R$ {registerSummary.cashSales.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Vendas em cartão:</span>
                  <span className="text-right font-medium">R$ {registerSummary.cardSales.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Vendas em Pix:</span>
                  <span className="text-right font-medium">R$ {registerSummary.pixSales.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                  <span className="text-muted-foreground">Total de vendas:</span>
                  <span className="text-right font-bold">R$ {registerSummary.totalSales.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-dashed pt-2">
                  <span className="text-muted-foreground">Dinheiro esperado:</span>
                  <span className="text-right font-medium">R$ {registerSummary.expectedCash.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Dinheiro em caixa:</span>
                  <span className="text-right font-medium">R$ {registerSummary.actualCash.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                  <span className="text-muted-foreground">Diferença:</span>
                  <span className={`text-right font-bold ${registerSummary.difference < 0 ? 'text-red-500' : ''}`}>
                    R$ {registerSummary.difference.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Últimas Transações</h2>
            <div className="space-y-2">
              {dailyTransactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className="bg-background border rounded-md p-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full">
                      {getPaymentIcon(transaction.method)}
                    </div>
                    <div>
                      <div className="font-medium">Pedido #{transaction.orderId}</div>
                      <div className="text-sm text-muted-foreground">{transaction.method}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">R$ {transaction.amount.toFixed(2).replace('.', ',')}</div>
                    <div className="text-xs text-muted-foreground">{transaction.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processar Pagamento</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Mesa ${selectedOrder.tableNumber} - Pedido #${selectedOrder.id}`}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-2">
              <div className="border-b pb-2">
                <div className="font-medium mb-1">Resumo do Pedido:</div>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.quantity * item.price).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                  <span>Total</span>
                  <span>R$ {selectedOrder.totalAmount.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Método de Pagamento</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" /> Dinheiro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credit" id="credit" />
                    <Label htmlFor="credit" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Cartão de Crédito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debit" id="debit" />
                    <Label htmlFor="debit" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Cartão de Débito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" /> Pix
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {paymentMethod === "cash" && (
                <div className="grid gap-2">
                  <Label htmlFor="amountReceived">Valor Recebido (R$)</Label>
                  <Input
                    id="amountReceived"
                    type="number"
                    step="0.01"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Ex: 70,00"
                  />
                  
                  {amountReceived && parseFloat(amountReceived) >= selectedOrder.totalAmount && (
                    <div className="bg-muted p-2 rounded-md mt-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Troco:</span>
                        <span>R$ {calculateChange().toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleProcessPayment}>
              {paymentMethod ? (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Finalizar com {getPaymentMethodText(paymentMethod)}
                </>
              ) : (
                'Finalizar Pagamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
