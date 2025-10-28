# MD-UI Examples

This document shows practical examples of how the LLM should use MD-UI components in responses.

## Example 1: Saving a Contact

**User:** "Adicionar Bob de Lisboa"

**LLM Response:**
```markdown
:::notice type="info" title="Bob registrado com sucesso! ✅"
Salvei o Bob que mora em Lisboa.
:::

Quer que eu registre mais alguma coisa sobre ele?

{{input id="phone" label="Telefone" placeholder="+351..."}}
{{input id="email" label="Email" placeholder="bob@exemplo.com"}}

[Salvar informações](action:saveContact {"name": "Bob", "city": "Lisboa"})
```

## Example 2: Showing Records

**User:** "Mostrar todos com tag solar"

**LLM Response:**
```markdown
Encontrei 3 registros marcados como 'solar':

:::card title="Projeto Painel Solar" icon="☀️" status="success"
**Cliente**: ABC Energia
**Valor**: R$ 120.000
**Status**: Em andamento
:::

:::card title="Contrato Solar Residencial" icon="📄"
**Cliente**: João Silva
**Valor**: R$ 45.000
**Status**: Assinado
:::

:::card title="Reunião - Energia Solar" icon="📅"
**Data**: 15 de março
**Participantes**: Equipe técnica
:::

Quer ver os detalhes de algum deles?
```

## Example 3: Resolving Ambiguity

**User:** "Adicionar Bob"

**LLM Response:**
```markdown
Claro! Esse Bob é de onde?

[Lisboa](action:addContact {"name": "Bob", "city": "Lisboa"})
[Porto](action:addContact {"name": "Bob", "city": "Porto"})
[Outro lugar](action:addContact {"name": "Bob", "city": "other"})

Ou me diga a cidade:
{{input id="city" label="Cidade" placeholder="Digite a cidade"}}
```

## Example 4: Contract Details

**User:** "Quanto foi aquele contrato do João?"

**LLM Response:**
```markdown
:::card title="Contrato — João Silva" icon="📄" status="success"
**Valor**: R$ 50.000
**Data de assinatura**: 15 de janeiro de 2024
**Prazo**: 90 dias
**Status**: Ativo ✅
:::

:::section title="Detalhes Adicionais"
**Forma de pagamento**: Parcelado (3x)
**Primeira parcela**: 15/02/2024
**Responsável**: Maria Santos
:::

Precisa de mais alguma informação sobre este contrato?

[Ver histórico completo](action:viewHistory {"contractId": "123"})
[Editar contrato](action:editContract {"contractId": "123"})
```

## Example 5: Task Creation

**User:** "Criar tarefa para ligar para a Maria amanhã"

**LLM Response:**
```markdown
:::notice type="info" title="Quero criar uma tarefa para você 📋"
Vou registrar essa tarefa! Só preciso confirmar alguns detalhes:
:::

:::section title="Informações da Tarefa"
**O que fazer**: Ligar para a Maria
**Quando**: Amanhã
:::

Quer definir um horário específico?

{{date id="taskDate" label="Data da tarefa"}}
{{toggle id="addReminder" label="Adicionar lembrete" checked=true}}

[Criar tarefa](action:createTask {"description": "Ligar para Maria", "date": "tomorrow"})
[Cancelar](action:cancel {})
```

## Example 6: Error Handling

**User:** "Mostrar contrato xyz123"

**LLM Response (when not found):**
```markdown
:::notice type="warning" title="Hmm, não encontrei esse contrato 🤔"
Não achei nenhum contrato com esse código.
:::

Você lembra de mais alguma informação? Como:
- Nome do cliente
- Valor aproximado
- Data de assinatura

{{input id="search" label="Buscar por" placeholder="Nome do cliente ou valor"}}

[Buscar](action:search {"query": ""})
[Ver todos os contratos](action:listAll {})
```

## Example 7: Confirmation Dialog

**User:** "Deletar o contrato do Pedro"

**LLM Response:**
```markdown
:::notice type="warning" title="⚠️ Atenção!"
Você tem certeza que quer deletar este contrato?
:::

:::card title="Contrato — Pedro Santos" icon="📄" status="default"
**Valor**: R$ 35.000
**Data**: 10 de fevereiro
**Status**: Pendente
:::

:::notice type="error" title="Esta ação não pode ser desfeita"
Ao confirmar, todos os dados deste contrato serão permanentemente removidos.
:::

{{toggle id="confirmDelete" label="Confirmo que quero deletar" checked=false}}

[Deletar contrato](action:deleteContract {"contractId": "456", "requireConfirmation": true})
[Cancelar](action:cancel {})
```

## Example 8: Form Collection

**User:** "Adicionar novo cliente"

**LLM Response:**
```markdown
Ótimo! Vamos registrar um novo cliente. 📝

:::section title="Informações Básicas"
{{input id="name" label="Nome completo" placeholder="Ex: Maria Silva"}}
{{input id="email" label="Email" placeholder="maria@exemplo.com"}}
{{input id="phone" label="Telefone" placeholder="+55 11 99999-9999"}}
:::

:::section title="Informações Adicionais"
{{input id="company" label="Empresa (opcional)" placeholder="Nome da empresa"}}
{{date id="birthday" label="Data de nascimento (opcional)"}}
{{toggle id="newsletter" label="Deseja receber newsletter?" checked=true}}
:::

[Salvar cliente](action:saveClient {})
[Cancelar](action:cancel {})
```

## Best Practices

1. **Use Cards for Records**: Always show saved records in cards with status indicators
2. **Use Notices for Important Info**: Confirmations, warnings, and errors should use notices
3. **Provide Clear Actions**: Always offer action buttons for next steps
4. **Ask Before Acting**: For destructive operations, use confirmation toggles
5. **Group Related Fields**: Use sections to organize forms and details
6. **Be Visual**: Use emojis and icons to make responses more friendly
7. **Keep It Clean**: Don't overuse components - use them when they add value
8. **Validate Input**: Use placeholders and labels to guide users

## Visual Guidelines

- **Success status** (green): Completed, active, confirmed
- **Warning status** (yellow): Pending, needs attention
- **Error status** (red): Failed, blocked, cancelled
- **Default status** (neutral): Normal, in progress

## Tone and Language

Even with visual components, maintain the friendly, human tone:
- ✅ "Perfeito! Salvei o contrato aqui 📄"
- ❌ "Object ID 123 created successfully"

The MD-UI is a tool to enhance communication, not replace the human touch!
