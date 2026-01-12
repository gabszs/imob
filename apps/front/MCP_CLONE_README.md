# MCP Gateway Clone - Componentes Copiados

Esta documentação lista todos os arquivos copiados literalmente do MCP Gateway para o projeto front.

## 📋 Status da Cópia

✅ **Página Principal**: `/src/routes/_protectedLayout/logs.tsx`
- Estrutura básica criada com placeholders
- Pronta para refatoração ponto a ponto

## 📦 Componentes Copiados

### Componentes Principais (`/src/components/mcp-clone/`)
- ✅ `log-table.tsx` (26.9 KB) - Tabela de logs completa com sorting, grouping, seleção
- ✅ `filter-bar.tsx` (11.6 KB) - Barra de filtros com URL state management
- ✅ `export-button.tsx` (1.7 KB) - Botão de export para JSONL
- ✅ `streaming-toggle.tsx` (1.0 KB) - Toggle para live updates

### Bibliotecas (`/src/lib/mcp-clone/`)
- ✅ `utils.ts` (674 B) - Utility functions (getLogKey, cn)
- ✅ `use-handler.ts` (855 B) - Hook para event handlers
- ✅ `method-colors.ts` (3.1 KB) - Cores para diferentes métodos MCP
- ✅ `method-detail.ts` (685 B) - Extração de detalhes do método
- ✅ `time-grouping.ts` (3.6 KB) - Agrupamento de logs por tempo

### Hooks (`/src/hooks/mcp-clone/`)
- ✅ `useCopyToClipboard.ts` (3.5 KB) - Hook para copiar texto

### UI Components (`/src/components/ui/`)
- ✅ `color-pill.tsx` (1.5 KB) - Componente de pill colorido

## 🔧 Dependências Instaladas

- ✅ `date-fns@^4.1.0` - Formatação de datas
- ✅ `@radix-ui/react-checkbox@^1.3.3` - Checkboxes

## 📝 Dependências Faltantes (a instalar)

Estas dependências são usadas pelo MCP Gateway mas ainda não foram instaladas:

- ❌ `nuqs` - URL query state management
- ❌ Outros componentes do filter-bar (AddFilterDropdown, CommandFilterInput, FilterBadge)

## 🎯 Próximos Passos

1. **Instalar dependências faltantes**:
   ```bash
   cd apps/front
   pnpm add nuqs
   ```

2. **Criar componentes auxiliares faltantes**:
   - AddFilterDropdown
   - CommandFilterInput
   - FilterBadge
   - Pagination
   - ErrorBoundary

3. **Refatorar imports** nos arquivos copiados:
   - Trocar imports do MCP Gateway para paths do projeto front
   - Adaptar tipos específicos do MCP para tipos de Events

4. **Integrar com dados reais**:
   - Substituir mock data por `useEventsList`
   - Adaptar LogTable para trabalhar com Event ao invés de ApiLogEntry

## 📂 Estrutura de Arquivos

```
apps/front/
├── src/
│   ├── routes/
│   │   └── _protectedLayout/
│   │       ├── events.tsx (versão simplificada)
│   │       └── logs.tsx (clone MCP Gateway)
│   ├── components/
│   │   ├── mcp-clone/
│   │   │   ├── log-table.tsx
│   │   │   ├── filter-bar.tsx
│   │   │   ├── export-button.tsx
│   │   │   └── streaming-toggle.tsx
│   │   └── ui/
│   │       ├── checkbox.tsx
│   │       └── color-pill.tsx
│   ├── lib/
│   │   └── mcp-clone/
│   │       ├── utils.ts
│   │       ├── use-handler.ts
│   │       ├── method-colors.ts
│   │       ├── method-detail.ts
│   │       └── time-grouping.ts
│   └── hooks/
│       └── mcp-clone/
│           └── useCopyToClipboard.ts
```

## 🚀 Como Usar

A página `/logs` está disponível mas ainda não funcional. Para ativá-la:

1. Navegue para `/logs` no app
2. Verá a estrutura básica com placeholders
3. Os componentes reais do MCP Gateway estão em `/components/mcp-clone/`
4. Use como referência para refatorar ponto a ponto

## 📖 Referência Original

Todos os arquivos foram copiados de:
`apps/mcp-gateway/packages/web/src/`

Mantidos LITERALMENTE idênticos para facilitar comparação e refatoração gradual.
