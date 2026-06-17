# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Command Output

Protect context usage. **Any command with unknown or potentially large output must be byte-capped.**

Default pattern:

```bash
COMMAND 2>&1 | head -c 4000
```

<!-- context7 -->
Use Context7 MCP to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service -- even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer -- your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Always start with `resolve-library-id` using the library name and the user's question, unless the user provides an exact library ID in `/org/project` format
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question). Use version-specific IDs when the user mentions a version
3. `query-docs` with the selected library ID and the user's full question (not single words)
4. If you weren't satisfied with the answer, call `query-docs` again for the same library with `researchMode: true`. This retries with sandboxed agents that git-pull the actual source repos plus a live web search, then synthesizes a fresh answer. More costly than the default
5. Answer using the fetched docs
<!-- context7 -->

Me responda SEMPRE em portugues do brasileiro, escreva comentarios em codigos em PTBR, porém codigos, funcoes e etc SEMPRE em INGLES

Quando for abrir um servidor localmente, nao abra terminal no meu pc que fique flutuante e mais uma janela no computador aberta, se possivel, abra o servidor local de alguma maneira que fique sem janela aberta no meu computador

## Security Rules

Never trust client-provided values for:

- amount, price, discount, coupon value
- plan benefits, subscription tier, premium status
- payment status, paid flags, checkout success flags
- user role, permissions, admin flags
- user ID / owner ID for protected resources
- webhook URLs, API keys, tokens, secrets
- limits, quotas, credits, usage counters

The client may only send stable identifiers, such as `planId`, `productId`, `featureId`, or form input.

The server must:
- look up canonical prices, permissions, and plan benefits from a trusted server-side catalog/database
- validate all input with a backend schema
- recalculate totals server-side
- verify payment status through the payment provider webhook/API before granting access
- never expose secrets or private webhooks to the frontend
- treat every frontend request as untrusted, even if the UI appears locked
When implementing payments, subscriptions, protected actions, form submissions, or webhook integrations, stop and check this security section before writing code. If any client-provided trusted value is found, replace it with a server-side lookup/validation flow.

Quando digitar Strings, coisas que nao quebram site, escreva com acentuacao e ortografia correta, apenas evite caracteres especiais em lugares criticos, porem partes que o usuario vá ler coloca acentuacao e ortografia correta

@C:\Users\Administrator\.codex\RTK.md