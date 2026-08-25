# TokenLab — Analisador de Tokens

Aplicação web pública para contar tokens, analisar arquivos e simular estratégias de chunking para pipelines de RAG e embeddings.

## Recursos

- Entrada por texto ou múltiplos arquivos
- Suporte a PDF, DOCX, XLS/XLSX, CSV, Markdown, JSON, HTML, TXT e outros formatos textuais
- Contagem `cl100k` para modelos de embedding da OpenAI
- Estimativas sinalizadas para modelos Gemini, Cohere e configurações personalizadas
- Chunking recursivo, por parágrafos ou por cabeçalhos Markdown
- Configuração de tamanho do chunk, sobreposição, lote e limite de entrada
- Média de tokens por fonte, carga total, distribuição e requisições estimadas
- Exportação da análise em CSV, PDF, Excel ou ZIP (PDF + Excel)
- Interface bilíngue (PT/EN) e tema claro/escuro, ambos detectados automaticamente a partir do sistema
- Processamento local no navegador: o conteúdo dos arquivos não é enviado ao servidor

## Acesso

A aplicação não implementa autenticação e foi configurada para acesso público. Qualquer pessoa com o endereço publicado pode utilizá-la.

## Requisitos

- Node.js `>=22.13.0`
- Linux com `flock`, `curl` e GNU `timeout` para os scripts de build verificado

## Desenvolvimento

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

O build validado é gerado em `dist/`. O manifesto de hospedagem fica em `.openai/hosting.json`.

## Estrutura principal

- `app/page.tsx`: interface e lógica de análise
- `app/globals.css`: estilos responsivos
- `app/layout.tsx`: metadados e layout raiz
- `public/`: recursos estáticos
- `scripts/`: instalação, build e validação
- `tests/`: verificações automatizadas
- `dist/`: build de produção
