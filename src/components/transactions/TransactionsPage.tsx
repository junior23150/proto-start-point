import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Calendar,
  Download,
  Printer,
  Trash2,
  Plus,
  ArrowLeftRight,
  ChevronDown,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, subDays, subWeeks, addMonths, subMonths } from "date-fns";
import { pt } from "date-fns/locale";
import { TransferSlideIn } from "@/components/transactions/TransferSlideIn";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string | null;
  transaction_type: "income" | "expense";
  date: string;
  source: string;
  original_message: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Dados mockados removidos - usando apenas dados reais do Supabase

export function TransactionsPage() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [dateLabel, setDateLabel] = useState("Este mês");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [tempDateLabel, setTempDateLabel] = useState("Este mês");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customRangeFrom, setCustomRangeFrom] = useState<Date | undefined>();
  const [customRangeTo, setCustomRangeTo] = useState<Date | undefined>();
  const [activeFilter, setActiveFilter] = useState<"all" | "income" | "expense">("all");
  const { toast } = useToast();

  // Categories list
  const categories = [
    "Alimentação",
    "Transporte", 
    "Saúde",
    "Educação",
    "Lazer",
    "Moradia",
    "Salário",
    "Freelance",
    "Investimentos",
    "Outros"
  ];

  // Carregar transações do Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          console.error('Error fetching transactions:', error);
          toast({
            title: "Erro ao carregar transações",
            description: "Não foi possível carregar as transações. Tente novamente.",
            variant: "destructive",
          });
          return;
        }
        
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Erro ao carregar transações",
          description: "Não foi possível carregar as transações. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  // Filtrar transações
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (transaction.category && 
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Normalizar datas para comparação (apenas data, sem horário)
    const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
    const fromDateOnly = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
    const toDateOnly = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate());
    
    const matchesDateRange = 
      transactionDateOnly >= fromDateOnly && 
      transactionDateOnly <= toDateOnly;
    
    const matchesFilter = 
      activeFilter === "all" || 
      (activeFilter === "income" && transaction.transaction_type === "income") ||
      (activeFilter === "expense" && transaction.transaction_type === "expense");
    
    const matchesAccount = 
      selectedAccount === "all" || 
      transaction.source === selectedAccount;

    return matchesSearch && matchesDateRange && matchesFilter && matchesAccount;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentAccountBalance = 0; // TODO: Calcular saldo real das contas do Supabase

  // Calcular valor das transações selecionadas corretamente (receitas - despesas)
  const selectedTransactionsValue = selectedTransactions.reduce((sum, id) => {
    const transaction = filteredTransactions.find(t => t.id === id);
    if (!transaction) return sum;
    
    if (transaction.transaction_type === "income") {
      return sum + transaction.amount;
    } else {
      return sum - Math.abs(transaction.amount);
    }
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Handle quick date selection
  const handleQuickDateFilter = (type: string) => {
    const today = new Date();
    let from: Date, to: Date, label: string;

    switch (type) {
      case 'today':
        from = to = today;
        label = 'Hoje';
        break;
      case 'thisWeek':
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = endOfWeek(today, { weekStartsOn: 1 });
        label = 'Esta semana';
        break;
      case 'lastWeek':
        const lastWeekStart = subWeeks(today, 1);
        from = startOfWeek(lastWeekStart, { weekStartsOn: 1 });
        to = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        label = 'Semana passada';
        break;
      case 'thisMonth':
        from = startOfMonth(today);
        to = endOfMonth(today);
        label = 'Este mês';
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        label = 'Mês passado';
        break;
      case 'nextMonth':
        const nextMonth = addMonths(today, 1);
        from = startOfMonth(nextMonth);
        to = endOfMonth(nextMonth);
        label = 'Próximo mês';
        break;
      case 'customPeriod':
        setShowCustomRange(true);
        return;
      default:
        return;
    }

    setTempDateRange({ from, to });
    setTempDateLabel(label);
    setShowCustomRange(false);
  };

  // Apply date filter
  const applyDateFilter = () => {
    if (showCustomRange && customRangeFrom && customRangeTo) {
      // Garantir que a data inicial seja o início do dia e a final seja o fim do dia
      const fromDate = new Date(customRangeFrom.getFullYear(), customRangeFrom.getMonth(), customRangeFrom.getDate(), 0, 0, 0, 0);
      const toDate = new Date(customRangeTo.getFullYear(), customRangeTo.getMonth(), customRangeTo.getDate(), 23, 59, 59, 999);
      
      setDateRange({ from: fromDate, to: toDate });
      setDateLabel(`${format(customRangeFrom, "dd/MM/yyyy", { locale: pt })} - ${format(customRangeTo, "dd/MM/yyyy", { locale: pt })}`);
    } else {
      setDateRange(tempDateRange);
      setDateLabel(tempDateLabel);
    }
    setShowCalendar(false);
    setShowCustomRange(false);
    setCustomRangeFrom(undefined);
    setCustomRangeTo(undefined);
  };

  // Cancel date filter
  const cancelDateFilter = () => {
    setTempDateRange(dateRange);
    setTempDateLabel(dateLabel);
    setShowCalendar(false);
    setShowCustomRange(false);
    setCustomRangeFrom(undefined);
    setCustomRangeTo(undefined);
  };

  // Handle transaction selection
  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  // Handle select all transactions
  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  // Handle delete selected transactions
  const handleDeleteSelected = async () => {
    if (selectedTransactions.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', selectedTransactions);
      
      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => !selectedTransactions.includes(t.id)));
      setSelectedTransactions([]);
      
      toast({
        title: "Transações excluídas",
        description: `${selectedTransactions.length} transação(ões) foram excluídas com sucesso.`,
      });
    } catch (error) {
      console.error('Error deleting transactions:', error);
      toast({
        title: "Erro ao excluir transações",
        description: "Não foi possível excluir as transações selecionadas.",
        variant: "destructive",
      });
    }
  };

  // Handle category update
  const handleCategoryUpdate = async (transactionId: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ category: newCategory })
        .eq('id', transactionId);
      
      if (error) throw error;
      
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, category: newCategory }
            : t
        )
      );
      
      setEditingCategory(null);
      
      toast({
        title: "Categoria atualizada",
        description: "A categoria da transação foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Não foi possível atualizar a categoria da transação.",
        variant: "destructive",
      });
    }
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de exportação será implementada em breve",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-border p-4 lg:p-6 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  Transações
                </h1>
                <Badge variant="secondary" className="text-xs">
                  {filteredTransactions.length}
                </Badge>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full lg:w-64 rounded-xl"
                />
              </div>

              {/* Date Filter */}
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-dashed">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateLabel}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex">
                    {showCustomRange ? (
                      <div className="flex p-4 gap-6">
                        <div className="space-y-3 text-center">
                          <div className="text-sm font-medium text-knumbers-green">Data inicial</div>
                          <CalendarComponent
                            mode="single"
                            selected={customRangeFrom}
                            onSelect={setCustomRangeFrom}
                            className="pointer-events-auto border border-knumbers-green/20 rounded-lg"
                            locale={pt}
                          />
                        </div>
                        <div className="space-y-3 text-center">
                          <div className="text-sm font-medium text-knumbers-purple">Data final</div>
                          <CalendarComponent
                            mode="single"
                            selected={customRangeTo}
                            onSelect={setCustomRangeTo}
                            className="pointer-events-auto border border-knumbers-purple/20 rounded-lg"
                            locale={pt}
                          />
                        </div>
                      </div>
                      {showCustomRange && (
                        <div className="px-4 pb-3 text-center">
                          <p className="text-xs text-muted-foreground">
                            {!customRangeFrom && !customRangeTo && "Selecione a data inicial e final"}
                            {customRangeFrom && !customRangeTo && "Agora selecione a data final"}
                            {customRangeFrom && customRangeTo && "Datas selecionadas! Clique em Filtrar"}
                          </p>
                        </div>
                      )}
                    ) : (
                      <CalendarComponent
                        mode="range"
                        selected={tempDateRange}
                        onSelect={(range) => {
                          if (range?.from) {
                            setTempDateRange({
                              from: range.from,
                              to: range.to || range.from,
                            });
                          }
                        }}
                        className="p-3 pointer-events-auto"
                        locale={pt}
                      />
                    )}
                    
                    <div className="border-l">
                      <div className="p-3 space-y-1 min-w-[140px]">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 px-2" 
                          onClick={() => handleQuickDateFilter('today')}
                        >
                          Hoje
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 px-2"
                          onClick={() => handleQuickDateFilter('thisWeek')}
                        >
                          Esta semana
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 px-2"
                          onClick={() => handleQuickDateFilter('lastWeek')}
                        >
                          Semana passada
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 px-2"
                          onClick={() => handleQuickDateFilter('thisMonth')}
                        >
                          Este mês
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 px-2"
                          onClick={() => handleQuickDateFilter('lastMonth')}
                        >
                          Mês passado
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 px-2"
                          onClick={() => handleQuickDateFilter('nextMonth')}
                        >
                          Próximo mês
                        </Button>
                        <Separator className="my-1" />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-xs h-7 px-2 text-knumbers-purple hover:bg-knumbers-purple/10"
                          onClick={() => handleQuickDateFilter('customPeriod')}
                        >
                          Período customizado
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 p-3 border-t bg-muted/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelDateFilter}
                      className="flex-1 text-knumbers-green border-knumbers-green hover:bg-knumbers-green/10"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={applyDateFilter}
                      disabled={showCustomRange && (!customRangeFrom || !customRangeTo)}
                      className="flex-1 bg-knumbers-purple hover:bg-knumbers-purple/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Filtrar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Action Buttons - Moved to right */}
            <div className={`flex items-center gap-2 ${sidebarCollapsed ? 'mr-16' : 'mr-60'}`}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportToExcel}
                className="rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTransferModal(true)}
                className="rounded-xl"
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Transferir
              </Button>
              <Button 
                size="sm"
                className="rounded-xl bg-knumbers-green hover:bg-knumbers-green/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(currentAccountBalance)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    💰
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Receitas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    📈
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalExpense)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    📉
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resultado</p>
                    <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(totalIncome - totalExpense)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    ⚖️
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Account Selection */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="rounded-xl"
              >
                Todas
              </Button>
              <Button
                variant={activeFilter === "income" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("income")}
                className="rounded-xl"
              >
                Receitas
              </Button>
              <Button
                variant={activeFilter === "expense" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("expense")}
                className="rounded-xl"
              >
                Despesas
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-48 rounded-xl">
                  <SelectValue placeholder="Todas as contas" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  {/* TODO: Carregar contas reais do Supabase */}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTransactions.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedTransactions.length} transação(ões) selecionada(s)
              </span>
              <span className="text-sm font-medium">
                Valor: {formatCurrency(selectedTransactionsValue)}
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-4 lg:p-6">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma transação encontrada
                </h3>
                <p className="text-muted-foreground">
                  Não há transações para o período e filtros selecionados.
                </p>
              </div>
            ) : (
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <div className="overflow-auto h-full">
                    {/* Table Header */}
                    <div className="sticky top-0 bg-muted/30 border-b p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedTransactions.length === filteredTransactions.length}
                          onCheckedChange={handleSelectAll}
                          className="rounded"
                        />
                        <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-muted-foreground">
                          <div className="col-span-3">Descrição</div>
                          <div className="col-span-2">Categoria</div>
                          <div className="col-span-2">Data</div>
                          <div className="col-span-2">Valor</div>
                          <div className="col-span-2">Tipo</div>
                          <div className="col-span-1">Ações</div>
                        </div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-4 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={selectedTransactions.includes(transaction.id)}
                              onCheckedChange={() => handleTransactionSelect(transaction.id)}
                              className="rounded"
                            />
                            <div className="grid grid-cols-12 gap-4 w-full text-sm">
                              <div className="col-span-3">
                                <p className="font-medium text-foreground">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.source}
                                </p>
                              </div>
                              <div className="col-span-2">
                                {editingCategory === transaction.id ? (
                                  <Select
                                    value={transaction.category || ""}
                                    onValueChange={(value) => handleCategoryUpdate(transaction.id, value)}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {transaction.category || "Sem categoria"}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingCategory(transaction.id)}
                                      className="h-6 w-6 p-0 rounded-full"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="col-span-2">
                                <p className="text-foreground">
                                  {format(new Date(transaction.date), "dd/MM/yyyy", { locale: pt })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(transaction.date), "HH:mm", { locale: pt })}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className={`font-medium ${
                                  transaction.transaction_type === "income" 
                                    ? "text-green-600" 
                                    : "text-red-600"
                                }`}>
                                  {transaction.transaction_type === "income" ? "+" : "-"}
                                  {formatCurrency(Math.abs(transaction.amount))}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <Badge 
                                  variant={transaction.transaction_type === "income" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {transaction.transaction_type === "income" ? "Receita" : "Despesa"}
                                </Badge>
                              </div>
                              <div className="col-span-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && <TransferSlideIn onClose={() => setShowTransferModal(false)} />}
    </div>
  );
}