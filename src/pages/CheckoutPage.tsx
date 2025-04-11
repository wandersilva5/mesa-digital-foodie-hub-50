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
import { CreditCard, Banknote, Wallet, Receipt, Clock, QrCode, Check, Printer, Calculator, Loader2 } from "lucide-react";
import { getOrdersForCheckout } from "@/services/orderService";
import { processPayment, openRegisterSession, closeRegisterSession, getActiveRegisterSession } from "@/services/paymentService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RegisterSummary {
  openingAmount: number;
  cashSales: number;
  cardSales: number;
  pixSales: number;
  totalSales: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
}

interface Order {
  id: string;
  tableNumber?: number;
  customerName?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    productId: string;
    observations?: string;
  }[];
  status: string;
  createdAt: any;
  total: number;
  paid?: boolean;
}

interface Transaction {
  id: number;
  orderId: string;
  amount: number;
  method: string;
  timestamp: any;
  time: string;
}

interface RegisterSession {
  id: string;
  status: string;
  openingAmount: number;
  expectedClosingAmount: number;
  actualClosingAmount: number;
  difference: number;
  openedAt: any;
  closedAt: any;
  notes: string;
  transactions: Array<{
    paymentId: string;
    orderId: string;
    method: string;
    amount: number;
    timestamp: any;
  }>;
  updatedAt: any;
  userId: string;
}

