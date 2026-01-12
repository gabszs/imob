# Candidatos para Refatoração Futura

Este arquivo documenta código duplicado e padrões que devem ser refatorados em iterações futuras.

## 1. Calendar.tsx - Migrar para Tailwind Puro

**Arquivo**: `src/components/ui/calendar.tsx`

**Problema**:
- Único componente moderno ainda usando `styled-components`
- Depende de bibliotecas legacy: `lodash`, `es-toolkit`, `@reactuses/core`
- Usa `parseDate` de `@/utility/tableHelpers` (diretório que não existe mais)

**Refatoração necessária**:
1. Remover `styled-components` completamente
2. Substituir lodash por funções nativas ou date-fns
3. Substituir @reactuses/core por hooks nativos do React
4. Substituir es-toolkit por alternativas nativas
5. Migrar `parseDate` para date-fns ou criar utilitário local
6. Migrar todo o estilo para Tailwind CSS

**Impacto**:
- Após essa refatoração, poderemos remover completamente:
  - `styled-components` (~90KB)
  - `lodash` (~70KB)
  - `@reactuses/core` (~30KB)
  - `es-toolkit` (~20KB)

**Redução estimada do bundle**: ~210KB

---

## 2. Theme Toggles - Unificar Componentes

**Arquivos**:
- `src/components/navbar/theme-toggle.tsx` - Usado no header
- `src/components/navbar/floating-theme-toggle.tsx` - Usado no __root.tsx

**Problema**:
- Dois componentes fazendo essencialmente a mesma coisa
- Código duplicado para lógica de theme toggle

**Refatoração sugerida**:
1. Criar um único componente base `ThemeToggle` com variants
2. Usar props para controlar se é floating ou inline
3. Usar `class-variance-authority` (CVA) para variantes

**Exemplo de API sugerida**:
```tsx
<ThemeToggle variant="floating" />
<ThemeToggle variant="inline" />
```

---

## 3. Date Picker - Verificar Duplicação (PARCIALMENTE RESOLVIDO)

**Status**: Removidos os date pickers antigos do sistema Facebook

**Arquivo mantido**:
- `src/components/ui/date-picker.tsx` - Implementação moderna

**Observação**: Após a limpeza, apenas o date-picker moderno permanece. Não há mais duplicação.

---

## 4. Potencial Refatoração: Mobile Components

**Diretório**: `src/components/mobile/`

**Status após limpeza**:
- Removidos todos os componentes mobile do sistema antigo de anúncios Facebook
- Diretório `mobile/` foi completamente removido

**Nota**: Se houver necessidade de componentes mobile no futuro, criar nova estrutura usando os padrões modernos (Tailwind + hooks modernos)

---

## 5. Icons - Considerar Biblioteca Unificada

**Arquivos atuais**:
- `src/components/icons/ClarityIcon.tsx`
- `src/components/icons/LinuxIcon.tsx`
- Uso extensivo de `lucide-react` (57 importações)

**Sugestão futura**:
- Considerar se ícones customizados (Clarity, Linux) podem ser substituídos por lucide-react
- Ou mover para um sistema de ícones SVG mais organizado
- Avaliar se vale a pena criar um componente `Icon` wrapper

---

## 6. Loading States - Unificar Padrões

**Componentes atuais**:
- `src/components/common/TableLoadingState.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/navbar/loader.tsx`

**Observação**:
- Três padrões diferentes de loading state
- Considerar se `TableLoadingState` pode usar `Skeleton` internamente
- Verificar se `Loader` do navbar é necessário ou pode usar Skeleton

---

## Próximos Passos

### Prioridade Alta
1. **Calendar.tsx refactor** - Maior impacto no bundle size

### Prioridade Média
2. **Theme Toggles unification** - Reduz duplicação de lógica
3. **Loading States** - Padroniza UX

### Prioridade Baixa
4. **Icons consolidation** - Melhoria organizacional
5. **Mobile components** - Apenas se necessário no futuro

---

## Notas de Implementação

### Ao refatorar calendar.tsx:
```bash
# Instalar se necessário
pnpm add date-fns

# Remover após refatoração
pnpm remove styled-components @reactuses/core es-toolkit lodash
pnpm remove @types/lodash  # se existir nos devDeps
```

### Testes necessários após cada refatoração:
```bash
pnpm typecheck
pnpm build
# Testar manualmente os componentes afetados
```

---

**Última atualização**: 2026-01-01
**Responsável pela limpeza**: Claude Code
