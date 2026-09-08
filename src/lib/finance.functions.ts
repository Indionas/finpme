import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";

const customerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().nonnegative(),
  date: z.string(),
  description: z.string().min(1),
  status: z.enum(["paid", "pending"]),
});

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "expense"]),
  color: z.string().optional().or(z.literal("")),
});

function ensureCategories(userId: string, supabase: any) {
  const defaults = [
    { name: "Vendas", type: "income", color: "#10b981" },
    { name: "Serviços", type: "income", color: "#3b82f6" },
    { name: "Aluguel", type: "expense", color: "#ef4444" },
    { name: "Salários", type: "expense", color: "#f59e0b" },
    { name: "Impostos", type: "expense", color: "#8b5cf6" },
    { name: "Fornecedores", type: "expense", color: "#ec4899" },
    { name: "Outros", type: "expense", color: "#6b7280" },
  ];
    return supabase.from("categories").insert(
      defaults.map((c) => ({ ...c, user_id: userId, color: c.color || null }))
    );
}

export const getDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const now = new Date();
    const start = startOfMonth(now).toISOString();
    const end = endOfMonth(now).toISOString();
    const prevStart = startOfMonth(subMonths(now, 1)).toISOString();
    const prevEnd = endOfMonth(subMonths(now, 1)).toISOString();

    const { data: current, error: cErr } = await context.supabase
      .from("transactions")
      .select("type, amount, status")
      .gte("date", start.slice(0, 10))
      .lte("date", end.slice(0, 10));
    if (cErr) throw cErr;

    const { data: previous, error: pErr } = await context.supabase
      .from("transactions")
      .select("type, amount, status")
      .gte("date", prevStart.slice(0, 10))
      .lte("date", prevEnd.slice(0, 10));
    if (pErr) throw pErr;

    const sum = (rows: any[], type: string) =>
      rows
        .filter((r) => r.type === type && r.status === "paid")
        .reduce((acc, r) => acc + Number(r.amount), 0);

    const monthIncome = sum(current, "income");
    const monthExpense = sum(current, "expense");
    const prevIncome = sum(previous, "income");
    const prevExpense = sum(previous, "expense");

    const { data: pending, error: penErr } = await context.supabase
      .from("transactions")
      .select("amount, type")
      .eq("status", "pending");
    if (penErr) throw penErr;

    const pendingIncome = pending
      .filter((r) => r.type === "income")
      .reduce((acc, r) => acc + Number(r.amount), 0);
    const pendingExpense = pending
      .filter((r) => r.type === "expense")
      .reduce((acc, r) => acc + Number(r.amount), 0);

    return {
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
      pendingAmount: pendingExpense - pendingIncome,
      incomeTrend: prevIncome > 0 ? ((monthIncome - prevIncome) / prevIncome) * 100 : 0,
      expenseTrend: prevExpense > 0 ? ((monthExpense - prevExpense) / prevExpense) * 100 : 0,
    };
  });

export const getMonthlyEvolution = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    const result = [];
    for (const m of months) {
      const start = startOfMonth(m).toISOString().slice(0, 10);
      const end = endOfMonth(m).toISOString().slice(0, 10);
      const { data, error } = await context.supabase
        .from("transactions")
        .select("type, amount, status")
        .gte("date", start)
        .lte("date", end);
      if (error) throw error;
      const income = data
        .filter((r) => r.type === "income" && r.status === "paid")
        .reduce((acc, r) => acc + Number(r.amount), 0);
      const expense = data
        .filter((r) => r.type === "expense" && r.status === "paid")
        .reduce((acc, r) => acc + Number(r.amount), 0);
      result.push({
        month: format(m, "MMM/yy", { locale: { code: "pt-BR" } as any }),
        income,
        expense,
      });
    }
    return result;
  });

