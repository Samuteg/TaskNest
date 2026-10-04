# Spec: Tags

> feature: tags
> status: em-implementacao

## Contexto

Usuários de um projeto precisam criar tags pessoais, anexá-las às próprias tasks e filtrar o quadro sem apagar tags anexadas por outros membros.

## Histórias

### US-001 — Organizar tasks com tags pessoais

Como membro de um projeto, quero criar e atribuir tags pessoais às minhas tasks, para organizar o trabalho sem alterar tags de outros membros.

#### AC-001 — Criar e listar tags do usuário

- **Dado** um usuário autenticado
- **Quando** ele cria uma tag com nome válido e lista suas tags
- **Então** a tag aparece com ID, nome e cor; tags de outro usuário não aparecem

#### AC-002 — Criação idempotente por usuário e nome

- **Dado** que o usuário já possui uma tag com determinado nome
- **Quando** ele cria novamente uma tag com o mesmo nome
- **Então** recebe a tag existente sem duplicar registros

#### AC-003 — Atribuir tags próprias a task

- **Dado** que o usuário é membro do projeto e possui tags próprias
- **Quando** atribui tags à task
- **Então** a resposta da task contém `tags` achatadas com ID, nome e cor

#### AC-004 — Isolar tags entre membros

- **Dado** que uma task possui tag de outro membro
- **Quando** o usuário atribui ou remove as próprias tags
- **Então** as tags do outro membro permanecem e não são enviadas como IDs editáveis

#### AC-005 — Bloquear ID de tag estrangeiro

- **Dado** que o usuário tenta atribuir uma tag pertencente a outro usuário
- **Quando** envia a operação de atribuição
- **Então** a operação é rejeitada e a task não é alterada

### US-002 — Encontrar tasks por tags

Como membro de um projeto, quero filtrar tasks por uma ou mais tags pessoais, para encontrar rapidamente o trabalho relevante.

#### AC-006 — Filtrar quadro por múltiplas tags

- **Dado** um quadro com tasks e tags pessoais disponíveis
- **Quando** o usuário seleciona duas ou mais tags no filtro
- **Então** somente tasks que possuem todas as tags selecionadas são exibidas

### US-003 — Criar task já categorizada

Como membro de um projeto, quero escolher tags ao criar uma task, para que ela já nasça organizada.

#### AC-007 — Criar task com tags

- **Dado** um usuário membro e tags próprias selecionadas
- **Quando** cria uma task
- **Então** a task é criada com as tags selecionadas e a lista de tasks é atualizada

## Fora de escopo

- Tags compartilhadas globalmente entre usuários.
- Alteração de cor após criação por uma tela de gerenciamento.
- Tags de outros membros serem editáveis por membros comuns.
- Filtro persistido na URL.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-001 | A cor padrão `#6366f1` atende criação sem seletor visual nesta entrega. | confirmada | Plano aprovado usa criação inline sem color picker. |
| ASM-002 | O filtro deve usar semântica AND quando múltiplas tags são selecionadas. | confirmada | Plano aprovado define `every`. |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-001 | Tags de outro membro devem poder ser removidas por owner/admin? | respondida | Não nesta entrega; endpoint administrativo separado pode ser criado depois. |
