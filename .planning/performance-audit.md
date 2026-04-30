# Auditoria de performance mobile - scroll

Data: 2026-04-30

## Resumo executivo

O portfolio e um app Next.js 16 / React 19 / Tailwind CSS 4 com App Router, paginas estaticas e poucos componentes client-side. O micro lag percebido no mobile tem maior probabilidade de vir de custo de pintura durante scroll, nao de excesso de estado React: havia header fixo com `backdrop-blur-xl`, listener de scroll sem `passive`/`requestAnimationFrame`, blobs decorativos com blur de 100-150px, `transition-all` em elementos interativos, sombras fortes e efeitos de glassmorphism tambem ativos em telas pequenas.

Depois das correcoes, a auditoria Lighthouse mobile melhorou de 0.83 para 0.95, TBT caiu de 440ms para 60ms e o trabalho de main thread caiu de 2.4s para 1.1s. O teste sintetico de scroll em Chrome headless com viewport 390x844 e CPU throttling 4x ficou em aproximadamente 60 FPS antes e depois; ele nao reproduziu o micro lag real do aparelho, entao a validacao final ainda deve incluir gravacao manual no Chrome DevTools ou no celular real.

## Baseline medida

Ambiente:
- Build de producao: `npm run build`
- Servidor: `npm run start -- -p 3000`
- URL testada: `http://localhost:3000/`
- Lighthouse mobile: viewport 390x844, DPR 3, throttling simulado
- Scroll sintetico: Chrome headless via DevTools Protocol, viewport 390x844, CPU throttling 4x

Antes:
- Lighthouse mobile performance: 0.83
- LCP: 3.1s
- CLS: 0
- TBT: 440ms
- Speed Index: 1.4s
- FCP: 1.0s
- Main-thread work: 2.4s
- Payload total reportado: 299 KiB
- Scroll sintetico: ~59.8 FPS, p95 16.7ms, 0 frames > 50ms, 0 long tasks

Depois:
- Lighthouse mobile performance: 0.95
- LCP: 2.9s
- CLS: 0
- TBT: 60ms
- Speed Index: 1.0s
- FCP: 0.9s
- Main-thread work: 1.1s
- Payload total reportado: 300 KiB
- Scroll sintetico: ~60.0 FPS, p95 16.7ms, 0 frames > 50ms, 0 long tasks

Nao medido:
- INP real: nao existe INP confiavel em laboratorio sem interacoes reais de usuarios.
- FPS em aparelho fisico: o ambiente local usou Chrome headless, que nao reproduz GPU/thermal throttling de celulares de entrada.
- PageSpeed remoto: nao foi usado porque o alvo auditado era localhost.

## Principais causas provaveis do micro lag

### P0 - Header fixo com blur pesado no mobile

Evidencia:
- `src/components/layout/header.tsx` usava `fixed`, listener de `scroll` e estado React.
- No estado scrollado, aplicava `bg-background/70 backdrop-blur-xl border-b shadow-sm`.

Impacto:
- `backdrop-filter` em elemento fixo no topo pode forcar recomposicao/pintura durante scroll em GPUs fracas.
- O listener rodava a cada evento de scroll e chamava `setScrolled`, mesmo quando o valor visual nao mudava.

Risco de mexer:
- Baixo. O comportamento visual e o estado scrollado continuam existindo; o blur forte fica preservado em desktop.

Correcao aplicada:
- Listener `passive` com `requestAnimationFrame`.
- `setScrolled` so quando cruza o threshold.
- Mobile usa fundo solido/translucido sem `backdrop-blur`; desktop mantem `md:backdrop-blur-xl`.

### P0 - Blobs decorativos com blur gigante no mobile

Evidencia:
- `src/app/page.tsx` tinha decorativos `blur-[150px]` e `blur-[100px]`.

Impacto:
- Blur grande em areas amplas aumenta custo de rasterizacao/pintura, principalmente em scroll sobre composicoes escuras.

Risco de mexer:
- Baixo a medio. O visual premium depende de atmosfera, mas o efeito e decorativo.

Correcao aplicada:
- Reducao/desativacao de filtros no mobile via `.mobile-paint-lite`.
- Mantido blur maior a partir de `sm`.

### P0 - Background grid global no mobile

