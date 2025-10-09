import React from 'react';
import ExpenseManager from '@/components/editor/ExpenseManager';
import { useBudgetData } from '@/hooks/use-budget-data';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // user selection and budget are handled in Editor; this page will navigate to editor for now
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Expenses</h1>
      <p className="text-sm text-muted-foreground">Manage your expense log from the editor page.</p>
      <div className="mt-6">
        <button className="btn" onClick={() => navigate('/editor')}>Open editor</button>
      </div>
    </main>
  );
};

export default ExpensesPage;
