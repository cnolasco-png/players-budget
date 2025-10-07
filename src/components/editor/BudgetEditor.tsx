import { forwardRef, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CategoryRecord, LineItemInsert, LineItemRecord, ScenarioRecord } from "@/hooks/use-budget-data";
import { calculateScenarioTotals, formatCurrency } from "@/lib/budgetCalculations";
import { cn } from "@/lib/utils";
import { TableVirtuoso, type TableVirtuosoHandle } from "react-virtuoso";

interface BudgetEditorProps {
  scenarios: ScenarioRecord[];
  lineItems: LineItemRecord[];
  categories: CategoryRecord[];
  currency?: string | null;
  onUpdateLineItem: (payload: Partial<LineItemRecord> & { id: string }) => Promise<void> | void;
  onAddLineItem: (payload: LineItemInsert) => void;
  isSaving?: boolean;
}

const DEFAULT_NEW_ITEM = {
  label: "",
  qty: 1,
  unit_cost: 0,
  unit: "flat_monthly",
  currency: undefined as string | undefined,
  category_id: undefined as string | undefined,
};

const UNIT_OPTIONS = [
  { value: "flat_monthly", label: "Flat monthly", hint: "Applies once each month." },
  { value: "per_day", label: "Per day", hint: "Qty = number of days per month." },
  { value: "per_night", label: "Per night", hint: "Qty = nights per month." },
  { value: "per_tournament", label: "Per tournament", hint: "Qty = tournaments per month." },
  { value: "per_leg", label: "Per travel leg", hint: "Qty = travel legs or flights." },
];

const CELL_KEYS = ["label", "category_id", "unit", "qty", "unit_cost"] as const;
type CellKey = (typeof CELL_KEYS)[number];
const getCellIndex = (key: CellKey) => CELL_KEYS.indexOf(key);

const VIRTUALIZE_THRESHOLD = 30;
const VIRTUALIZED_ROW_HEIGHT = 76;
const MAX_VIRTUALIZED_HEIGHT = 480;

const VirtuosoTable = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(function VirtuosoTable(
  { className, ...props },
  ref,
) {
  return <table ref={ref} className={cn("table-grid w-full caption-bottom text-sm", className)} {...props} />;
});