export const getPendingTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const start = startOfMonth(new Date()).toISOString().slice(0, 10);
    const end = endOfMonth(new Date()).toISOString().slice(0, 10);
    const { data, error } = await context.supabase
      .from("transactions")
      .select("id, description, date, amount, type, status")
      .eq("status", "pending")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })
      .limit(10);
    if (error) throw error;
    return data || [];
  });

export const getCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    if (!data || data.length === 0) {
      await ensureCategories(context.userId, context.supabase);
      const { data: refreshed, error: rErr } = await context.supabase
        .from("categories")
        .select("*")
        .order("name");
      if (rErr) throw rErr;
      return refreshed || [];
    }
    return data;
  });

export const createCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => categorySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("categories")
      .insert({ name: data.name, type: data.type, color: data.color || null, user_id: context.userId });
    if (error) throw error;
    return { ok: true };
  });

export const getCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("customers")
      .select("*")
      .order("name");
    if (error) throw error;
    return data || [];
  });

function normalizeCustomer(data: z.infer<typeof customerSchema>) {
  return {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    document: data.document || null,
    status: data.status,
  };
}

export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => customerSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("customers")
      .insert({ ...normalizeCustomer(data), user_id: context.userId });
    if (error) throw error;
    return { ok: true };
  });

export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => customerSchema.required({ id: true }).parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await context.supabase
      .from("customers")
      .update(normalizeCustomer(rest))
      .eq("id", id!)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("customers")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const getTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("transactions")
      .select("*, customers(name), categories(name, color)")
      .order("date", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data || []).map((t: any) => ({
      ...t,
      customer_name: t.customers?.name,
      category_name: t.categories?.name,
      category_color: t.categories?.color,
    }));
  });

export const createTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => transactionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const payload: any = { ...rest, user_id: context.userId };
    if (!payload.customer_id) payload.customer_id = null;
    if (!payload.category_id) payload.category_id = null;
    const { error } = await context.supabase.from("transactions").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const updateTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => transactionSchema.required({ id: true }).parse(data))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const payload: any = { ...rest };
    if (!payload.customer_id) payload.customer_id = null;
    if (!payload.category_id) payload.category_id = null;
    const { error } = await context.supabase
      .from("transactions")
      .update(payload)
      .eq("id", id!)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("transactions")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const getDRE = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const now = new Date();
    const start = startOfMonth(now).toISOString().slice(0, 10);
    const end = endOfMonth(now).toISOString().slice(0, 10);
    const { data, error } = await context.supabase
      .from("transactions")
      .select("type, amount, status")
      .gte("date", start)
      .lte("date", end);
    if (error) throw error;

    const receitaBruta = data
      .filter((r) => r.type === "income")
      .reduce((acc, r) => acc + Number(r.amount), 0);
    const despesasOperacionais = data
      .filter((r) => r.type === "expense")
      .reduce((acc, r) => acc + Number(r.amount), 0);
    const resultadoLiquido = receitaBruta - despesasOperacionais;

    return {
      period: format(now, "MMMM 'de' yyyy", { locale: { code: "pt-BR" } as any }),
      receitaBruta,
      despesasOperacionais,
      resultadoLiquido,
      margem: receitaBruta > 0 ? (resultadoLiquido / receitaBruta) * 100 : 0,
    };
  });

export const getAgingReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("transactions")
      .select("amount, type, status, customers(id, name)")
      .eq("status", "pending");
    if (error) throw error;

    const byCustomer: Record<string, { name: string; toReceive: number; toPay: number }> = {};
    for (const t of data || []) {
      const cid = t.customers?.id || "_none";
      const name = t.customers?.name || "Sem cliente";
      if (!byCustomer[cid]) byCustomer[cid] = { name, toReceive: 0, toPay: 0 };
      if (t.type === "income") byCustomer[cid].toReceive += Number(t.amount);
      else byCustomer[cid].toPay += Number(t.amount);
    }

    return Object.values(byCustomer).sort((a, b) => b.toReceive - a.toReceive);
  });
