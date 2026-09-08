import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Recuperar senha — FinPME" },
      { name: "description", content: "Redefina sua senha FinPME" },
    ],
  }),
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setMode("reset");
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Enviamos um link de recuperação para seu e-mail.");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha redefinida com sucesso!");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          F
        </div>
        <span className="text-2xl font-semibold tracking-tight">FinPME</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        {mode === "request" ? (
          <>
            <h1 className="text-xl font-semibold">Recuperar senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Digite seu e-mail para receber o link de redefinição.
            </p>
            <form onSubmit={handleRequest} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Nova senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">Escolha uma nova senha forte.</p>
            <form onSubmit={handleReset} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Redefinir senha
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link to="/auth" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
