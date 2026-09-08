import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAgingReport } from "@/lib/finance.functions";

const agingQuery = {
  queryKey: ["reports", "aging"],
  queryFn: () => getAgingReport(),
};

export const Route = createFileRoute("/_authenticated/reports")({
  loader: ({ context }) => context.queryClient.ensureQueryData(agingQuery),
  component: ReportsPage,
  head: () => ({
    meta: [
      { title: "Relatórios — FinPME" },
      { name: "description", content: "Relatórios de inadimplência e contas pendentes." },
    ],
  }),
});

function ReportsPage() {
  const { data } = useSuspenseQuery(agingQuery);

  const totalToReceive = data.reduce((acc, c) => acc + c.toReceive, 0);
  const totalToPay = data.reduce((acc, c) => acc + c.toPay, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Acompanhe valores pendentes por cliente.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalToReceive)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">A pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{formatCurrency(totalToPay)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalToReceive - totalToPay)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inadimplência por cliente</CardTitle>
          <CardDescription>Valores em aberto vinculados a cada cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">A receber</TableHead>
                <TableHead className="text-right">A pagar</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma conta pendente.
                  </TableCell>
                </TableRow>
              )}
              {data.map((c: any) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right text-emerald-600">{formatCurrency(c.toReceive)}</TableCell>
                  <TableCell className="text-right text-rose-600">{formatCurrency(c.toPay)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(c.toReceive - c.toPay)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