const BudgetEditor = ({
  scenarios,
  lineItems,
  categories,
  currency = "USD",
  onUpdateLineItem,
  onAddLineItem,
  isSaving = false,
}: BudgetEditorProps) => {
  const [activeScenarioId, setActiveScenarioId] = useState(() => scenarios[0]?.id ?? "");
  const [newItem, setNewItem] = useState({
    ...DEFAULT_NEW_ITEM,
    category_id: categories[0]?.id,
    currency,
  });
  const [draftLineItems, setDraftLineItems] = useState<Record<string, Partial<LineItemRecord>>>({});
  const cellRefs = useRef<Record<string, Partial<Record<CellKey, HTMLElement | null>>>>({});
  const pendingFocusRef = useRef<{ scenarioId: string; rowIndex: number; cellIndex: number } | null>(null);
  const virtuosoRefs = useRef<Record<string, TableVirtuosoHandle | null>>({});

  useEffect(() => {
    setNewItem((prev) => ({
      ...prev,
      category_id: prev.category_id ?? categories[0]?.id,
      currency: currency ?? prev.currency,
    }));
  }, [categories, currency]);

  const optimisticLineItems = useMemo(
    () => lineItems.map((item) => ({ ...item, ...draftLineItems[item.id] })),
    [lineItems, draftLineItems],
  );

  const scenarioRows = useMemo(() => {
    const map: Record<string, LineItemRecord[]> = {};
    scenarios.forEach((scenario) => {
      map[scenario.id] = optimisticLineItems.filter((item) => item.scenario_id === scenario.id);
    });
    return map;
  }, [scenarios, optimisticLineItems]);

  const originalLineItemMap = useMemo(
    () =>
      lineItems.reduce<Record<string, LineItemRecord>>((acc, current) => {
        acc[current.id] = current;
        return acc;
      }, {}),
    [lineItems],
  );

  const scenarioTotals = useMemo(
    () => calculateScenarioTotals(scenarios, optimisticLineItems as LineItemRecord[]),
    [scenarios, optimisticLineItems],
  );

  const setDraftValue = <K extends keyof LineItemRecord>(id: string, key: K, value: LineItemRecord[K]) => {
    setDraftLineItems((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const clearDraftValue = (id: string, key: keyof LineItemRecord) => {
    setDraftLineItems((prev) => {
      const entry = prev[id];
      if (!entry) return prev;
      const { [key]: _removed, ...restEntry } = entry;
      if (Object.keys(restEntry).length === 0) {
        const { [id]: _omit, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [id]: restEntry,
      };
    });
  };

  useEffect(() => {
    const itemIds = new Set(lineItems.map((item) => item.id));
    Object.keys(cellRefs.current).forEach((id) => {
      if (!itemIds.has(id)) {
        delete cellRefs.current[id];
      }
    });
  }, [lineItems]);

  const registerCellRef = (id: string, key: CellKey) => (node: HTMLElement | null) => {
    if (!cellRefs.current[id]) {
      cellRefs.current[id] = {};
    }
    cellRefs.current[id]![key] = node;
  };

  const focusCell = (scenarioId: string, rowIndex: number, cellIndex: number, attempt = 0) => {
    const rows = scenarioRows[scenarioId] ?? [];
    const targetRow = rows[rowIndex];
    if (!targetRow) return;
    const key = CELL_KEYS[cellIndex];
    if (!key) return;
    const element = cellRefs.current[targetRow.id]?.[key];
    if (element) {
      element.focus();
      return;
    }

    if (attempt >= 4) return;

    const virtuoso = virtuosoRefs.current[scenarioId];
    if (virtuoso) {
      virtuoso.scrollToIndex({ index: rowIndex, align: "center" });
    }

    setTimeout(() => focusCell(scenarioId, rowIndex, cellIndex, attempt + 1), 60);
  };

  const scheduleNextRowFocus = (scenarioId: string, rowIndex: number, cellIndex: number) => {
    pendingFocusRef.current = { scenarioId, rowIndex, cellIndex };
  };

  const resolvePendingFocus = () => {
    const target = pendingFocusRef.current;
    if (!target) return;
    pendingFocusRef.current = null;
    focusCell(target.scenarioId, target.rowIndex, target.cellIndex);
  };

  const handleDirectionalNavigation = (
    event: KeyboardEvent<HTMLElement>,
    scenarioId: string,
    rowIndex: number,
    cellIndex: number,
  ) => {
    const rows = scenarioRows[scenarioId] ?? [];
    if (!rows.length) return;

    let nextRow = rowIndex;
    let nextCell = cellIndex;

    switch (event.key) {
      case "ArrowRight": {
        nextCell = cellIndex + 1;
        if (nextCell >= CELL_KEYS.length) {
          nextCell = 0;
          nextRow = rowIndex + 1;
        }
        break;
      }
      case "ArrowLeft": {
        nextCell = cellIndex - 1;
        if (nextCell < 0) {
          nextCell = CELL_KEYS.length - 1;
          nextRow = rowIndex - 1;
        }
        break;
      }
      case "ArrowDown": {
        nextRow = rowIndex + 1;
        break;
      }
      case "ArrowUp": {
        nextRow = rowIndex - 1;
        break;
      }
      default:
        return;
    }

    event.preventDefault();

    if (nextRow < 0 || nextRow >= rows.length) return;
    if (nextCell < 0 || nextCell >= CELL_KEYS.length) return;

    focusCell(scenarioId, nextRow, nextCell);
  };

  const activeScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0];
  const activeTotal = scenarioTotals.find((entry) => entry.scenario.id === activeScenarioId)?.total ?? 0;

  const handleAddItem = () => {
    if (!activeScenario) return;
    if (!newItem.label.trim()) return;
    const categoryId = newItem.category_id ?? categories[0]?.id;
    if (!categoryId) return;

    onAddLineItem({
      scenario_id: activeScenario.id,
      category_id: categoryId,
      label: newItem.label,
      qty: newItem.qty,
      unit_cost: newItem.unit_cost,
      unit: newItem.unit,
      currency: newItem.currency ?? currency,
      created_at: new Date().toISOString(),
    });
    setNewItem({
      ...DEFAULT_NEW_ITEM,
      category_id: categories[0]?.id,
      currency,
    });
  };

  const virtuosoComponents = useMemo(
    () => ({
      Table: VirtuosoTable,
      TableHead: TableHeader,
      TableBody: TableBody,
      TableRow: TableRow,
    }),
    [],
  );

  const renderHeaderRow = () => (
    <TableRow>
      <TableHead>Line Item</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>
        <div className="flex items-center gap-1">
          <span>Unit</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Choose how this cost applies (per day, per tournament, etc.).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableHead>
      <TableHead className="text-right">Qty</TableHead>
      <TableHead className="text-right">Unit Cost</TableHead>
      <TableHead className="text-right">Monthly</TableHead>
    </TableRow>
  );

  const renderRowCells = (item: LineItemRecord, rowIndex: number, scenarioId: string) => {
    const originalItem = originalLineItemMap[item.id] ?? item;
    const qty = item.qty ?? 1;
    const unitCost = item.unit_cost ?? 0;
    const monthly = qty * unitCost;

    return [
      (
        <TableCell key={`${item.id}-label`} className="font-medium">
          <Input
            value={item.label ?? ""}
            ref={registerCellRef(item.id, "label")}
            onChange={(event) => setDraftValue(item.id, "label", event.target.value)}
            onBlur={async (event) => {
              const value = event.target.value.trim();
              const original = originalItem.label ?? "";
              if (value === original) {
                clearDraftValue(item.id, "label");
                resolvePendingFocus();
                return;
              }
              setDraftValue(item.id, "label", value);
              try {
                await onUpdateLineItem({ id: item.id, label: value });
              } finally {
                clearDraftValue(item.id, "label");
                resolvePendingFocus();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                scheduleNextRowFocus(scenarioId, rowIndex + 1, getCellIndex("label"));
                event.currentTarget.blur();
                return;
              }
              handleDirectionalNavigation(event, scenarioId, rowIndex, getCellIndex("label"));
            }}
          />
        </TableCell>
      ),
      (
        <TableCell key={`${item.id}-category`}>
          <Select
            value={item.category_id ?? undefined}
            onValueChange={async (value) => {
              setDraftValue(item.id, "category_id", value);
              const original = originalItem.category_id ?? "";
              if (value === original) {
                clearDraftValue(item.id, "category_id");
                return;
              }
              try {
                await onUpdateLineItem({ id: item.id, category_id: value });
              } finally {
                clearDraftValue(item.id, "category_id");
              }
            }}
          >
            <SelectTrigger
              ref={registerCellRef(item.id, "category_id")}
              onKeyDown={(event) =>
                handleDirectionalNavigation(event, scenarioId, rowIndex, getCellIndex("category_id"))
              }
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      ),
      (
        <TableCell key={`${item.id}-unit`} className="max-w-[160px]">
          <Select
            value={item.unit ?? "flat_monthly"}
            onValueChange={async (value) => {
              setDraftValue(item.id, "unit", value);
              const original = originalItem.unit ?? "flat_monthly";
              if (value === original) {
                clearDraftValue(item.id, "unit");
                return;
              }
              try {
                await onUpdateLineItem({ id: item.id, unit: value });
              } finally {
                clearDraftValue(item.id, "unit");
              }
            }}
          >
            <SelectTrigger
              ref={registerCellRef(item.id, "unit")}
              onKeyDown={(event) =>
                handleDirectionalNavigation(event, scenarioId, rowIndex, getCellIndex("unit"))
              }
            >
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      ),
      (
        <TableCell key={`${item.id}-qty`} className="text-right">
          <Input
            type="number"
            className="text-right"
            value={qty}
            ref={registerCellRef(item.id, "qty")}
            onChange={(event) => {
              const value = Number(event.target.value) || 0;
              setDraftValue(item.id, "qty", value);
            }}
            onBlur={async (event) => {
              const value = Number(event.target.value) || 0;
              const original = originalItem.qty ?? 1;
              if (value === original) {
                clearDraftValue(item.id, "qty");
                resolvePendingFocus();
                return;
              }
              setDraftValue(item.id, "qty", value);
              try {
                await onUpdateLineItem({ id: item.id, qty: value });
              } finally {
                clearDraftValue(item.id, "qty");
                resolvePendingFocus();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                scheduleNextRowFocus(scenarioId, rowIndex + 1, getCellIndex("qty"));
                event.currentTarget.blur();
                return;
              }
              handleDirectionalNavigation(event, scenarioId, rowIndex, getCellIndex("qty"));
            }}
          />
        </TableCell>
      ),
      (
        <TableCell key={`${item.id}-unitcost`} className="text-right">
          <Input
            type="number"
            className="text-right"
            value={unitCost}
            ref={registerCellRef(item.id, "unit_cost")}
            onChange={(event) => {
              const value = Number(event.target.value) || 0;
              setDraftValue(item.id, "unit_cost", value);
            }}
            onBlur={async (event) => {
              const value = Number(event.target.value) || 0;
              const original = originalItem.unit_cost ?? 0;
              if (value === original) {
                clearDraftValue(item.id, "unit_cost");
                resolvePendingFocus();
                return;
              }
              setDraftValue(item.id, "unit_cost", value);
              try {
                await onUpdateLineItem({ id: item.id, unit_cost: value });
              } finally {
                clearDraftValue(item.id, "unit_cost");
                resolvePendingFocus();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                scheduleNextRowFocus(scenarioId, rowIndex + 1, getCellIndex("unit_cost"));
                event.currentTarget.blur();
                return;
              }
              handleDirectionalNavigation(event, scenarioId, rowIndex, getCellIndex("unit_cost"));
            }}
          />
        </TableCell>
      ),
      (
        <TableCell key={`${item.id}-monthly`} className="text-right font-semibold">
          {formatCurrency(monthly, item.currency ?? currency)}
        </TableCell>
      ),
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Budget Editor</h3>
          <p className="text-sm text-muted-foreground">
            Adjust scenario line items and see totals update instantly.
          </p>
        </div>
        {activeScenario && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Monthly total ({activeScenario.name})</p>
            <p className="text-xl font-semibold">{formatCurrency(activeTotal, currency)}</p>
          </Card>
        )}
      </div>

      <Tabs value={activeScenario?.id} onValueChange={setActiveScenarioId}>
        <TabsList className="flex w-full flex-wrap">
          {scenarios.map((scenario) => (
            <TabsTrigger key={scenario.id} value={scenario.id} className="flex-1 md:flex-none">
              {scenario.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {scenarios.map((scenario) => {
          const rows = scenarioRows[scenario.id] ?? [];
          const total = scenarioTotals.find((entry) => entry.scenario.id === scenario.id)?.total ?? 0;
          const shouldVirtualize = rows.length > VIRTUALIZE_THRESHOLD;
          const tableHeight = Math.min(
            MAX_VIRTUALIZED_HEIGHT,
            Math.max(rows.length, 1) * VIRTUALIZED_ROW_HEIGHT,
          );

          return (
            <TabsContent key={scenario.id} value={scenario.id} className="space-y-4">
              <Card className="p-4">
                {shouldVirtualize ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[760px]">
                      <TableVirtuoso
                        data={rows}
                        ref={(instance) => {
                          virtuosoRefs.current[scenario.id] = instance;
                        }}
                        style={{ height: tableHeight }}
                        components={virtuosoComponents}
                        fixedHeaderContent={renderHeaderRow}
                        itemContent={(index, item) => renderRowCells(item, index, scenario.id)}
                        itemKey={(_index, item) => item.id}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="table-grid w-full">
                      <TableHeader>{renderHeaderRow()}</TableHeader>
                      <TableBody>
                        {rows.map((item, rowIndex) => (
                          <TableRow key={item.id}>{renderRowCells(item, rowIndex, scenario.id)}</TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Save className="h-4 w-4" />
                    Changes save automatically when you leave a field.
                  </div>
                  <p className="text-sm font-semibold">
                    Scenario total: {formatCurrency(total, currency)}
                  </p>
                </div>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {activeScenario && (
        <Card className="p-4">
          <h4 className="text-lg font-semibold mb-3">Add Line Item</h4>
          <div className="grid gap-3 md:grid-cols-12">
            <Input
              className="md:col-span-4"
              placeholder="Label"
              value={newItem.label}
              onChange={(event) => setNewItem((prev) => ({ ...prev, label: event.target.value }))}
            />
            <Select
              value={newItem.category_id ?? categories[0]?.id}
              onValueChange={(value) => setNewItem((prev) => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger className="md:col-span-3">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newItem.unit} onValueChange={(value) => setNewItem((prev) => ({ ...prev, unit: value }))}>
              <SelectTrigger className="md:col-span-2">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              className="md:col-span-2"
              placeholder="Qty"
              value={newItem.qty}
              onChange={(event) =>
                setNewItem((prev) => ({ ...prev, qty: Number(event.target.value) || 0 }))
              }
            />
            <Input
              type="number"
              className="md:col-span-2"
              placeholder="Unit cost"
              value={newItem.unit_cost}
              onChange={(event) =>
                setNewItem((prev) => ({ ...prev, unit_cost: Number(event.target.value) || 0 }))
              }
            />
            <Button
              className="md:col-span-3"
              onClick={handleAddItem}
              disabled={!newItem.label.trim() || isSaving}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add line item
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BudgetEditor;
