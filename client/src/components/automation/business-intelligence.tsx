import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Zap,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface CostMetrics {
  totalMonthlyCost: number;
  costPerBot: number;
  costPerCall: number;
  costPerConversion: number;
  savingsFromAutomation: number;
  projectedAnnualSavings: number;
}

interface ROIMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  roiPercentage: number;
  paybackPeriod: number;
  revenuePerBot: number;
}

interface PerformanceMetrics {
  callsPerHour: number;
  conversionsPerHour: number;
  averageCallDuration: number;
  successRate: number;
  costEfficiency: number;
  competitorBenchmark: number;
}

export default function BusinessIntelligence() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const costMetrics: CostMetrics = {
    totalMonthlyCost: 12450,
    costPerBot: 245,
    costPerCall: 0.85,
    costPerConversion: 18.50,
    savingsFromAutomation: 45000,
    projectedAnnualSavings: 540000
  };

  const roiMetrics: ROIMetrics = {
    totalRevenue: 185000,
    totalCosts: 12450,
    netProfit: 172550,
    roiPercentage: 1386,
    paybackPeriod: 2.3,
    revenuePerBot: 3650
  };

  const performanceMetrics: PerformanceMetrics = {
    callsPerHour: 83,
    conversionsPerHour: 32,
    averageCallDuration: 4.2,
    successRate: 38.6,
    costEfficiency: 94.2,
    competitorBenchmark: 28.5
  };

  return (
    <div className="space-y-6">
      {/* Cost Optimization Engine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Cost Optimization Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</p>
              <p className="text-3xl font-bold text-blue-600">
                ${costMetrics.totalMonthlyCost.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowDown className="h-4 w-4" />
                <span className="text-sm">12% vs last month</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cost per Call</p>
              <p className="text-3xl font-bold text-purple-600">
                ${costMetrics.costPerCall}
              </p>
              <div className="flex items-center gap-1 text-green-600">
                <ArrowDown className="h-4 w-4" />
                <span className="text-sm">8% vs industry avg</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Automation Savings</p>
              <p className="text-3xl font-bold text-emerald-600">
                ${costMetrics.savingsFromAutomation.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-emerald-600">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm">vs manual operations</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Cost Optimization Active</span>
            </div>
            <p className="text-green-600 dark:text-green-400 mt-2">
              Auto-shutdown during low activity saves $3,200/month • Smart resource allocation reduces costs by 23%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ROI Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            ROI Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                ${roiMetrics.totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${roiMetrics.netProfit.toLocaleString()}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
              <p className="text-2xl font-bold text-purple-600">
                {roiMetrics.roiPercentage}%
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Payback Period</p>
              <p className="text-2xl font-bold text-orange-600">
                {roiMetrics.paybackPeriod} months
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Revenue vs Costs</span>
              <span className="text-sm text-gray-600">93.3% profit margin</span>
            </div>
            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                style={{ width: '93.3%' }}
              />
              <div 
                className="h-full bg-red-500 rounded-r-full absolute right-0 top-0"
                style={{ width: '6.7%' }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-emerald-600">Revenue: $185k</span>
              <span className="text-red-600">Costs: $12.4k</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Performance vs Industry Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Your: {performanceMetrics.successRate}%</span>
                    <Badge variant="secondary">Industry: {performanceMetrics.competitorBenchmark}%</Badge>
                  </div>
                </div>
                <Progress value={performanceMetrics.successRate} className="h-2" />
                <p className="text-xs text-green-600 mt-1">
                  35% above industry average
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Cost Efficiency</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{performanceMetrics.costEfficiency}%</span>
                    <Badge variant="secondary">Target: 90%</Badge>
                  </div>
                </div>
                <Progress value={performanceMetrics.costEfficiency} className="h-2" />
                <p className="text-xs text-green-600 mt-1">
                  4.7% above target efficiency
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Calls/Hour</p>
                <p className="text-lg font-bold">{performanceMetrics.callsPerHour}</p>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Conversions/Hour</p>
                <p className="text-lg font-bold">{performanceMetrics.conversionsPerHour}</p>
              </div>

              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Avg Call Time</p>
                <p className="text-lg font-bold">{performanceMetrics.averageCallDuration}m</p>
              </div>

              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Revenue/Bot</p>
                <p className="text-lg font-bold">${roiMetrics.revenuePerBot}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Predictive Business Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">Growth Projection</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mb-2">+47%</p>
              <p className="text-sm text-gray-600">
                Expected revenue growth next quarter based on current trends
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Optimization Alert</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 mb-2">3 Bots</p>
              <p className="text-sm text-gray-600">
                Could be optimized for 15% cost reduction without performance loss
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Market Opportunity</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">$85k</p>
              <p className="text-sm text-gray-600">
                Additional monthly revenue potential with current capacity
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">AI-Powered Insights</span>
            </div>
            <p className="text-indigo-600 dark:text-indigo-400 mt-2">
              Based on 6 months of performance data, your automation platform is operating at 94.2% efficiency. 
              Recommendation: Deploy 5 additional bots in the US-West region for maximum ROI impact.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}