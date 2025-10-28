# MD-UI (Markdown UI) Documentation

MD-UI is a custom syntax extension for Markdown that allows the LLM to create interactive, styled UI components within chat responses.

## Overview

The MD-UI system consists of:
1. **Components** - React components in `components/mdui/`
2. **Parser** - Parsing logic in `lib/mdui/parse.ts`
3. **Renderer** - Rendering logic in `lib/mdui/renderer.tsx`
4. **Integration** - Integrated into `components/elements/response.tsx`

## Available Components

### 1. Card

Display structured information with optional title, icon, and status.

**Syntax:**
```markdown
:::card title="Card Title" icon="📄" status="success"
**Field 1**: Value 1
**Field 2**: Value 2
:::
```

**Props:**
- `title` (optional): Card title
- `icon` (optional): Emoji or icon
- `status` (optional): `default` | `success` | `warning` | `error`
- `description` (optional): Subtitle text

**Example:**
```markdown
:::card title="Contrato — João Silva" icon="📄" status="success"
**Valor**: R$ 50.000
**Data**: 15 de janeiro
**Status**: Ativo ✅
:::
```

### 2. Notice

Display alerts and notifications.

**Syntax:**
```markdown
:::notice type="info" title="Important"
This is an important message.
:::
```

**Props:**
- `type` (optional): `info` | `warning` | `error` (default: `info`)
- `title` (optional): Alert title

**Example:**
```markdown
:::notice type="warning" title="Atenção"
Você tem 2 contratos pendentes de confirmação.
:::
```

### 3. Section

Group related information under a title.

**Syntax:**
```markdown
:::section title="Details"
Content goes here
:::
```

**Props:**
- `title` (optional): Section heading

**Example:**
```markdown
:::section title="Informações do Cliente"
**Nome**: Maria Silva
**Email**: maria@example.com
**Telefone**: +55 11 99999-9999
:::
```

### 4. Toggle (Switch)

Binary on/off switch.

**Syntax:**
```markdown
{{toggle id="notifyUser" label="Notificar cliente" checked=true}}
```

**Props:**
- `id` (required): Unique identifier
- `label` (optional): Label text
- `checked` (optional): Initial state (default: `false`)

**Example:**
```markdown
{{toggle id="autoSave" label="Salvar automaticamente" checked=false}}
```

### 5. TextInput

Single-line text input field.

**Syntax:**
```markdown
{{input id="clientName" label="Nome do cliente" placeholder="Digite o nome"}}
```

**Props:**
- `id` (required): Unique identifier
- `label` (optional): Label text
- `placeholder` (optional): Placeholder text
- `defaultValue` (optional): Initial value

**Example:**
```markdown
{{input id="email" label="Email" placeholder="exemplo@email.com"}}
```

### 6. DatePicker

Date selection with calendar popup.

**Syntax:**
```markdown
{{date id="deadline" label="Prazo de entrega"}}
```

**Props:**
- `id` (required): Unique identifier
- `label` (optional): Label text

**Example:**
```markdown
{{date id="contractDate" label="Data do contrato"}}
```

### 7. ActionButton

Interactive button that can trigger actions.

**Syntax:**
```markdown
[Button Label](action:actionName {"key": "value"})
```

**Props:**
- `label`: Button text
- `action`: Action name
- `payload`: JSON object with action data

**Example:**
```markdown
[Confirmar agora](action:confirm {"contractId": "123", "status": "approved"})
[Ver detalhes](action:viewDetails {"id": "456"})
```

## Parser Implementation

The parser (`lib/mdui/parse.ts`) uses regex patterns to detect and parse MD-UI syntax:

1. **Block components** (:::card, :::notice, :::section)
   - Matches `:::type props\ncontent\n:::`
   - Recursively parses nested content

2. **Inline components** ({{toggle}}, {{input}}, {{date}})
   - Matches `{{type props}}`
   - Extracts props with key=value parsing

3. **Action buttons**
   - Matches `[Label](action:name {...})`
   - Parses JSON payload

## Renderer Implementation

The renderer (`lib/mdui/renderer.tsx`) converts parsed tokens into React components:

- Maps token types to corresponding React components
- Passes props to components
- Recursively renders nested tokens

## Integration

The MD-UI system is integrated into the response component:

```tsx
// components/elements/response.tsx
import { parseMDUI, MDUIRenderer } from "@/lib/mdui";

// Detect MD-UI syntax
const hasMDUI = content.includes(':::') || content.includes('{{') || content.includes('action:');

if (hasMDUI) {
  const tokens = parseMDUI(content);
  return <MDUIRenderer tokens={tokens} />;
}
```

## Styling

MD-UI components use custom CSS variables defined in `app/globals.css`:

```css
:root {
  --mdui-bg: hsl(0 0% 100%);
  --mdui-surface: hsl(240 5.9% 96%);
  --mdui-brand: hsl(158 64% 52%);
  --mdui-radius: 12px;
  --mdui-gap: 14px;
  --mdui-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.dark {
  --mdui-bg: hsl(240 10% 3.9%);
  --mdui-surface: hsl(240 6% 8%);
  --mdui-brand: hsl(158 64% 52%);
  --mdui-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
```

## Usage in LLM Prompts

The system prompt in `lib/ai/prompts.ts` instructs the LLM on how to use MD-UI:

- Use cards for structured records
- Use notices for confirmations/alerts
- Use buttons for user actions
- Use inputs for data collection
- Use sections for grouping

## Event Handling

Action buttons dispatch custom events:

```tsx
// ActionButton dispatches:
window.dispatchEvent(new CustomEvent('mdui:action', {
  detail: { name: action, payload }
}));

// Listen for events:
window.addEventListener('mdui:action', (e) => {
  console.log(e.detail.name, e.detail.payload);
});
```

## Testing

Tests are located in `tests/lib/mdui.test.ts` and cover:
- Parsing of all component types
- Props extraction
- Mixed content handling
- Plain markdown fallback
