import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDRE } from "@/lib/finance.functions";

const dreQuery = {
  queryKey: ["dre"],
  queryFn: () => getDRE(),
};

export const Route = createFileRoute("/_authenticated/dre")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dreQuery),
  component: DREPage,
  head: () => ({
    meta: [
      { title: "DRE — FinPME" },
      { name: "description", content: "Demonstração do Resultado do Exercício simplificada." },
    ],
  }),
});

function DREPage() {
  const { data } = useSuspenseQuery(dreQuery);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DRE Simplificada</h1>
        <p className="text-muted-foreground">Demonstração do Resultado do Exercício para {data.period}.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Resumo do período</CardTitle>
          <CardDescription>Baseado nos lançamentos pagos do mês atual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DRELine label="Receita Bruta" value={data.receitaBruta} positive />
          <DRELine label="(-) Despesas Operacionais" value={data.despesasOperacionais} />
          <Separator />
          <DRELine label="Resultado Líquido" value={data.resultadoLiquido} highlight />
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Margem líquida: {" "}
              <span className={data.margem >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                {data.margem.toFixed(2)}%
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DRELine({
  label,
  value,
  positive,
  highlight,
}: {
  label: string;
  value: number;
  positive?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={highlight ? "font-semibold" : ""}>{label}</span>
      <span
        className={`font-mono ${
          highlight
            ? value >= 0
              ? "text-emerald-600"
              : "text-rose-600"
            : positive
              ? "text-emerald-600"
              : ""
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
