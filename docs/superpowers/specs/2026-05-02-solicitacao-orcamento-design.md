# Spec: Solicitação de orçamento com análise interna

## Objetivo

Criar um caminho discreto no portfolio para visitantes que querem pedir orçamento sem iniciar conversa imediata no WhatsApp. A home continua limpa e focada em portfolio; o formulário aparece apenas quando o usuário escolhe montar uma solicitação.

O sistema não calcula nem promete preço final para o cliente. Ele coleta dados suficientes para reduzir conversas posteriores e envia uma análise interna para o Discord, ajudando a decidir se o pedido vale resposta, se precisa de perguntas adicionais ou se deve ser recusado.

## Decisão de produto

A seção de planos deve oferecer três caminhos:

1. **Landing Page Local**
   - Plano existente: `R$ 200 a R$ 300`.
   - Ação: solicitar este pacote.
   - Fluxo curto, com pacote já selecionado.

2. **Site com Painel / Cardápio Editável**
   - Plano existente: `A partir de R$ 500`.
   - Ação: solicitar este pacote.
   - Fluxo curto, com pacote já selecionado.

3. **Solicitar orçamento personalizado**
   - Para projetos fora dos pacotes, com escopo maior, integrações, automações, mais páginas ou necessidade específica.
   - Fluxo um pouco mais completo.
   - Usado para análise interna de complexidade, não para preço automático ao cliente.

A opção de WhatsApp direto continua existindo para quem prefere conversar, não sabe preencher o formulário ou quer tirar dúvidas antes.

## Interface

Na área dos planos, cada plano pode ter uma ação de solicitação estruturada. A página também deve preservar uma chamada de WhatsApp visível e simples.

O formulário deve abrir em um **modal curto em etapas**, com fundo do site atrás. O modal não deve exigir rolagem em condições normais de desktop e deve evitar sensação de formulário longo no mobile.

Texto sugerido antes do formulário:

> Preencha o essencial para eu entender o projeto. Campos opcionais ajudam a reduzir perguntas depois.

Texto sugerido para campos opcionais:

> Quanto mais contexto vier agora, menos perguntas posso precisar fazer depois.

Mensagem final para o cliente:

> Solicitação recebida. Vou analisar com calma e entro em contato pelo WhatsApp informado se fizer sentido avançarmos.

## Estrutura do modal

O modal deve ser guiado por etapas curtas. A etapa inicial depende da origem do clique.

### Fluxo para pacotes

Origem:

- `package_landing`
- `package_editable`

Etapas:

1. **Contato**
   - Nome.
   - WhatsApp.
   - Consentimento para contato via WhatsApp.

2. **Projeto**
   - Objetivo principal.
   - Prazo desejado.
   - Situação do conteúdo.

3. **Contexto opcional**
   - Nome da marca ou empresa.
   - Site ou Instagram atual.
   - Referências.
   - Observações finais.

### Fluxo para orçamento personalizado

Origem:

- `custom`

Etapas:

1. **Contato**
   - Nome.
   - WhatsApp.
   - Consentimento para contato via WhatsApp.

2. **Projeto**
   - Tipo de projeto.
   - Objetivo principal.
   - Prazo desejado.

3. **Escopo**
   - Faixa de investimento.
   - Funcionalidades principais desejadas.
   - Integrações desejadas.

4. **Contexto opcional**
   - Nome da marca ou empresa.
   - Site ou Instagram atual.
   - Referências.
   - Conteúdo disponível.
   - Quem decide o projeto.
   - Observações finais.

## Campos obrigatórios e opcionais

### Pacotes

Obrigatórios:

- Nome.
- WhatsApp.
- Pacote escolhido, preenchido automaticamente.
- Objetivo principal do site.
- Prazo desejado.
- Situação do conteúdo.
- Aceite para contato pelo WhatsApp.

Opcionais:

- Nome da marca ou empresa.
- Site ou Instagram atual.
- Referências de sites.
- Observações finais.

### Orçamento personalizado

Obrigatórios:

- Nome.
- WhatsApp.
- Tipo de projeto.
- Objetivo principal.
- Prazo desejado.
- Faixa de investimento.
- Funcionalidades principais desejadas.
- Aceite para contato pelo WhatsApp.

Opcionais:

- Nome da marca ou empresa.
- Site ou Instagram atual.
- Referências.
- Integrações desejadas.
- Conteúdo disponível.
- Quem decide o projeto.
- Observações finais.

## Payload de entrada

O formulário deve produzir um payload normalizado, independentemente da origem.

```ts
type BudgetRequestKind = "package_landing" | "package_editable" | "custom";

type BudgetRequestPayload = {
  kind: BudgetRequestKind;
  selectedPackage?: {
    title: string;
    priceLabel: string;
  };
  contact: {
    name: string;
    whatsapp: string;
    whatsappConsent: boolean;
  };
  project: {
    businessName?: string;
    currentUrlOrSocial?: string;
    projectType?: string;
    mainGoal: string;
    desiredDeadline: string;
    budgetRange?: string;
    contentStatus?: string;
    desiredFeatures?: string[];
    integrations?: string[];
    references?: string;
    decisionMaker?: string;
    notes?: string;
  };
  metadata: {
    submittedAt: string;
    sourcePage: string;
    userAgent?: string;
  };
};
```