const CheckoutPage = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedOrder, setSelectedOrder] = useState<null | Order>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [isCashRegisterOpen, setIsCashRegisterOpen] = useState(false);
  const [registerSummary, setRegisterSummary] = useState<RegisterSummary>({
    openingAmount: 0,
    cashSales: 0,
    cardSales: 0,
    pixSales: 0,
    totalSales: 0,
    expectedCash: 0,
    actualCash: 0,
    difference: 0
  });
  const [ordersForPayment, setOrdersForPayment] = useState<Order[]>([]);
  const [dailyTransactions, setDailyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [openingAmount, setOpeningAmount] = useState<string>("0");
  const [closingAmount, setClosingAmount] = useState<string>("0");
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    checkRegisterStatus();
    if (isCashRegisterOpen) {
      fetchOrdersForPayment();
      loadTransactions();
    }
  }, [isCashRegisterOpen]);
  
  const checkRegisterStatus = async () => {
    try {
      setLoading(true);
      const activeSession = await getActiveRegisterSession() as RegisterSession | null;
      
      if (activeSession) {
        setIsCashRegisterOpen(true);
        setActiveSessionId(activeSession.id);
        
        const transactions = activeSession.transactions || [];
        
        let cashSales = 0;
        let cardSales = 0;
        let pixSales = 0;
        
        transactions.forEach((trans: any) => {
          if (trans.method === "cash") cashSales += trans.amount;
          else if (trans.method === "credit" || trans.method === "debit") cardSales += trans.amount;
          else if (trans.method === "pix") pixSales += trans.amount;
        });
        
        const totalSales = cashSales + cardSales + pixSales;
        const expectedCash = activeSession.openingAmount + cashSales;
        
        setRegisterSummary({
          openingAmount: activeSession.openingAmount,
          cashSales,
          cardSales,
          pixSales,
          totalSales,
          expectedCash,
          actualCash: expectedCash,
          difference: 0
        });
      } else {
        setIsCashRegisterOpen(false);
      }
    } catch (error) {
      console.error("Error checking register status:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrdersForPayment = async () => {
    try {
      setLoading(true);
      const orders = await getOrdersForCheckout();
      setOrdersForPayment(orders as Order[]);
    } catch (error) {
      console.error("Error fetching orders for payment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos para pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadTransactions = async () => {
    try {
      const transactions: Transaction[] = dailyTransactions.length > 0 ? dailyTransactions : [
        { id: 101, orderId: "7", amount: 56.80, method: "Cartão de Crédito", timestamp: new Date(), time: "14:30" },
        { id: 102, orderId: "5", amount: 37.50, method: "Pix", timestamp: new Date(), time: "15:15" },
        { id: 103, orderId: "2", amount: 82.40, method: "Dinheiro", timestamp: new Date(), time: "16:05" },
        { id: 104, orderId: "6", amount: 29.90, method: "Cartão de Débito", timestamp: new Date(), time: "16:45" }
      ];
      
      setDailyTransactions(transactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };
  
  const handleOpenPayment = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMethod("");
    setAmountReceived("");
    setIsPaymentDialogOpen(true);
  };
  
  const handleProcessPayment = async () => {
    if (!selectedOrder || !paymentMethod) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um método de pagamento",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentMethod === "cash") {
      if (!amountReceived || parseFloat(amountReceived) < selectedOrder.total) {
        toast({
          title: "Erro",
          description: "O valor recebido é menor que o total do pedido",
          variant: "destructive",
        });
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const received = paymentMethod === "cash" ? parseFloat(amountReceived) : selectedOrder.total;
      const change = paymentMethod === "cash" ? received - selectedOrder.total : 0;
      
      await processPayment({
        orderId: selectedOrder.id,
        userId: selectedOrder.id,
        staffId: user.id,
        method: paymentMethod as any,
        amount: selectedOrder.total,
        amountReceived: paymentMethod === "cash" ? received : undefined,
        change: paymentMethod === "cash" ? change : undefined,
        status: "completed"
      });
      
      setOrdersForPayment(prevOrders => 
        prevOrders.filter(order => order.id !== selectedOrder.id)
      );
      
      const newTransaction = {
        id: Date.now(),
        orderId: selectedOrder.id,
        amount: selectedOrder.total,
        method: getPaymentMethodText(paymentMethod),
        timestamp: new Date(),
        time: format(new Date(), "HH:mm")
      };
      
      setDailyTransactions(prev => [newTransaction, ...prev]);
      
      updateRegisterSummary(paymentMethod, selectedOrder.total);
      
      toast({
        title: "Pagamento Processado",
        description: `Pedido #${selectedOrder.id} foi pago com sucesso`,
      });
      
      setIsPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar o pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateRegisterSummary = (method: string, amount: number) => {
    setRegisterSummary(prev => {
      const newSummary = { ...prev };
      
      if (method === "cash") {
        newSummary.cashSales += amount;
        newSummary.expectedCash += amount;
      } else if (method === "credit" || method === "debit") {
        newSummary.cardSales += amount;
      } else if (method === "pix") {
        newSummary.pixSales += amount;
      }
      
      newSummary.totalSales = newSummary.cashSales + newSummary.cardSales + newSummary.pixSales;
      
      return newSummary;
    });
  };
  
  const handleOpenCashRegister = () => {
    setOpeningAmount("0");
    setShowRegisterDialog(true);
  };
  
  const handleCloseCashRegister = () => {
    setClosingAmount(registerSummary.expectedCash.toFixed(2));
    setShowRegisterDialog(true);
  };
  
  const handleConfirmOpenRegister = async () => {
    if (!openingAmount || parseFloat(openingAmount) < 0 || !user) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor inicial válido",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const amount = parseFloat(openingAmount);
      const sessionId = await openRegisterSession(user.id, amount, "Abertura manual de caixa");
      
      setActiveSessionId(sessionId);
      setIsCashRegisterOpen(true);
      setRegisterSummary({
        openingAmount: amount,
        cashSales: 0,
        cardSales: 0,
        pixSales: 0,
        totalSales: 0,
        expectedCash: amount,
        actualCash: amount,
        difference: 0
      });
      
      toast({
        title: "Caixa Aberto",
        description: "O caixa foi aberto com sucesso",
      });
      
      fetchOrdersForPayment();
    } catch (error) {
      console.error("Error opening register:", error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o caixa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowRegisterDialog(false);
    }
  };
  
  const handleConfirmCloseRegister = async () => {
    if (!closingAmount || parseFloat(closingAmount) < 0 || !activeSessionId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor final válido",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const amount = parseFloat(closingAmount);
      
      const difference = amount - registerSummary.expectedCash;
      setRegisterSummary(prev => ({
        ...prev,
        actualCash: amount,
        difference
      }));
      
      await closeRegisterSession(activeSessionId, amount, "Fechamento manual de caixa");
      
      toast({
        title: "Caixa Fechado",
        description: "O caixa foi fechado com sucesso",
      });
      
      setIsCashRegisterOpen(false);
      setActiveSessionId(null);
    } catch (error) {
      console.error("Error closing register:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fechar o caixa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowRegisterDialog(false);
    }
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
    const total = selectedOrder.total;
    return received > total ? received - total : 0;
  };
  
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    let date;
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
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
            <Button variant="outline" onClick={handleCloseCashRegister} disabled={loading}>
              <Calculator className="h-4 w-4 mr-2" />
              Fechar Caixa
            </Button>
          ) : (
            <Button onClick={handleOpenCashRegister} disabled={loading}>
              <Wallet className="h-4 w-4 mr-2" />
              Abrir Caixa
            </Button>
          )}
          
          <Button disabled={!isCashRegisterOpen || loading}>
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
              {loading ? (
                <Card>
                  <CardContent className="text-center py-8 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Carregando pedidos...</p>
                  </CardContent>
                </Card>
              ) : ordersForPayment.length > 0 ? (
                <div className="space-y-4">
                  {ordersForPayment.map(order => (
                    <Card key={order.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">
                            {order.tableNumber ? `Mesa ${order.tableNumber}` : 'Delivery'} - Pedido #{order.id.substring(0, 6)}
                          </CardTitle>
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(order.createdAt)}
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
                              <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full mt-2" 
                            onClick={() => handleOpenPayment(order)}
                            disabled={loading}
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
                <Button className="mt-4" onClick={handleOpenCashRegister} disabled={loading}>
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
            {dailyTransactions.length > 0 ? (
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
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma transação registrada hoje.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCashRegisterOpen ? "Fechar Caixa" : "Abrir Caixa"}
            </DialogTitle>
            <DialogDescription>
              {isCashRegisterOpen 
                ? "Informe o valor final em dinheiro para fechar o caixa"
                : "Informe o valor inicial em dinheiro para abrir o caixa"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cashAmount">
                {isCashRegisterOpen ? "Valor em dinheiro no caixa:" : "Valor inicial:"}
              </Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                min="0"
                value={isCashRegisterOpen ? closingAmount : openingAmount}
                onChange={(e) => isCashRegisterOpen 
                  ? setClosingAmount(e.target.value)
                  : setOpeningAmount(e.target.value)
                }
                placeholder="0,00"
              />
              
              {isCashRegisterOpen && (
                <div className="mt-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Valor esperado:</span>
                    <span>R$ {registerSummary.expectedCash.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {parseFloat(closingAmount) !== 0 && (
                    <div className="flex justify-between font-medium mt-1">
                      <span>Diferença:</span>
                      <span className={parseFloat(closingAmount) < registerSummary.expectedCash ? 'text-red-500' : ''}>
                        R$ {(parseFloat(closingAmount) - registerSummary.expectedCash).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={isCashRegisterOpen ? handleConfirmCloseRegister : handleConfirmOpenRegister}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCashRegisterOpen ? "Fechar Caixa" : "Abrir Caixa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processar Pagamento</DialogTitle>
            <DialogDescription>
              {selectedOrder && `${selectedOrder.tableNumber ? `Mesa ${selectedOrder.tableNumber}` : 'Delivery'} - Pedido #${selectedOrder.id.substring(0, 6)}`}
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
                  <span>R$ {selectedOrder.total.toFixed(2).replace('.', ',')}</span>
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
                  
                  {amountReceived && parseFloat(amountReceived) >= selectedOrder.total && (
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
            <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleProcessPayment} disabled={loading || !paymentMethod}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
