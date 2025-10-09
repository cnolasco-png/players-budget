import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, X, TrendingUp, TrendingDown } from "lucide-react";

export interface FinancialData {
  // Income Sources
  prizeMoney: number;
  sponsors: number;
  gifts: number;
  otherIncome: number;
  
  // Monthly Expenses
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
  
  // Yearly Projections
  yearlyProjected: {
    income: number;
    expenses: number;
  };
}

interface FinancialEditorProps {
  data: FinancialData;
  onUpdate: (data: FinancialData) => void;
  currency?: string;
}

export default function FinancialEditor({ data, onUpdate, currency = 'USD' }: FinancialEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [tempData, setTempData] = useState<FinancialData>(data);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (section: string) => {
    setEditingSection(section);
    setTempData({ ...data });
  };

  const handleSave = () => {
    onUpdate(tempData);
    setEditingSection(null);
  };

  const handleCancel = () => {
    setTempData({ ...data });
    setEditingSection(null);
  };

  const updateIncome = (field: keyof Pick<FinancialData, 'prizeMoney' | 'sponsors' | 'gifts' | 'otherIncome'>, value: string) => {
    setTempData(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const updateMonthlyExpense = (field: keyof FinancialData['monthlyExpenses'], value: string) => {
    setTempData(prev => ({
      ...prev,
      monthlyExpenses: {
        ...prev.monthlyExpenses,
        [field]: parseInt(value) || 0
      }
    }));
  };

  const updateYearlyProjection = (field: keyof FinancialData['yearlyProjected'], value: string) => {
    setTempData(prev => ({
      ...prev,
      yearlyProjected: {
        ...prev.yearlyProjected,
        [field]: parseInt(value) || 0
      }
    }));
  };

  // Calculations
  const totalIncome = data.prizeMoney + data.sponsors + data.gifts + data.otherIncome;
  const monthlyExpenseTotal = Object.values(data.monthlyExpenses).reduce((sum, val) => sum + val, 0);
  const projectedYearlyExpenses = monthlyExpenseTotal * 12;
  
  // Calculate YTD (Year To Date) - we're in October, so roughly 10 months completed
  const currentMonth = new Date().getMonth() + 1; // October = month 10
  const monthsCompleted = Math.min(currentMonth, 10); // Cap at 10 months for realistic YTD
  const actualIncomeYTD = (totalIncome / 12) * monthsCompleted; // Pro-rate the yearly income
  
  const actualVsProjectedIncome = actualIncomeYTD - (data.yearlyProjected.income / 12 * monthsCompleted);
  const actualVsProjectedExpenses = (monthlyExpenseTotal * monthsCompleted) - (data.yearlyProjected.expenses / 12 * monthsCompleted);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-green-800 border border-green-700">
          <TabsTrigger value="income" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-green-300 hover:bg-green-700 hover:text-orange-100">Monthly Income</TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-green-300 hover:bg-green-700 hover:text-orange-100">Monthly Expenses</TabsTrigger>
          <TabsTrigger value="projections" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-green-300 hover:bg-green-700 hover:text-orange-100">Yearly Projections</TabsTrigger>
        </TabsList>

        {/* Monthly Income */}
        <TabsContent value="income" className="space-y-4">
          <Card className="bg-green-800 border border-green-700">
            <CardHeader className="flex flex-row items-center justify-between border-b border-green-700">
              <CardTitle className="text-xl font-bold text-orange-100">
                Monthly Income ({formatCurrency(totalIncome / 12)}/month)
              </CardTitle>
              {editingSection !== 'income' ? (
                <Button 
                  onClick={() => handleEdit('income')} 
                  variant="outline" 
                  size="sm"
                  className="border-green-600 text-green-300 hover:bg-green-700 hover:text-orange-100"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" className="border-green-600 text-green-300 hover:bg-green-700">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-300">Prize Money (Monthly Average)</Label>
                  {editingSection === 'income' ? (
                    <Input
                      type="number"
                      value={Math.round(tempData.prizeMoney / 12)}
                      onChange={(e) => updateIncome('prizeMoney', String((parseInt(e.target.value) || 0) * 12))}
                      className="bg-green-700 border-green-600 text-orange-100 focus:border-orange-600"
                      placeholder="Monthly amount"
                    />
                  ) : (
                    <div className="p-4 bg-green-700 rounded-lg border border-green-600">
                      <span className="text-lg font-semibold text-orange-100">{formatCurrency(Math.round(data.prizeMoney / 12))}/month</span>
                      <span className="text-sm text-green-300 block mt-1">({formatCurrency(data.prizeMoney)}/year)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Sponsors (Monthly Average)</Label>
                  {editingSection === 'income' ? (
                    <Input
                      type="number"
                      value={Math.round(tempData.sponsors / 12)}
                      onChange={(e) => updateIncome('sponsors', String((parseInt(e.target.value) || 0) * 12))}
                      className="bg-green-700 border-green-600 text-orange-100 focus:border-orange-600"
                      placeholder="Monthly amount"
                    />
                  ) : (
                    <div className="p-4 bg-green-700 rounded-lg border border-green-600">
                      <span className="text-lg font-semibold text-orange-100">{formatCurrency(Math.round(data.sponsors / 12))}/month</span>
                      <span className="text-sm text-green-300 block mt-1">({formatCurrency(data.sponsors)}/year)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Gifts & Support (Monthly)</Label>
                  {editingSection === 'income' ? (
                    <Input
                      type="number"
                      value={Math.round(tempData.gifts / 12)}
                      onChange={(e) => updateIncome('gifts', String((parseInt(e.target.value) || 0) * 12))}
                      className="bg-green-700 border-green-600 text-orange-100 focus:border-orange-600"
                      placeholder="Monthly amount"
                    />
                  ) : (
                    <div className="p-4 bg-green-700 rounded-lg border border-green-600">
                      <span className="text-lg font-semibold text-orange-100">{formatCurrency(Math.round(data.gifts / 12))}/month</span>
                      <span className="text-sm text-green-300 block mt-1">({formatCurrency(data.gifts)}/year)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-green-300">Other Income (Monthly)</Label>
                  {editingSection === 'income' ? (
                    <Input
                      type="number"
                      value={Math.round(tempData.otherIncome / 12)}
                      onChange={(e) => updateIncome('otherIncome', String((parseInt(e.target.value) || 0) * 12))}
                      className="bg-green-700 border-green-600 text-orange-100 focus:border-orange-600"
                      placeholder="Monthly amount"
                    />
                  ) : (
                    <div className="p-4 bg-green-700 rounded-lg border border-green-600">
                      <span className="text-lg font-semibold text-orange-100">{formatCurrency(Math.round(data.otherIncome / 12))}/month</span>
                      <span className="text-sm text-green-300 block mt-1">({formatCurrency(data.otherIncome)}/year)</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Expenses */}
        <TabsContent value="expenses" className="space-y-4">
          <Card className="bg-green-800 border border-green-700">
            <CardHeader className="flex flex-row items-center justify-between border-b border-green-700">
              <CardTitle className="text-xl font-bold text-orange-100">
                Monthly Expenses ({formatCurrency(monthlyExpenseTotal)}/month)
              </CardTitle>
              {editingSection !== 'expenses' ? (
                <Button 
                  onClick={() => handleEdit('expenses')} 
                  variant="outline" 
                  size="sm"
                  className="border-green-600 text-green-300 hover:bg-green-700 hover:text-orange-100"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" className="border-green-600 text-green-300 hover:bg-green-700">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.monthlyExpenses).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize text-green-300">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    {editingSection === 'expenses' ? (
                      <Input
                        type="number"
                        value={tempData.monthlyExpenses[key as keyof typeof tempData.monthlyExpenses]}
                        onChange={(e) => updateMonthlyExpense(key as keyof FinancialData['monthlyExpenses'], e.target.value)}
                        className="bg-green-700 border-green-600 text-orange-100 focus:border-orange-600"
                      />
                    ) : (
                      <div className="p-3 bg-green-700 rounded-lg border border-green-600">
                        <span className="text-lg font-semibold text-orange-100">{formatCurrency(value)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-green-700">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-300">Projected Yearly:</span>
                  <span className="text-xl font-bold text-orange-400">{formatCurrency(projectedYearlyExpenses)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Projections */}
        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income Projection */}
            <Card className="bg-green-800 border border-green-700">
              <CardHeader className="flex flex-row items-center justify-between border-b border-green-700">
                <CardTitle className="text-lg font-bold text-orange-100">Income Projection</CardTitle>
                {editingSection !== 'projections' ? (
                  <Button 
                    onClick={() => handleEdit('projections')} 
                    variant="outline" 
                    size="sm"
                    className="border-green-600 text-green-300 hover:bg-green-700 hover:text-orange-100"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm" className="border-green-600 text-green-300 hover:bg-green-700">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label className="text-green-300">Projected Yearly Income</Label>
                  {editingSection === 'projections' ? (
                    <Input
                      type="number"
                      value={tempData.yearlyProjected.income}
                      onChange={(e) => updateYearlyProjection('income', e.target.value)}
                      className="bg-green-700 border-green-600 text-orange-100 focus:border-orange-600"
                    />
                  ) : (
                    <div className="p-3 bg-green-700 rounded-lg border border-green-600">
                      <span className="text-lg font-semibold text-orange-100">{formatCurrency(data.yearlyProjected.income)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-300">Actual to Date (YTD)</Label>
                  <div className="p-3 bg-green-700 rounded-lg border border-green-600">
                    <span className="text-lg font-semibold text-orange-200">{formatCurrency(actualIncomeYTD)}</span>
                    <span className="text-sm text-green-300 block mt-1">Through {monthsCompleted} months</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg border ${actualVsProjectedIncome >= 0 ? 'bg-green-700 border-green-600' : 'bg-orange-900/30 border-orange-700'}`}>
                  <span className="font-medium text-green-300">vs. Projected:</span>
                  <Badge 
                    variant={actualVsProjectedIncome >= 0 ? 'default' : 'destructive'}
                    className={actualVsProjectedIncome >= 0 ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-red-600 text-white'}
                  >
                    {actualVsProjectedIncome >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {formatCurrency(Math.abs(actualVsProjectedIncome))} {actualVsProjectedIncome >= 0 ? 'ahead' : 'behind'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Expense Projection */}
            <Card className="bg-green-800 border border-green-700">
              <CardHeader className="border-b border-green-700">
                <CardTitle className="text-lg font-bold text-orange-100">Expense Projection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label className="text-green-300">Projected Yearly Expenses</Label>
                  {editingSection === 'projections' ? (
                    <Input
                      type="number"
                      value={tempData.yearlyProjected.expenses}
                      onChange={(e) => updateYearlyProjection('expenses', e.target.value)}
                      className="bg-green-700 border-green-600 text-orange-100 focus:border-orange-600"
                    />
                  ) : (
                    <div className="p-3 bg-green-700 rounded-lg border border-green-600">
                      <span className="text-lg font-semibold text-orange-100">{formatCurrency(data.yearlyProjected.expenses)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-green-300">Actual Expenses YTD</Label>
                  <div className="p-3 bg-green-700 rounded-lg border border-green-600">
                    <span className="text-lg font-semibold text-orange-400">{formatCurrency(monthlyExpenseTotal * monthsCompleted)}</span>
                    <span className="text-sm text-green-300 block mt-1">Through {monthsCompleted} months</span>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg border ${actualVsProjectedExpenses <= 0 ? 'bg-green-700 border-green-600' : 'bg-orange-900/30 border-orange-700'}`}>
                  <span className="font-medium text-green-300">vs. Projected:</span>
                  <Badge 
                    variant={actualVsProjectedExpenses <= 0 ? 'default' : 'destructive'}
                    className={actualVsProjectedExpenses <= 0 ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-red-600 text-white'}
                  >
                    {actualVsProjectedExpenses <= 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                    {formatCurrency(Math.abs(actualVsProjectedExpenses))} {actualVsProjectedExpenses <= 0 ? 'under' : 'over'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