Evidencia:
- `src/app/globals.css` aplicava duas camadas de `linear-gradient` no `body` inteiro.

Impacto:
- Background procedural no documento inteiro pode gerar repaint em scroll em aparelhos fracos.

Risco de mexer:
- Baixo. O dark premium ainda e mantido por cores, contraste e radial sutil.

Correcao aplicada:
- Removido grid no mobile; mantido background mais simples.

### P1 - `transition-all` em componentes frequentes

Evidencia:
- `FadeIn`, `ProjectCard`, botoes, `ThemeToggle`, cards de navegacao e thumbnails usavam `transition-all`.

Impacto:
- `transition-all` deixa o browser monitorar propriedades caras e facilita animar propriedades erradas sem perceber.

Risco de mexer:
- Baixo. Troca por listas explicitas preserva UX.

Correcao aplicada:
- Transicoes limitadas a `opacity`, `transform`, `color`, `background-color`, `border-color` e, quando necessario, `box-shadow`.
- Hover com translate/shadow pesado restrito para `md` em cards e botoes.

### P1 - Hover, shadows e glassmorphism ativos em superficies mobile

Evidencia:
- Cards tinham hover translate + shadow grande.
- Botoes tinham glow/shadow hover.
- Chips e controles da galeria tinham `backdrop-blur-sm`.

Impacto:
- Em mobile, hover nao agrega valor operacional e pode manter CSS caro na cascata.

Risco de mexer:
- Baixo. Desktop preserva o acabamento.

Correcao aplicada:
- Efeitos de hover pesados viraram `md:hover:*`.
- Backdrop blur da galeria e chips removido em mobile e preservado em breakpoints maiores.
- Sombras fortes reduzidas em mobile.

### P1 - Imagens da galeria

Evidencia:
- Galeria usa screenshots PNG locais de 131-557 KiB.
- `ScreenshotGallery` marcava a imagem atual com `priority={currentIndex === 0}`, mesmo a galeria ficando abaixo do conteudo no estudo de caso.
- Lightbox usava `quality={90}`.

Impacto:
- Preload/priority de imagem abaixo da dobra compete com recursos criticos.
- Qualidade alta aumenta bytes/processamento para telas que nao precisam disso.

Risco de mexer:
- Medio-baixo. Alterar qualidade pode afetar nitidez, mas os valores continuam conservadores.

Correcao aplicada:
- Removido `priority` da imagem da galeria.
- `sizes` mobile ajustado para `92vw`.
- Qualidade reduzida para 82 na galeria e 85 no lightbox.

### P2 - Animacoes infinitas pequenas

Evidencia:
- Dots no header e badge usavam `animate-pulse`.

Impacto:
- Opacity animation e barata, mas em celular de entrada toda animacao permanente compete com scroll.

Risco de mexer:
- Baixo.

Correcao aplicada:
- Pulse fica ativo apenas em `md` e respeita `motion-reduce`.

## Decisao importante: `content-visibility`

Foi testado `content-visibility: auto` nas secoes longas. Ele melhorou a metrica inicial de Lighthouse, mas no traco sintetico criou renderizacao tardia durante scroll em algumas secoes. Como o problema reportado e micro lag ao rolar, a solucao final usa apenas `contain: paint` em secoes longas, sem lazy-render de secoes inteiras.

## Plano de correcao por impacto

1. P0 concluido: reduzir custo de pintura do header fixo mobile.
2. P0 concluido: remover blur/decoracao pesada no mobile.
3. P0 concluido: simplificar background global mobile.
4. P1 concluido: trocar `transition-all` por propriedades explicitas.
5. P1 concluido: limitar hover/shadow/glassmorphism pesado para desktop/tablet.
6. P1 concluido: ajustar `next/image` na galeria abaixo da dobra.
7. P2 concluido: reduzir animacoes infinitas em mobile.
8. P2 recomendado: gravar Performance no Chrome DevTools em aparelho Android real para confirmar frames dropped/GPU paint.

## Validacao executada

- `npm run lint`: passou.
- `npm run build`: passou.
- Lighthouse mobile depois: passou com performance 0.95.
- Scroll sintetico depois: ~60 FPS, 0 long tasks e 0 frames acima de 50ms.
- Screenshot mobile local capturado em `.planning/mobile-after.png` para inspecao visual.

