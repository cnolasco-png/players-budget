import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Camera, Clock, Upload, Lock, DollarSign } from "lucide-react";

interface QuickAddProps {
  isProUser: boolean;
  onAddExpense: (expense: { amount: number; description: string; category: string; date: string }) => void;
  onAddIncome: (income: { amount: number; description: string; category: string; date: string }) => void;
}

interface RecentItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
  lastUsed: string;
}

const QuickAdd = ({ isProUser, onAddExpense, onAddIncome }: QuickAddProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const { toast } = useToast();

  // Mock recent items - replace with real data
  const recentItems: RecentItem[] = [
    { id: '1', description: 'Hotel night', amount: 120, category: 'lodging', type: 'expense', lastUsed: '2024-01-15' },
    { id: '2', description: 'Flight booking', amount: 450, category: 'flights', type: 'expense', lastUsed: '2024-01-14' },
    { id: '3', description: 'Tournament entry', amount: 180, category: 'entries', type: 'expense', lastUsed: '2024-01-13' },
    { id: '4', description: 'Prize money', amount: 2500, category: 'prize', type: 'income', lastUsed: '2024-01-12' },
    { id: '5', description: 'Coaching session', amount: 100, category: 'coaching', type: 'expense', lastUsed: '2024-01-11' },
    { id: '6', description: 'Meals', amount: 35, category: 'meals', type: 'expense', lastUsed: '2024-01-10' },
  ];

  const categories = {
    expense: ['flights', 'lodging', 'meals', 'ground', 'entries', 'coaching', 'stringing', 'misc'],
    income: ['prize', 'sponsors', 'coaching', 'other']
  };

  const handleRecentItemClick = (item: RecentItem) => {
    const newItem = {
      amount: item.amount,
      description: item.description,
      category: item.category,
      date: new Date().toISOString().split('T')[0]
    };

    if (item.type === 'expense') {
      onAddExpense(newItem);
    } else {
      onAddIncome(newItem);
    }

    toast({
      title: "Transaction added",
      description: `${item.type === 'expense' ? 'Expense' : 'Income'} of $${item.amount} added successfully.`,
    });

    setIsOpen(false);
  };

  const handleCustomSubmit = () => {
    if (!amount || !description || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      amount: parseFloat(amount),
      description,
      category,
      date: new Date().toISOString().split('T')[0]
    };

    if (type === 'expense') {
      onAddExpense(newItem);
    } else {
      onAddIncome(newItem);
    }

    toast({
      title: "Transaction added",
      description: `${type === 'expense' ? 'Expense' : 'Income'} of $${amount} added successfully.`,
    });

    // Reset form
    setAmount("");
    setDescription("");
    setCategory("");
    setIsOpen(false);
  };

  const handleReceiptUpload = async (file: File) => {
    if (!isProUser) {
      toast({
        title: "Pro feature",
        description: "Receipt scanning is available with Pro membership.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingOCR(true);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const result = await response.json();
      
      // Pre-fill form with OCR results
      setAmount(result.amount?.toString() || "");
      setDescription(result.description || "");
      setCategory(result.category || "");
      setActiveTab("custom");

      toast({
        title: "Receipt processed",
        description: "Information extracted from receipt. Please review and submit.",
      });

    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "Processing failed",
        description: "Could not process receipt. Please enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const InlineUpsell = () => (
    <div className="p-4 text-center border-2 border-dashed border-muted rounded-lg">
      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium mb-2">Receipt Scanning</p>
      <p className="text-xs text-muted-foreground mb-3">
        Automatically extract expense details from photos
      </p>
      <Button variant="outline" size="sm">
        Try Pro (7 days)
      </Button>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="fixed bottom-6 right-6 group">
          {/* Always visible label */}
          <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-emerald-800 text-white text-sm rounded-lg shadow-lg border border-emerald-600 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Add Expense/Income</span>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-emerald-800"></div>
          </div>
          
          <Button 
            size="lg" 
            className="h-20 w-20 rounded-full shadow-xl bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 hover:scale-105 transition-all duration-300 border-2 border-amber-300/50 ring-2 ring-amber-400/30"
          >
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 text-white drop-shadow-sm mb-0.5" />
              <span className="text-xs font-semibold text-white/90 leading-none">ADD</span>
            </div>
          </Button>
        </div>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-green-700">
            <Plus className="w-5 h-5" />
            Quick Add Transaction
          </SheetTitle>
          <SheetDescription className="text-base">
            🏆 Add tournament expenses, prize money, and sponsor payments instantly
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent" className="text-xs">
                <Clock className="w-4 h-4 mr-1" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="receipt" className="text-xs">
                <Camera className="w-4 h-4 mr-1" />
                Receipt
                {isProUser && <Badge variant="secondary" className="ml-1 text-xs">Pro</Badge>}
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs">
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">Quick add from your recent transactions</p>
              {recentItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRecentItemClick(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.category} • {item.lastUsed}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${item.type === 'income' ? 'text-emerald-600' : 'text-foreground'}`}>
                        {item.type === 'income' ? '+' : '-'}${item.amount}
                      </p>
                      <Badge variant={item.type === 'income' ? 'default' : 'secondary'} className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="receipt" className="space-y-4 mt-4">
              {isProUser ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Upload a receipt to automatically extract details</p>
                  
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])}
                      className="hidden"
                      id="receipt-upload"
                      disabled={isProcessingOCR}
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      {isProcessingOCR ? (
                        <div className="space-y-2">
                          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm">Processing receipt...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                          <p className="text-sm font-medium">Upload Receipt</p>
                          <p className="text-xs text-muted-foreground">
                            Tap to select photo from camera or gallery
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <InlineUpsell />
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(value: 'expense' | 'income') => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What was this for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[type].map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCustomSubmit} className="w-full">
                  Add {type === 'expense' ? 'Expense' : 'Income'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuickAdd;