## Cálculo interno do orçamento

O cálculo é apenas uma **análise interna**, enviada para o Discord. Ele não deve aparecer como valor final para o cliente.

Saídas esperadas:

- `leadPotential`: `low`, `medium` ou `high`.
- `estimatedComplexity`: `low`, `medium` ou `high`.
- `fit`: `package_fit`, `custom_fit`, `needs_clarification` ou `poor_fit`.
- `urgency`: `normal`, `soon` ou `urgent`.
- `riskFlags`: lista de alertas.
- `missingFields`: lista de campos úteis que ficaram vazios.
- `suggestedNextAction`: `accept_contact`, `ask_more`, `decline` ou `manual_review`.
- `internalSummary`: resumo curto para leitura rápida no Discord.

### Regras para pacotes

Pacotes não precisam de orçamento automático. O cálculo deve comparar o pedido com o pacote escolhido.

Sinais de bom encaixe:

- Objetivo combina com o pacote.
- Prazo é compatível com o prazo estimado do plano.
- Conteúdo já existe ou está parcialmente pronto.
- Pedido não adiciona funcionalidades fora do escopo.
- Observações são claras.

Sinais de alerta:

- Cliente escolhe Landing Page Local, mas pede painel, login, edição de produtos ou automação.
- Cliente escolhe Site com Painel, mas descreve demanda muito simples.
- Prazo é muito curto.
- Conteúdo está ausente.
- Observações indicam escopo indefinido.

Classificação:

- `package_fit`: pacote escolhido parece suficiente.
- `needs_clarification`: pacote pode servir, mas faltam detalhes.
- `custom_fit`: pedido parece maior que o pacote escolhido.
- `poor_fit`: pedido tem sinais de desalinhamento forte.

### Regras para personalizado

O personalizado usa uma pontuação interna simples.

Complexidade começa em `low` e sobe por sinais de escopo:

- Muitas funcionalidades desejadas.
- Integrações com serviços externos.
- Login, painel, pagamentos, automações ou área administrativa.
- Conteúdo inexistente ou indefinido.
- Prazo urgente.
- Objetivo pouco claro.

Potencial do lead sobe quando:

- Faixa de investimento é compatível com o escopo.
- Objetivo é claro.
- Cliente enviou referências.
- Conteúdo está pronto ou parcialmente pronto.
- Prazo é realista.

Potencial do lead cai quando:

- Faixa de investimento é incompatível com o escopo.
- Prazo é urgente e escopo é alto.
- Cliente não sabe explicar objetivo.
- Campos opcionais críticos ficaram vazios.
- Observações sugerem expectativa de projeto grande com orçamento baixo.

### Matriz de decisão interna

| Condição | Próxima ação |
| --- | --- |
| Alto potencial + baixa/média complexidade | `accept_contact` |
| Alto potencial + alta complexidade | `manual_review` |
| Médio potencial + campos importantes faltando | `ask_more` |
| Baixo potencial + muitos alertas | `decline` |
| Qualquer caso ambíguo | `manual_review` |

## Mensagem no Discord

A mensagem no Discord deve ser escaneável e separar dados do cliente, pedido e análise.

Formato sugerido:

```md
Novo pedido de orçamento

Tipo: Site com Painel / Cardápio Editável
Status: Pedido de pacote
Potencial: Médio
Complexidade: Baixa
Encaixe: package_fit
Próxima ação sugerida: accept_contact

Cliente:
- Nome: ...
- WhatsApp: ...

Projeto:
- Objetivo: ...
- Prazo: ...
- Conteúdo: ...
- Faixa: ...
- Funcionalidades: ...
- Referências: ...

Análise interna:
- Resumo: ...
- Alertas: ...
- Campos úteis ausentes: ...
```

## Tratamento de erro

Se o envio para o Discord falhar, o cliente não deve receber detalhes técnicos. A interface deve orientar uma saída simples:

> Não consegui enviar sua solicitação agora. Você pode tentar novamente ou me chamar pelo WhatsApp.

O erro técnico deve ser registrado internamente para depuração.

## Restrições

- Não mostrar preço automático final para o cliente.
- Não prometer resposta automática.
- Não exigir conta, login ou cadastro.
- Não transformar a home em dashboard ou funil agressivo.
- Não remover o caminho de WhatsApp direto.
- Não criar automação de aceite ou recusa para o cliente no MVP.

## Evolução futura

Depois de validar se os pedidos chegam com qualidade, o sistema pode evoluir para:

- Botões internos no Discord: aceitar, pedir mais informações, recusar.
- Registro de status em banco ou planilha.
- Respostas semiautomáticas por WhatsApp, apenas se houver integração confiável.
- Página interna simples para histórico de solicitações.

## Critérios de aceite

- A home continua visualmente limpa.
- O usuário consegue escolher entre WhatsApp direto e solicitação estruturada.
- Pacotes e orçamento personalizado usam o mesmo modal, mas com fluxos adaptados.
- Campos obrigatórios impedem envio incompleto demais.
- Campos opcionais não bloqueiam o cliente.
- O cliente recebe apenas uma confirmação simples.
- O Discord recebe dados completos e análise interna.
- O cálculo interno nunca é apresentado como preço final ao cliente.
