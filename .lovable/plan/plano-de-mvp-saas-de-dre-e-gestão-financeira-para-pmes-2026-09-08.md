# Plano de MVP — SaaS de DRE e Gestão Financeira para PMEs

## Objetivo
Construir um produto SaaS inicial que permita ao dono de uma PME acompanhar a saúde financeira do negócio de forma simples: cadastrar clientes, registrar receitas e despesas, visualizar renda mensal, inadimplência e uma DRE simplificada automatizada.

## Público-alvo
Pequenas e médias empresas (PMEs) que ainda não usam sistemas financeiros robustos e precisam de clareza sem complexidade.

## Escopo do MVP

### 1. Infraestrutura
- Ativar Lovable Cloud (banco de dados, autenticação e armazenamento).
- Configurar autenticação por e-mail/senha.
- Criar tabela de perfis (`profiles`) vinculada ao usuário autenticado.

### 2. Banco de dados
- Tabela `customers`: clientes da PME (nome, e-mail, telefone, documento, status).
- Tabela `transactions`: receitas e despesas (tipo, valor, data, descrição, categoria, cliente vinculado, status pago/pendente).
- Tabela `categories`: categorias financeiras (receita/despesa, nome, cor).
- RLS para garantir que cada usuário acesse apenas seus próprios dados.

### 3. Funcionalidades da aplicação
- **Landing page pública**: apresenta o produto, captura e-mail para lista de espera ou direciona para cadastro.
- **Autenticação**: cadastro, login, logout e recuperação de senha.
- **Dashboard**: cards de saldo, receitas e despesas do mês; gráfico de evolução mensal; lista de contas pendentes.
- **Clientes**: CRUD de clientes da PME.
- **Lançamentos**: CRUD de receitas e despesas, com vínculo a cliente e status pago/pendente.
- **DRE simplificada**: geração automática com base nos lançamentos (receitas, custos, despesas operacionais, resultado líquido).
- **Relatório de inadimplência**: lista de clientes com valores pendentes e total em aberto.

### 4. Design e experiência
- Interface limpa, direta e em português.
- Cores sóbrias e profissionais (adequadas para produto financeiro).
- Gráficos simples para evolução de receitas/despesas e composição de despesas.
- Navegação clara: Dashboard, Clientes, Lançamentos, DRE, Relatórios.

### 5. Modelo de negócio inicial
- Versão gratuita com limites (ex.: até 50 lançamentos/mês).
- Página de planos para futura cobrança (ex.: R$ 29/mês para uso ilimitado).
- A cobrança em si será implementada em uma fase posterior, após validação.

## Entregáveis deste plano
- Aplicação web publicada e funcional.
- Banco de dados com tabelas e segurança configurada.
- Sistema de autenticação funcionando.
- Dashboard, Clientes, Lançamentos, DRE e Relatório de inadimplência.
- Landing page pública explicando o produto.

## Próximos passos após o MVP
- Testar com 3–5 donos de PME reais.
- Coletar feedback e ajustar fluxos.
- Adicionar importação de planilhas/extratos bancários.
- Implementar pagamentos e planos pagos.
