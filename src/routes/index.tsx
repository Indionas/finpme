import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Receipt,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "FinPME — Gestão financeira para PMEs" },
      {
        name: "description",
        content:
          "FinPME é a solução simples de DRE automática, controle de clientes, receitas, despesas e relatórios para pequenas e médias empresas.",
      },
      { property: "og:title", content: "FinPME — Gestão financeira para PMEs" },
      {
        property: "og:description",
        content:
          "Controle financeiro simplificado com DRE automática, clientes, lançamentos e relatórios.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              F
            </div>
            <span className="text-xl font-semibold tracking-tight">FinPME</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground">
              Como funciona
            </a>
            <a href="#preco" className="text-sm text-muted-foreground hover:text-foreground">
              Preço
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Teste grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Feito para donos de PME
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              A clareza financeira que sua empresa precisa
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              FinPME transforma lançamentos simples em DRE automática, controle de clientes e
              relatórios de inadimplência — tudo em português e sem planilhas complexas.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Começar gratuitamente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#como-funciona">Ver como funciona</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="recursos" className="border-t bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Tudo que você precisa para controlar o dinheiro</h2>
              <p className="mt-3 text-muted-foreground">
                Ferramentas pensadas para quem não tem tempo de aprender sistemas complicados.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Receipt className="h-6 w-6" />}
                title="Lançamentos simples"
                description="Registre receitas e despesas em segundos, com vinculação a clientes e categorias."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="DRE automática"
                description="Veja sua Demonstração do Resultado do Exercício atualizada automaticamente."
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Cadastro de clientes"
                description="Mantenha a base de clientes organizada e acompanhe o histórico financeiro."
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="Gráficos e evolução"
                description="Acompanhe receitas, despesas e saldo mensal em visualizações claras."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Relatório de inadimplência"
                description="Saiba quem deve e quanto, para cobrar no momento certo."
              />
              <FeatureCard
                icon={<Receipt className="h-6 w-6" />}
                title="Sem planilhas"
                description="Diga adeus às fórmulas quebradas. Tudo centralizado e seguro na nuvem."
              />
            </div>
          </div>
        </section>

        <section id="como-funciona" className="px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Comece em 3 passos</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Step number={1} title="Crie sua conta" description="Cadastro rápido com e-mail e senha." />
              <Step number={2} title="Cadastre clientes e lançamentos" description="Insira seus dados financeiros de forma simples." />
              <Step number={3} title="Acompanhe a DRE e relatórios" description="Tome decisões com base em números claros." />
            </div>
          </div>
        </section>

        <section id="preco" className="border-t bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold">Gratuito no início</h2>
            <p className="mt-3 text-muted-foreground">
              Use o FinPME sem custo enquanto validamos juntos. Depois, planos acessíveis para PMEs.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link to="/auth">Criar conta grátis</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-sm text-muted-foreground">© 2026 FinPME. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Termos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
