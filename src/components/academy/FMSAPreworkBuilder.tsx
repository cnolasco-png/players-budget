import { Fragment } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Download, RefreshCw } from "lucide-react";
import { useFMSAPrework } from "@/hooks/useFMSAPrework";
import { cn } from "@/lib/utils";

export default function FMSAPreworkBuilder() {
  const prework = useFMSAPrework();
  const { state, totals } = prework;

  return (
    <section className="space-y-8">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Starting Line Builder</CardTitle>
            <CardDescription>
              Capture cash, obligations, schedule and income before Day 1. Everything autosaves to your device.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={prework.exportText}>
              <Download className="mr-2 h-4 w-4" />
              Summary TXT
            </Button>
            <Button variant="outline" size="sm" onClick={prework.exportJson}>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
            <Button variant="ghost" size="sm" onClick={prework.resetState}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Cash on hand</p>
            <div className="mt-3 space-y-3">
              {state.accounts.map((account) => (
                <div
                  key={account.id}
                  className="grid gap-2 rounded-xl border border-muted bg-muted/20 p-3 sm:grid-cols-[1.4fr,0.6fr]"
                >
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Account</Label>
                    <Input
                      value={account.account}
                      onChange={(event) => prework.updateAccount(account.id, { account: event.target.value })}
                      placeholder="Account / wallet name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Currency</Label>
                    <Input
                      value={account.currency}
                      onChange={(event) => prework.updateAccount(account.id, { currency: event.target.value })}
                      placeholder="USD"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Balance</Label>
                    <Input
                      type="number"
                      value={account.balance}
                      onChange={(event) =>
                        prework.updateAccount(account.id, { balance: Number(event.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Notes</Label>
                    <Input
                      value={account.notes ?? ""}
                      onChange={(event) => prework.updateAccount(account.id, { notes: event.target.value })}
                      placeholder="Usage or category"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prework.removeAccount(account.id)}
                      aria-label="Remove account"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={prework.addAccount}>
                <Plus className="mr-2 h-4 w-4" /> Add account
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground">Debts &amp; loans</p>
            <div className="mt-3 space-y-3">
              {state.debts.map((debt) => (
                <div key={debt.id} className="grid gap-2 rounded-xl border border-muted bg-muted/20 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Type</Label>
                      <Input
                        value={debt.type}
                        onChange={(event) => prework.updateDebt(debt.id, { type: event.target.value })}
                        placeholder="Credit card, travel loan..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Lender</Label>
                      <Input
                        value={debt.lender}
                        onChange={(event) => prework.updateDebt(debt.id, { lender: event.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Balance</Label>
                      <Input
                        type="number"
                        value={debt.balance}
                        onChange={(event) =>
                          prework.updateDebt(debt.id, { balance: Number(event.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">APR %</Label>
                      <Input
                        type="number"
                        value={debt.apr}
                        onChange={(event) => prework.updateDebt(debt.id, { apr: Number(event.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Monthly</Label>
                      <Input
                        type="number"
                        value={debt.monthly}
                        onChange={(event) =>
                          prework.updateDebt(debt.id, { monthly: Number(event.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">End date (optional)</Label>
                    <Input
                      type="date"
                      value={debt.endDate ?? ""}
                      onChange={(event) => prework.updateDebt(debt.id, { endDate: event.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prework.removeDebt(debt.id)}
                      aria-label="Remove debt"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={prework.addDebt}>
                <Plus className="mr-2 h-4 w-4" /> Add debt/loan
              </Button>
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Monthly fixed costs</p>
              <div className="mt-3 space-y-3">
                {state.fixedCosts.map((cost) => (
                  <div key={cost.id} className="grid gap-2 sm:grid-cols-[1.2fr,0.4fr,0.2fr]">
                    <Input
                      value={cost.label}
                      onChange={(event) => prework.updateFixedCost(cost.id, { label: event.target.value })}
                      placeholder="Housing, insurance..."
                    />
                    <Input
                      type="number"
                      value={cost.amount}
                      onChange={(event) =>
                        prework.updateFixedCost(cost.id, { amount: Number(event.target.value) })
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        value={cost.currency ?? "USD"}
                        onChange={(event) =>
                          prework.updateFixedCost(cost.id, { currency: event.target.value })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => prework.removeFixedCost(cost.id)}
                        aria-label="Remove cost"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={prework.addFixedCost}>
                  <Plus className="mr-2 h-4 w-4" /> Add fixed cost
                </Button>
                <p className="text-xs text-muted-foreground">
                  Total fixed spend: <span className="font-semibold text-foreground">${totals.fixed.toLocaleString()}</span>
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Variable spend notes</p>
              <Textarea
                className="mt-3 h-full"
                value={state.variableNotes}
                onChange={(event) => prework.setVariableNotes(event.target.value)}
                placeholder="Meals, travel heuristics, physio rates, etc."
              />
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Season schedule</p>
            <div className="mt-3 space-y-3">
              {state.schedule.map((entry) => (
                <div
                  key={entry.id}
                  className="grid gap-2 rounded-xl border border-muted bg-muted/20 p-3 md:grid-cols-[0.6fr,1fr,1fr,0.4fr]"
                >
                  <Input
                    value={entry.month}
                    onChange={(event) => prework.updateScheduleEntry(entry.id, { month: event.target.value })}
                    placeholder="Month"
                  />
                  <Input
                    value={entry.region}
                    onChange={(event) => prework.updateScheduleEntry(entry.id, { region: event.target.value })}
                    placeholder="Region"
                  />
                  <Input
                    value={entry.events}
                    onChange={(event) => prework.updateScheduleEntry(entry.id, { events: event.target.value })}
                    placeholder="Target events"
                  />
                  <Select
                    value={entry.priority}
                    onValueChange={(value: "A" | "B" | "C") =>
                      prework.updateScheduleEntry(entry.id, { priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="md:col-span-4">
                    <Input
                      value={entry.notes ?? ""}
                      onChange={(event) => prework.updateScheduleEntry(entry.id, { notes: event.target.value })}
                      placeholder="Travel / housing notes"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prework.removeScheduleEntry(entry.id)}
                      aria-label="Remove schedule entry"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={prework.addScheduleEntry}>
                <Plus className="mr-2 h-4 w-4" /> Add schedule entry
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground">Income (last 12 months)</p>
            <div className="mt-3 space-y-3">
              {state.income.map((entry) => (
                <div key={entry.id} className="grid gap-2 rounded-xl border border-muted bg-muted/20 p-3 md:grid-cols-4">
                  <Input
                    value={entry.stream}
                    onChange={(event) => prework.updateIncomeEntry(entry.id, { stream: event.target.value })}
                    placeholder="Stream"
                  />
                  <Input
                    type="number"
                    value={entry.gross}
                    onChange={(event) =>
                      prework.updateIncomeEntry(entry.id, { gross: Number(event.target.value) })
                    }
                    placeholder="Gross"
                  />
                  <Input
                    type="number"
                    value={entry.withholding}
                    onChange={(event) =>
                      prework.updateIncomeEntry(entry.id, { withholding: Number(event.target.value) })
                    }
                    placeholder="Withholding"
                  />
                  <Input
                    type="number"
                    value={entry.net}
                    onChange={(event) =>
                      prework.updateIncomeEntry(entry.id, { net: Number(event.target.value) })
                    }
                    placeholder="Net"
                  />
                  <div className="md:col-span-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prework.removeIncomeEntry(entry.id)}
                      aria-label="Remove income entry"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={prework.addIncomeEntry}>
                <Plus className="mr-2 h-4 w-4" /> Add income stream
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Gross: <span className="font-semibold text-foreground">${totals.gross.toLocaleString()}</span> · Net:{" "}
              <span className="font-semibold text-foreground">${totals.net.toLocaleString()}</span>
            </p>
          </div>
        </CardContent>

        <Separator />

        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Beliefs</p>
            <div className="mt-3 space-y-3">
              {state.beliefs.map((belief) => (
                <div
                  key={belief.id}
                  className={cn(
                    "grid gap-2 rounded-xl border p-3",
                    belief.helpful ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60",
                  )}
                >
                  <Input
                    value={belief.belief}
                    onChange={(event) => prework.updateBelief(belief.id, { belief: event.target.value })}
                    placeholder={belief.helpful ? "Helpful belief" : "Unhelpful belief"}
                  />
                  {!belief.helpful && (
                    <Input
                      value={belief.reframe ?? ""}
                      onChange={(event) => prework.updateBelief(belief.id, { reframe: event.target.value })}
                      placeholder="Reframe to action"
                    />
                  )}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prework.removeBelief(belief.id)}
                      aria-label="Remove belief"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => prework.addBelief(false)}>
                  <Plus className="mr-2 h-4 w-4" /> Add unhelpful belief
                </Button>
                <Button variant="outline" size="sm" onClick={() => prework.addBelief(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add helpful belief
                </Button>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Stress triggers &amp; responses</p>
            <div className="mt-3 space-y-3">
              {state.stressTriggers.map((entry) => (
                <div key={entry.id} className="grid gap-2 rounded-xl border border-muted p-3">
                  <Input
                    value={entry.trigger}
                    onChange={(event) => prework.updateStressTrigger(entry.id, { trigger: event.target.value })}
                    placeholder="Trigger"
                  />
                  <Input
                    value={entry.response}
                    onChange={(event) => prework.updateStressTrigger(entry.id, { response: event.target.value })}
                    placeholder="Planned response"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prework.removeStressTrigger(entry.id)}
                      aria-label="Remove trigger"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={prework.addStressTrigger}>
                <Plus className="mr-2 h-4 w-4" /> Add trigger
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>
            Last updated{" "}
            <span className="font-medium text-foreground">
              {new Date(state.lastUpdated).toLocaleString()}
            </span>
          </div>
          <div>
            Save/print this report, then continue to Day 1 tasks inside the course. Pre-work lives locally on this device.
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}
