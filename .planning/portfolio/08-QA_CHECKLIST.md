# Checklist Final de QA

## Build

- [ ] `npm install` executado sem erro.
- [ ] `npm run lint` passando, se existir.
- [ ] `npm run typecheck` passando, se existir.
- [ ] `npm run build` passando.
- [ ] Sem warnings críticos no build.

## Responsividade

- [ ] Home testada em largura mobile pequena.
- [ ] Home testada em tablet.
- [ ] Home testada em desktop.
- [ ] Páginas de projeto testadas em mobile.
- [ ] Botões não quebram texto.
- [ ] Cards não ficam espremidos.
- [ ] Hero não ocupa a tela inteira sem mostrar continuidade visual.

## Links

- [ ] GitHub principal abre: `https://github.com/bps2414`
- [ ] ChamadaFácil demo abre.
- [ ] ChamadaFácil GitHub abre.
- [ ] Prado Auto Peças site abre.
- [ ] Prado Auto Peças GitHub abre.
- [ ] PTBRMerger GitHub abre.
- [ ] Barbearia da Vila demo abre.
- [ ] Barbearia da Vila GitHub abre.
- [ ] Links externos usam `target="_blank"` e `rel="noopener noreferrer"` quando aplicável.

## GitHub

- [ ] Contato público é apenas GitHub.
- [ ] Nenhum e-mail, telefone ou rede social pessoal foi adicionado.
- [ ] Repositórios citados são públicos.
- [ ] Links de GitHub apontam para os repositórios corretos.

## SEO

- [ ] Home tem title e description.
- [ ] Cada página de projeto tem title e description próprios.
- [ ] Canonical usa o domínio final.
- [ ] `lang="pt-BR"` configurado.
- [ ] Conteúdo principal é indexável sem depender de interação.

## Open Graph

- [ ] `og:title` configurado.
- [ ] `og:description` configurado.
- [ ] `og:type` configurado.
- [ ] Imagem OG existe ou fallback está definido.
- [ ] Imagem OG não usa screenshot sem qualidade ou sem confirmação.

## Sitemap

- [ ] `/sitemap.xml` existe.
- [ ] Inclui `/`.
- [ ] Inclui `/projetos/chamadafacil`.
- [ ] Inclui `/projetos/prado-auto-pecas`.
- [ ] Inclui `/projetos/ptbr-merger`.
- [ ] Inclui `/projetos/barbearia-da-vila`.

## Robots

- [ ] `/robots.txt` existe.
- [ ] Permite indexação.
- [ ] Aponta para sitemap no domínio correto.

## Acessibilidade

- [ ] Foco visível em links e botões.
- [ ] Botão de tema tem label acessível.
- [ ] Estrutura de headings segue ordem lógica.
- [ ] Contraste adequado em dark mode.
- [ ] Contraste adequado em light mode.
- [ ] Animações respeitam `prefers-reduced-motion`.
- [ ] Links externos têm texto compreensível.

## Performance

- [ ] Sem imagens enormes desnecessárias.
- [ ] Fontes carregadas de forma adequada.
- [ ] Sem bibliotecas pesadas desnecessárias.
- [ ] Sem animações que travam scroll.
- [ ] Lighthouse ou ferramenta similar sem alerta crítico antes do deploy final.

## Textos sem exagero

- [ ] Não inclui dados pessoais fora do escopo profissional.
- [ ] Não usa rótulos informais de programação por impulso.
- [ ] Não inventa experiência profissional formal.
- [ ] Não inventa usuários, receita, conversão ou métricas.
- [ ] Não menciona detalhes comerciais internos ou problemas comerciais.
- [ ] Projetos deixam claro o que é MVP, demonstrável ou local.

## Projetos sem claims falsos

- [ ] ChamadaFácil não promete SaaS multiempresa.
- [ ] ChamadaFácil não promete RBAC, SLA, e-mail ou anexos.
- [ ] Prado Auto Peças não promete resultados de negócio.
- [ ] Prado Auto Peças é apresentado como site institucional local, sem detalhes internos.
- [ ] PTBRMerger não promete demo pública.
- [ ] PTBRMerger não promete suporte universal a todo arquivo.
- [ ] Barbearia da Vila é tratada como landing page demonstrável.
- [ ] Barbearia da Vila não é apresentada como cliente real sem validação.

## Pronto para currículo

- [ ] Hero comunica claramente o posicionamento.
- [ ] Projetos principais aparecem primeiro.
- [ ] ChamadaFácil recebe destaque técnico.
- [ ] Prado Auto Peças recebe destaque como site local real.
- [ ] CTAs são claros.
- [ ] Conteúdo é escaneável por recrutador.
- [ ] Link final da Vercel está funcionando.
- [ ] O portfólio pode ser colocado no currículo sem ajustes urgentes.
