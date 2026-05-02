# Spec: Solicitação leve de orçamento

## Objetivo

Criar um caminho discreto para contratação sem transformar o portfolio em sistema, CRM ou funil agressivo.

O objetivo final é simples:

> Cliente preenche → eu recebo organizado no Discord privado → eu continuo pelo WhatsApp.

O WhatsApp direto continua sempre visível como alternativa principal para quem prefere conversar, está em dúvida ou não quer preencher formulário.

## Direção de produto

A experiência deve parecer uma continuação natural do portfolio, não uma ferramenta pesada de orçamento. O CTA pode abrir um modal curto ou levar para `/contratar`, mas a interface deve manter a home limpa.

Opções disponíveis:

1. **Solicitar Landing Page Local**
   - Plano existente: `R$ 200 a R$ 300`.
   - Fluxo curto.
   - Não pergunta faixa de investimento.

2. **Solicitar Site com Painel / Cardápio Editável**
   - Plano existente: `A partir de R$ 500`.
   - Fluxo curto.
   - Não pergunta faixa de investimento.

3. **Solicitar orçamento personalizado**
   - Para projetos fora dos pacotes, com escopo maior, integrações, automações, páginas extras ou necessidades específicas.
   - Fluxo um pouco mais completo.
   - Pergunta faixa de investimento.

## Interface

A home deve preservar uma chamada clara de WhatsApp e um CTA discreto para solicitação estruturada.

Texto sugerido:

> Quer começar com calma?
>
> Se você já sabe o que precisa, envie uma solicitação organizada. Se ainda está decidindo, pode me chamar direto no WhatsApp.

Ações:

- **Montar solicitação**
- **Chamar no WhatsApp**

Se a implementação usar modal, ele deve ser curto, em etapas e sem cara de formulário longo. Se usar `/contratar`, a página deve ser simples e parecer parte do portfolio.

Texto de apoio no formulário:

> Preencha o essencial para eu entender o projeto. Os campos opcionais ajudam a reduzir perguntas depois.

Mensagem final para o cliente:

> Solicitação recebida. Vou analisar com calma e entro em contato pelo WhatsApp informado.

## Fluxos

### Pacotes

Fluxo curto:

1. **Contato**
   - Nome.
   - WhatsApp.
   - Aceite para contato pelo WhatsApp.

2. **Projeto**
   - Objetivo principal.
   - Prazo desejado.
   - Se já tem textos, imagens ou logo.

3. **Extras opcionais**
   - Nome da marca ou empresa.
   - Site ou Instagram atual.
   - Referências.
   - Itens desejados.
   - Observações finais.

### Orçamento personalizado

Fluxo completo, mas ainda leve:

1. **Contato**
   - Nome.
   - WhatsApp.
   - Aceite para contato pelo WhatsApp.

2. **Projeto**
   - Tipo de projeto.
   - Objetivo principal.
   - Prazo desejado.

3. **Escopo**
   - Faixa de investimento.
   - Itens desejados.
   - Integrações ou necessidades específicas.

4. **Contexto opcional**
   - Nome da marca ou empresa.
   - Site ou Instagram atual.
   - Referências.
   - Se já tem textos, imagens ou logo.
   - Quem vai aprovar o projeto.
   - Observações finais.

## Campos obrigatórios e opcionais

### Pacotes

Obrigatórios:

- Nome.
- WhatsApp.
- Pacote escolhido, preenchido automaticamente.
- Objetivo principal.
- Prazo desejado.
- Se já tem textos, imagens ou logo.
- Aceite para contato pelo WhatsApp.

Opcionais:

- Nome da marca ou empresa.
- Site ou Instagram atual.
- Referências.
- Itens desejados.
- Observações finais.

### Orçamento personalizado

Obrigatórios:

- Nome.
- WhatsApp.
- Tipo de projeto.
- Objetivo principal.
- Prazo desejado.
- Faixa de investimento.
- Itens desejados.
- Aceite para contato pelo WhatsApp.

Opcionais:

- Nome da marca ou empresa.
- Site ou Instagram atual.
- Referências.
- Integrações ou necessidades específicas.
- Se já tem textos, imagens ou logo.
- Quem vai aprovar o projeto.
- Observações finais.

## Linguagem dos checkboxes

Os checkboxes devem usar linguagem de cliente, sem termos técnicos. Opções sugeridas:

- WhatsApp.
- Mapa.
- Galeria.
- Serviços/preços.
- Depoimentos.
- Formulário.
- Cardápio/produtos editáveis.
- Painel para editar depois.
- Ainda não sei.

