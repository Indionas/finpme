import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/finance.functions";
import { useServerFn } from "@tanstack/react-start";

const customersQuery = {
  queryKey: ["customers"],
  queryFn: () => getCustomers(),
};

export const Route = createFileRoute("/_authenticated/customers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(customersQuery),
  component: CustomersPage,
  head: () => ({
    meta: [
      { title: "Clientes — FinPME" },
      { name: "description", content: "Cadastre e gerencie seus clientes." },
    ],
  }),
});

const emptyForm = {
  id: "",
  name: "",
  email: "",
  phone: "",
  document: "",
  status: "active" as "active" | "inactive",
};

function CustomersPage() {
  const queryClient = useQueryClient();
  const { data: customers } = useSuspenseQuery(customersQuery);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isEdit, setIsEdit] = useState(false);

  const createFn = useServerFn(createCustomer);
  const updateFn = useServerFn(updateCustomer);
  const deleteFn = useServerFn(deleteCustomer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateFn({ data: form });
      toast.success("Cliente atualizado");
    } else {
      await createFn({ data: form });
      toast.success("Cliente criado");
    }
    setOpen(false);
    setForm(emptyForm);
    setIsEdit(false);
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  const handleEdit = (c: any) => {
    setForm({
      id: c.id,
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      document: c.document || "",
      status: c.status,
    });
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir este cliente?")) return;
    await deleteFn({ data: { id } });
    toast.success("Cliente excluído");
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Cadastre seus clientes para vincular aos lançamentos.</p>
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
              Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            </DialogHeader>
            <form id="customer-form" onSubmit={handleSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome do cliente"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <Input
                    id="document"
                    placeholder="CPF/CNPJ"
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="customer-form">
                {isEdit ? "Salvar alterações" : "Criar cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            )}
            {customers.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email || "—"}</TableCell>
                <TableCell>{c.phone || "—"}</TableCell>
                <TableCell>{c.document || "—"}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "active" ? "default" : "secondary"}>
                    {c.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
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
