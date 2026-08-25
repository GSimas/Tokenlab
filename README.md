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
- Processamento local no navegador: o conteúdo dos arquivos não é enviado a nenhum servidor

## Acesso

A aplicação não implementa autenticação e foi configurada para acesso público. Qualquer pessoa com o endereço publicado pode utilizá-la.

## Arquitetura

TokenLab é uma SPA estática: React + Vite, sem backend, sem SSR e sem dependências de banco de dados. Todo o processamento (contagem de tokens, extração de arquivos, geração de PDF/Excel/ZIP) roda no navegador. O build gera arquivos estáticos em `dist/`, que podem ser hospedados em qualquer serviço de hosting estático (Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.).

## Requisitos

- Node.js `>=20`

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Os arquivos estáticos são gerados em `dist/`. Para pré-visualizar o build localmente:

```bash
npm run preview
```

## Deploy no Netlify

O repositório já inclui um `netlify.toml` com a configuração correta:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Basta conectar o repositório no Netlify — nenhuma configuração manual adicional é necessária.

## Estrutura principal

- `src/App.tsx`: interface e lógica de análise
- `src/i18n.ts`: dicionário de traduções PT/EN
- `src/export.ts`: geração de CSV, PDF, Excel e ZIP
- `src/index.css`: estilos e sistema de design
- `src/main.tsx`: ponto de entrada da aplicação
- `index.html`: HTML raiz, fontes e metadados
- `public/`: recursos estáticos
- `dist/`: build de produção (gerado, não versionado)
