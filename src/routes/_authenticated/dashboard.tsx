import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  AlertCircle,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDashboardSummary,
  getMonthlyEvolution,
  getPendingTransactions,
} from "@/lib/finance.functions";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const summaryQueryOptions = {
  queryKey: ["dashboard", "summary"],
  queryFn: () => getDashboardSummary(),
};

const evolutionQueryOptions = {
  queryKey: ["dashboard", "evolution"],
  queryFn: () => getMonthlyEvolution(),
};

const pendingQueryOptions = {
  queryKey: ["dashboard", "pending"],
  queryFn: () => getPendingTransactions(),
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(summaryQueryOptions),
      context.queryClient.ensureQueryData(evolutionQueryOptions),
      context.queryClient.ensureQueryData(pendingQueryOptions),
    ]),
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — FinPME" },
      { name: "description", content: "Visão geral da saúde financeira da sua empresa." },
    ],
  }),
});

function DashboardPage() {
  const { data: summary } = useSuspenseQuery(summaryQueryOptions);
  const { data: evolution } = useSuspenseQuery(evolutionQueryOptions);
  const { data: pending } = useSuspenseQuery(pendingQueryOptions);

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe a saúde financeira da sua empresa.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/transactions">
              <Plus className="mr-2 h-4 w-4" />
              Novo lançamento
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receitas do mês"
          value={summary.monthIncome}
          trend={summary.incomeTrend}
          icon={ArrowUpRight}
          variant="positive"
        />
        <MetricCard
          title="Despesas do mês"
          value={summary.monthExpense}
          trend={summary.expenseTrend}
          icon={ArrowDownRight}
          variant="negative"
        />
        <MetricCard
          title="Saldo líquido"
          value={summary.monthBalance}
          icon={Wallet}
          variant={summary.monthBalance >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="Pendências"
          value={summary.pendingAmount}
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução mensal</CardTitle>
            <CardDescription>Receitas vs despesas dos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => label}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contas pendentes</CardTitle>
            <CardDescription>Lançamentos em aberto de {currentMonth}.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pending.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma conta pendente. Ótimo!</p>
              )}
              {pending.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.date), "dd/MM/yyyy")} · {item.type === "income" ? "Receita" : "Despesa"}
                    </p>
                  </div>
                  <span className={item.type === "income" ? "text-emerald-600" : "text-rose-600"}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  variant,
}: {
  title: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  variant: "positive" | "negative" | "warning";
}) {
  const variantClasses = {
    positive: "text-emerald-600 bg-emerald-50",
    negative: "text-rose-600 bg-rose-50",
    warning: "text-amber-600 bg-amber-50",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${variantClasses[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground">
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}% vs mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