Essas opções podem alimentar internamente campos mais técnicos, mas o cliente só deve ver linguagem simples.

## Payload

O formulário deve gerar um payload normalizado para envio ao Discord.

```ts
type BudgetRequestKind = "package_landing" | "package_editable" | "custom";

type ClientFacingOption =
  | "whatsapp"
  | "map"
  | "gallery"
  | "services_prices"
  | "testimonials"
  | "form"
  | "editable_menu_products"
  | "admin_panel"
  | "not_sure";

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
    contentStatus?: string;
    budgetRange?: string;
    selectedOptions: ClientFacingOption[];
    specificNeeds?: string;
    references?: string;
    approvalContact?: string;
    notes?: string;
  };
  metadata: {
    submittedAt: string;
    sourcePage: string;
    userAgent?: string;
  };
};
```

Regras do payload:

- `budgetRange` só deve ser obrigatório em `custom`.
- `selectedPackage` deve vir preenchido automaticamente nos pacotes.
- `selectedOptions` deve aceitar `not_sure` para não travar cliente indeciso.
- Campos opcionais vazios não bloqueiam envio.

## Análise interna para Discord

A análise continua existindo, mas é privada. Ela não deve aparecer para o cliente como cálculo, pontuação, complexidade, preço automático ou diagnóstico.

O Discord deve receber:

- Dados do cliente.
- Tipo de solicitação.
- Pacote escolhido, quando houver.
- Resumo do projeto.
- Itens selecionados.
- Prazo.
- Faixa de investimento, apenas no personalizado.
- Campos opcionais preenchidos.
- Campos importantes que ficaram vazios.
- Observações internas sobre encaixe e próximos pontos para perguntar.

### Regras internas para pacotes

Pacotes devem gerar uma leitura simples:

- O pedido parece caber no pacote.
- O pedido talvez precise virar personalizado.
- O pedido precisa de pergunta antes de responder.

Alertas úteis:

- Landing Page Local com pedido de painel, cardápio editável, produtos editáveis ou muitas funcionalidades.
- Site com Painel pedido para algo simples demais.
- Prazo muito curto.
- Cliente ainda não tem textos, imagens ou logo.
- Cliente marcou "ainda não sei".

### Regras internas para personalizado

O personalizado deve ajudar a montar a primeira resposta no WhatsApp.

O Discord deve destacar:

- O que o cliente quer.
- O que parece essencial.
- O que parece opcional.
- O que pode aumentar escopo.
- O que falta perguntar.
- Se a faixa de investimento parece compatível com o que foi pedido.

Não é necessário mostrar score, nota, nível de complexidade ou valor estimado automático.

## Mensagem no Discord

Formato sugerido:

```md
Novo pedido de orçamento

Tipo: Orçamento personalizado
Pacote: -

Cliente:
- Nome: ...
- WhatsApp: ...

Projeto:
- Objetivo: ...
- Prazo: ...
- Itens desejados: WhatsApp, mapa, galeria
- Conteúdo: ...
- Faixa informada: ...
- Referências: ...
- Observações: ...

Análise privada:
- Encaixe: ...
- Pontos para perguntar: ...
- Atenções: ...
- Próximo passo sugerido: chamar pelo WhatsApp
```

## Tratamento de erro

Se o envio para o Discord falhar, a interface deve oferecer uma saída simples:

> Não consegui enviar sua solicitação agora. Você pode tentar novamente ou me chamar pelo WhatsApp.

Detalhes técnicos não devem aparecer para o cliente.

## Restrições

- Não mostrar cálculo ao cliente.
- Não mostrar pontuação ao cliente.
- Não mostrar complexidade ao cliente.
- Não mostrar preço automático ao cliente.
- Não perguntar faixa de investimento nos pacotes.
- Não transformar a home em sistema ou dashboard.
- Não remover o WhatsApp direto.
- Não exigir conta, login ou cadastro.
- Não prometer resposta automática.
- Não criar automação de aceite ou recusa para o cliente no MVP.

## Critérios de aceite

- O portfolio continua limpo.
- O WhatsApp direto continua visível como alternativa principal.
- O cliente consegue montar uma solicitação sem sair de um fluxo leve.
- Pacotes usam `Contato → Projeto → Extras opcionais`.
- Orçamento personalizado usa `Contato → Projeto → Escopo → Contexto opcional`.
- Pacotes não pedem faixa de investimento.
- Checkboxes usam linguagem simples de cliente.
- O cliente recebe apenas confirmação simples.
- O Discord privado recebe o pedido organizado com análise interna.
- A continuação acontece pelo WhatsApp.
