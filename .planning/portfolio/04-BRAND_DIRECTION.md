# Direção de Marca

## Direção visual dark-first

O portfólio deve parecer editorial tech, limpo e confiável. A base é escura, com alto contraste, tipografia forte e amarelo como acento funcional. O visual precisa ser premium sem parecer gamer, neon ou template genérico de IA.

Princípios:

- Dark-first como experiência principal.
- Layout com bastante respiro, mas sem hero vazio.
- Cards só para projetos e blocos de informação pontuais.
- Seções com hierarquia editorial, não dashboard.
- Poucas cores, usadas com intenção.
- Animações discretas e elegantes.

## Light mode secundário

O light mode deve existir como opção, mas não precisa ser a identidade principal. Ele deve manter o mesmo layout, usando fundo branco/quase branco, texto escuro e amarelo como acento controlado.

## Cores sugeridas com hex

Dark:

- Background: `#050505`
- Surface: `#0D0D0D`
- Surface raised: `#151515`
- Border: `#2A2A2A`
- Text primary: `#F5F5F5`
- Text secondary: `#B8B8B8`
- Text muted: `#7C7C7C`
- Accent yellow: `#F5C542`
- Accent yellow hover: `#FFD968`
- Danger/warning subtle: `#B8871B`

Light:

- Background: `#FAFAF7`
- Surface: `#FFFFFF`
- Surface raised: `#F2F0EA`
- Border: `#DDD8C8`
- Text primary: `#101010`
- Text secondary: `#4A4A4A`
- Text muted: `#727272`
- Accent yellow: `#C58A00`
- Accent yellow hover: `#9F6F00`

## Tipografia sugerida

Opção principal:

- Display/headings: `Space Grotesk`
- Body/UI: `Inter`

Opção alternativa:

- Display/headings: `Geist`
- Body/UI: `Inter`

Direção:

- Headings com peso 600-700.
- Body 400-500.
- Evitar letter spacing negativo.
- Usar tamanhos grandes só no hero e títulos de seção.
- Código, stack e metadados podem usar fonte mono discreta, como `JetBrains Mono`, mas sem exagero.

## Estilo dos cards

- Radius entre 6px e 8px.
- Fundo escuro sólido, sem glassmorphism evidente.
- Borda fina com contraste baixo.
- Hover com borda amarela sutil e leve deslocamento vertical.
- Cards de projetos podem ter uma faixa superior fina amarela ou selo pequeno.
- Evitar sombras grandes, blur pesado e gradientes chamativos.

## Estilo do hero

- Hero editorial, com nome/posicionamento como sinal de primeira tela.
- Fundo escuro limpo com textura quase imperceptível ou grid sutil.
- H1 forte, direto e legível.
- Subtítulo com largura confortável.
- CTAs lado a lado no desktop e empilhados no mobile.
- Pequeno bloco lateral ou linha de metadados com "Projetos", "Stack" e "GitHub", sem virar dashboard.

## Estilo das páginas de projeto

- Layout tipo artigo técnico/editorial.
- Cabeçalho com título, resumo, stack e links.
- Corpo dividido por seções: contexto, problema, solução, decisões, aprendizados e próximos passos.
- Barra lateral opcional no desktop com links, stack e status.
- No mobile, tudo deve ficar em coluna única.
- Usar imagens/screenshot apenas quando existirem e forem verificadas; se não houver, usar blocos de texto bem diagramados.

## Estilo dos botões

Primário:

- Fundo amarelo `#F5C542`.
- Texto preto.
- Radius 6px.
- Peso 600.
- Hover com amarelo mais claro e deslocamento leve.

Secundário:

- Fundo transparente.
- Borda `#2A2A2A`.
- Texto claro no dark e escuro no light.
- Hover com borda amarela.

Ghost:

- Sem borda.
- Usar para links internos menores.
- Hover com sublinhado ou mudança de cor controlada.

## Animações permitidas

- Fade/slide curto ao entrar na viewport.
- Hover leve em cards e botões.
- Transição de tema suave.
- Linha ou acento amarelo expandindo discretamente.
- Scroll behavior suave, respeitando `prefers-reduced-motion`.

## Animações proibidas

- Neon pulsando.
- Efeitos gamer.
- Partículas, blobs, orbs ou bokeh decorativo.
- Glassmorphism pesado.
- Texto que gira, pula ou pisca.
- Parallax agressivo.
- Animações que atrasem leitura ou prejudiquem acessibilidade.

## Referências descritivas para implementação no Gemini

- "Editorial tech dark-first, como uma página de case study premium, não dashboard SaaS."
- "Preto, branco e amarelo; amarelo como marcador de atenção, não como fundo dominante."
- "Cards só para projetos e metadados, com borda fina, fundo sólido e hierarquia clara."
- "Mobile-first real: textos legíveis, CTAs grandes o suficiente e seções sem excesso de colunas."
- "Visual profissional para recrutador: sóbrio, moderno e direto."
- "Evitar estética de IA genérica: nada de gradientes roxos, orbs, glass exagerado ou ilustração abstrata."
