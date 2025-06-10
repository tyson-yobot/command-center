import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, DollarSign, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface SalesOrder {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  date: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

function SalesOrderProcessor() {
  const [orders, setOrders] = useState<SalesOrder[]>([
    {
      id: 'SO-001',
      customer: 'Acme Corp',
      amount: 15750.00,
      status: 'processing',
      items: 5,
      date: '2025-06-10',
      priority: 'high'
    },
    {
      id: 'SO-002',
      customer: 'Tech Solutions Inc',
      amount: 8250.00,
      status: 'pending',
      items: 3,
      date: '2025-06-10',
      priority: 'normal'
    },
    {
      id: 'SO-003',
      customer: 'Global Systems',
      amount: 22100.00,
      status: 'shipped',
      items: 8,
      date: '2025-06-09',
      priority: 'urgent'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-green-500';
      case 'delivered': return 'bg-green-600';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 border-red-200';
      case 'high': return 'text-orange-600 border-orange-200';
      case 'normal': return 'text-blue-600 border-blue-200';
      case 'low': return 'text-gray-600 border-gray-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const handleProcessOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'processing' as const }
        : order
    ));
  };

  const handleShipOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'shipped' as const }
        : order
    ));
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="w-5 h-5" />
          Sales Order Processing
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{pendingOrders} pending</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{order.customer}</span>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">#{order.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">${order.amount.toLocaleString()}</div>
                <div className="text-xs text-gray-600">{order.items} items</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="text-sm capitalize">{order.status}</span>
                <span className="text-xs text-gray-500">• {order.date}</span>
              </div>
              
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleProcessOrder(order.id)}
                  >
                    Process
                  </Button>
                )}
                {order.status === 'processing' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleShipOrder(order.id)}
                  >
                    Ship
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full">
            View All Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { SalesOrderProcessor };
export default SalesOrderProcessor;