import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Target, AlertTriangle, Plus, Eye } from 'lucide-react';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  type: 'marketing' | 'operations' | 'technology' | 'personnel';
  status: 'approved' | 'pending' | 'flagged';
}

interface Budget {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export default function SmartSpendDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    type: 'marketing' as const
  });
  const [totalROI, setTotalROI] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadSmartSpendData();
  }, []);

  const loadSmartSpendData = async () => {
    try {
      const response = await fetch('/api/smartspend/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setExpenses(data.expenses || []);
        setBudgets(data.budgets || []);
        setTotalROI(data.roi || 0);
        setMonthlySpend(data.monthlySpend || 0);
      }
    } catch (error) {
      console.error('Failed to load SmartSpend data:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all expense fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/smartspend/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          date: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await loadSmartSpendData();
        setNewExpense({ category: '', amount: '', description: '', type: 'marketing' });
        toast({
          title: "Expense Added",
          description: "Expense tracked and budget updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const getBudgetStatus = (budget: Budget) => {
    if (budget.percentage > 90) return 'danger';
    if (budget.percentage > 75) return 'warning';
    return 'safe';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SmartSpend™ Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track expenses, budget, and ROI in real-time</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {formatCurrency(monthlySpend)} This Month
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalROI}%</div>
            <p className="text-xs text-muted-foreground">+2.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlySpend)}</div>
            <p className="text-xs text-muted-foreground">12% under budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {budgets.filter(b => b.percentage > 75).length}
            </div>
            <p className="text-xs text-muted-foreground">Categories over 75%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Lead</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24.50</div>
            <p className="text-xs text-muted-foreground">-8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Expense */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Expense
            </CardTitle>
            <CardDescription>Track a new business expense</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Advertising, Software, Travel..."
                value={newExpense.category}
                onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the expense"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={newExpense.type} onValueChange={(value: any) => setNewExpense(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="personnel">Personnel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddExpense} className="w-full">
              Add Expense
            </Button>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Budget Overview
            </CardTitle>
            <CardDescription>Monthly budget allocation and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgets.map((budget, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{budget.category}</span>
                    <Badge 
                      variant={getBudgetStatus(budget) === 'danger' ? 'destructive' : 
                               getBudgetStatus(budget) === 'warning' ? 'secondary' : 'default'}
                    >
                      {budget.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getBudgetStatus(budget) === 'danger' ? 'bg-red-500' :
                        getBudgetStatus(budget) === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatCurrency(budget.spent)} spent</span>
                    <span>{formatCurrency(budget.remaining)} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Latest business expenses and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.slice(0, 10).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{expense.description}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(expense.amount)}</div>
                  <Badge 
                    variant={expense.status === 'approved' ? 'default' : 
                             expense.status === 'pending' ? 'secondary' : 'destructive'}
                  >
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}