import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/lib/finance.functions";
import { useServerFn } from "@tanstack/react-start";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Configurações — FinPME" },
      { name: "description", content: "Atualize seus dados de perfil." },
    ],
  }),
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const updateFn = useServerFn(updateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateFn({ data: { full_name: fullName, company_name: companyName } });
    setLoading(false);
    toast.success("Perfil atualizado");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seus dados de perfil e empresa.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Atualize seu nome e nome da empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                placeholder="Sua empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Escolha entre tema claro e escuro.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="darkMode">Tema escuro</Label>
              <p className="text-sm text-muted-foreground">
                Reduz o brilho da tela em ambientes com pouca luz.
              </p>
            </div>
            <Switch
              id="darkMode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
