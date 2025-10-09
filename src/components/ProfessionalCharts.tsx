import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  income: {
    prizeMoney: number;
    sponsors: number;
    gifts: number;
    otherIncome: number;
  };
  monthlyExpenses: {
    flights: number;
    lodging: number;
    meals: number;
    transport: number;
    entries: number;
    coaching: number;
    equipment: number;
    other: number;
  };
  yearlyProjected: {
    income: number;
    expenses: number;
  };
}

interface ProfessionalChartsProps {
  data: ChartData;
  currency?: string;
}

export default function ProfessionalCharts({ data, currency = 'USD' }: ProfessionalChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Income breakdown data
  const incomeData = [
    { name: 'Prize Money', value: data.income.prizeMoney, color: '#ea580c' },
    { name: 'Sponsors', value: data.income.sponsors, color: '#f97316' },
    { name: 'Gifts & Support', value: data.income.gifts, color: '#16a34a' },
    { name: 'Other Income', value: data.income.otherIncome, color: '#15803d' },
  ].filter(item => item.value > 0);

  // Monthly expenses data
  const expenseData = Object.entries(data.monthlyExpenses)
    .map(([key, value]) => ({
      category: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      amount: value,
      projectedYearly: value * 12
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Monthly vs Yearly trend data
  const totalIncome = Object.values(data.income).reduce((sum, val) => sum + val, 0);
  const monthlyExpenseTotal = Object.values(data.monthlyExpenses).reduce((sum, val) => sum + val, 0);
  
  const trendData = [
    {
      period: 'Current (YTD)',
      income: totalIncome,
      expenses: monthlyExpenseTotal * 10, // Mock 10 months
      projected: false
    },
    {
      period: 'Projected (Full Year)',
      income: data.yearlyProjected.income,
      expenses: data.yearlyProjected.expenses,
      projected: true
    }
  ];

  // Cash flow projection (next 6 months)
  const cashFlowData = [];
  let runningBalance = totalIncome - (monthlyExpenseTotal * 10);
  
  for (let i = 0; i < 6; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() + i);
    
    runningBalance += (data.yearlyProjected.income / 12) - monthlyExpenseTotal;
    
    cashFlowData.push({
      month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      balance: runningBalance,
      income: data.yearlyProjected.income / 12,
      expenses: monthlyExpenseTotal
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-green-700 p-4 border border-green-600 rounded-lg shadow-xl">
          <p className="font-semibold text-orange-100">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Breakdown Pie Chart */}
      <Card className="bg-green-800 border border-green-700">
        <CardHeader className="border-b border-green-700">
          <CardTitle className="text-lg font-bold text-orange-100">
            Income Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={40}
                paddingAngle={5}
                dataKey="value"
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={CustomTooltip} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span className="text-sm font-medium text-green-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Expenses Bar Chart */}
      <Card className="bg-green-800 border border-green-700">
        <CardHeader className="border-b border-green-700">
          <CardTitle className="text-lg font-bold text-orange-100">
            Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16a34a" opacity={0.3} />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12, fill: '#86efac' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => `${value / 1000}k`}
                tick={{ fill: '#86efac' }}
              />
              <Tooltip content={CustomTooltip} />
              <Bar 
                dataKey="amount" 
                fill="url(#expenseGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
