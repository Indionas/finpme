import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  getCustomers,
} from "@/lib/finance.functions";
import { useServerFn } from "@tanstack/react-start";

const transactionsQuery = {
  queryKey: ["transactions"],
  queryFn: () => getTransactions(),
};

const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: () => getCategories(),
};

const customersQuery = {
  queryKey: ["customers"],
  queryFn: () => getCustomers(),
};

export const Route = createFileRoute("/_authenticated/transactions")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(transactionsQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(customersQuery),
    ]),
  component: TransactionsPage,
  head: () => ({
    meta: [
      { title: "Lançamentos — FinPME" },
      { name: "description", content: "Gerencie receitas e despesas." },
    ],
  }),
});

const emptyForm = {
  id: "",
  type: "income" as "income" | "expense",
  amount: "",
  date: format(new Date(), "yyyy-MM-dd"),
  description: "",
  customer_id: "",
  category_id: "",
  status: "pending" as "paid" | "pending",
};

function TransactionsPage() {
  const queryClient = useQueryClient();
  const { data: transactions } = useSuspenseQuery(transactionsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: customers } = useSuspenseQuery(customersQuery);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  const createFn = useServerFn(createTransaction);
  const updateFn = useServerFn(updateTransaction);
  const deleteFn = useServerFn(deleteTransaction);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount),
    };
    if (isEdit) {
      await updateFn({ data: payload });
      toast.success("Lançamento atualizado");
    } else {
      await createFn({ data: payload });
      toast.success("Lançamento criado");
    }
    setOpen(false);
    setForm(emptyForm);
    setIsEdit(false);
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const handleEdit = (t: any) => {
    setForm({
      id: t.id,
      type: t.type,
      amount: String(t.amount),
      date: t.date,
      description: t.description,
      customer_id: t.customer_id || "",
      category_id: t.category_id || "",
      status: t.status,
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
    await deleteFn({ data: { id } });
    toast.success("Lançamento excluído");
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground">Todas as receitas e despesas do seu negócio.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setForm(emptyForm);
                setIsEdit(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Editar lançamento" : "Novo lançamento"}</DialogTitle>
            </DialogHeader>
            <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Pagamento de serviço"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Select
                    value={form.customer_id || "_none"}
                    onValueChange={(v) => setForm({ ...form, customer_id: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhum</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={form.category_id || "_none"}
                    onValueChange={(v) => setForm({ ...form, category_id: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Nenhuma</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="transaction-form">
                {isEdit ? "Salvar alterações" : "Criar lançamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum lançamento encontrado.
                </TableCell>
              </TableRow>
            )}
            {transactions.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.description}</TableCell>
                <TableCell>{t.customer_name || "—"}</TableCell>
                <TableCell>
                  {t.category_name ? (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: t.category_color || "#e5e7eb" }}
                    >
                      {t.category_name}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{format(parseISO(t.date), "dd/MM/yyyy")}</TableCell>
                <TableCell className={t.type === "income" ? "text-emerald-600" : "text-rose-600"}>
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant={t.status === "paid" ? "default" : "secondary"}>
                    {t.status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
