# Checklist de performance mobile

Use este checklist antes de publicar mudancas visuais relevantes.

## Scroll e pintura

- [ ] Testar `npm run build` e `npm run start -- -p 3000`, nao apenas `next dev`.
- [ ] Abrir a home em largura mobile entre 360px e 430px.
- [ ] Rolar do topo ao rodape sem tocar em botoes; observar travadas em entrada de secoes.
- [ ] Evitar `backdrop-filter` em elementos `fixed`/`sticky` no mobile.
- [ ] Evitar blur decorativo grande (`blur-[80px]+`) no mobile.
- [ ] Evitar `transition-all`; preferir `opacity`, `transform`, `color`, `background-color` e `border-color`.
- [ ] Nao animar `width`, `height`, `top`, `left`, `box-shadow` ou `filter` durante scroll.
- [ ] Manter animacoes infinitas fora do mobile, salvo quando forem essenciais.

## Imagens e fontes

- [ ] Usar `next/image` para screenshots.
- [ ] Conferir `sizes` das imagens em mobile.
- [ ] Nao usar `priority` em imagens abaixo da dobra.
- [ ] Preferir WebP/AVIF quando imagens passarem de algumas centenas de KiB.
- [ ] Manter `next/font` para fontes self-hosted e evitar fontes externas adicionais.

## Auditoria

- [ ] Rodar Lighthouse mobile em producao local.
- [ ] Registrar LCP, CLS, TBT, Speed Index e payload total.
- [ ] Confirmar que CLS permanece 0 ou proximo disso.
- [ ] Se houver queixa de micro lag, gravar Performance no Chrome DevTools com CPU throttling 4x.
- [ ] No celular real, validar com Chrome remoto em `chrome://inspect` quando possivel.

