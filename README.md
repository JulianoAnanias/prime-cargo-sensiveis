# 🚚 Prime Cargo Vistorias — PWA

Aplicativo PWA para vistoria de equipamentos sensíveis, acompanhamento operacional e pesquisa de satisfação pós-entrega.

## Stack

- **Next.js 14** (App Router) — Framework React
- **TypeScript** — Tipagem estática
- **Tailwind CSS** — Estilização
- **NextAuth.js v5** — Autenticação (Microsoft + Google)
- **Microsoft Graph** — Integração SharePoint Lists + Drive
- **IndexedDB** — Armazenamento offline
- **WebRTC** — Vídeo ao vivo
- **Vercel** — Hospedagem

## Estrutura do Projeto

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx           # Login
│   ├── app/               # Área do motorista
│   │   ├── page.tsx       # Dashboard
│   │   ├── vistoria/      # Vistorias (IPP41)
│   │   ├── historico/     # Histórico
│   │   ├── video/         # Vídeo ao vivo
│   │   └── perfil/        # Perfil
│   ├── admin/             # Painel de gestão
│   │   ├── page.tsx       # Dashboard pendências
│   │   ├── operacoes/     # Gestão de operações
│   │   ├── usuarios/      # Cadastro de usuários
│   │   ├── qualidade/     # Pesquisas e ações
│   │   └── configuracoes/ # Configurações
│   ├── pesquisa/[token]/  # Pesquisa pública (IPP35)
│   ├── video/[token]/     # Visualização de vídeo
│   └── api/               # API Routes (backend)
├── components/
│   ├── ui/                # Componentes base
│   ├── features/          # Componentes de negócio
│   └── layout/            # Layouts
├── contexts/              # Context providers
├── hooks/                 # React hooks
├── lib/                   # Bibliotecas
│   ├── auth.ts            # Configuração NextAuth
│   ├── graph.ts           # Microsoft Graph client
│   ├── sharepoint.ts      # Helpers SharePoint
│   ├── constants.ts       # Constantes (IPP41/IPP35)
│   ├── validation.ts      # Validação servidor
│   ├── ai-service.ts      # Serviço de IA
│   ├── email-service.ts   # Serviço de e-mail
│   └── offline/           # Sistema offline
│       ├── db.ts          # IndexedDB
│       ├── store.ts       # CRUD local
│       ├── sync-manager.ts # Sincronização
│       └── media-store.ts # Mídia offline
└── types/
    └── index.ts           # Tipos TypeScript
```

## Pré-requisitos

1. **Node.js** 18+
2. **Conta Azure AD** com aplicação registrada
3. **Conta Google Cloud** com OAuth configurado
4. **SharePoint Online** com site e listas configuradas
5. **Provedor de IA** (OpenAI ou Azure OpenAI)
6. **Servidor TURN** para vídeo (Twilio, Cloudflare Calls, etc.)

## Instalação

```bash
# Clonar o projeto
git clone <repo-url>
cd prime-cargo-app

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Preencher .env.local com as credenciais
# (veja seção de configuração abaixo)

# Executar em desenvolvimento
npm run dev
```

## Configuração

### 1. Azure AD (Login Microsoft + Graph API)

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Registre uma aplicação em Azure Active Directory > App registrations
3. Configure:
   - **Redirect URI**: `https://seu-dominio.vercel.app/api/auth/callback/microsoft-entra-id`
   - **API Permissions**: `User.Read`, `Sites.ReadWrite.All`, `Mail.Send`
   - **Client Secret**: Gere um secret
4. Anote: Client ID, Client Secret, Tenant ID

### 2. Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie credenciais OAuth 2.0
3. **Redirect URI**: `https://seu-dominio.vercel.app/api/auth/callback/google`
4. Anote: Client ID, Client Secret

### 3. SharePoint

1. Obtenha o Site ID via Graph Explorer:
   ```
   GET https://graph.microsoft.com/v1.0/sites/{hostname}:/{site-path}
   ```
2. Obtenha o Drive ID da biblioteca de documentos
3. As listas são criadas automaticamente na primeira execução

### 4. Variáveis de Ambiente na Vercel

Configure todas as variáveis do `.env.example` no painel da Vercel:
Settings > Environment Variables

### 5. Primeiro Usuário Administrador

Crie manualmente na lista `PrimeCargo_Usuarios` do SharePoint:
- Nome: (nome do admin)
- Email: (e-mail que será usado no login)
- Perfil: `gestao`
- Situacao: `ativo`

## Deploy na Vercel

```bash
# Instalar Vercel CLI (se necessário)
npm i -g vercel

# Deploy
vercel

# Para produção
vercel --prod
```

Ou conecte o repositório diretamente na [Vercel Dashboard](https://vercel.com/dashboard).

## Listas do SharePoint

O sistema utiliza 13 listas com prefixo `PrimeCargo_`:

| Lista | Função |
|---|---|
| `PrimeCargo_Usuarios` | Controle de acesso |
| `PrimeCargo_Operacoes` | Operações de coleta/entrega |
| `PrimeCargo_Itens` | Equipamentos por operação |
| `PrimeCargo_Vistorias` | Registro de cada vistoria |
| `PrimeCargo_NaoConformidades` | Não conformidades |
| `PrimeCargo_Reconferencias` | Check duplo (reconferência) |
| `PrimeCargo_Assinaturas` | Assinaturas digitais |
| `PrimeCargo_Midias` | Referências de fotos/arquivos |
| `PrimeCargo_Pesquisas` | Pesquisa pós-entrega (IPP35) |
| `PrimeCargo_AnaliseIA` | Análises de IA |
| `PrimeCargo_ConfigEmail` | Destinatários de e-mail |
| `PrimeCargo_Configuracoes` | Configurações gerais |
| `PrimeCargo_FilaProcessamento` | Fila de e-mails/tarefas |

## Organização de Arquivos no SharePoint

```
PrimeCargo/Vistorias/
  └── 2026-09-29/              ← Data local (America/Sao_Paulo)
      └── ABC1D23/             ← Placa do veículo
          └── Midias/
              ├── coleta/{itemId}/
              │   ├── fotos/
              │   ├── assinaturas/
              │   └── nc/{ncId}/
              ├── transferencia/
              └── entrega/
```

## Fluxos Principais

### Motorista (Mobile)
1. Login com Microsoft ou Google
2. Ver atendimentos disponibilizados
3. Iniciar vistoria (selecionar procedimento, documento, cliente)
4. Preencher formulário IPP41 (condição, dimensões, embalagem, equipamento)
5. Capturar fotos obrigatórias
6. Reconferência de NCs (se houver)
7. Coletar assinaturas
8. Registrar localização
9. Concluir/sincronizar

### Gestão (Desktop)
1. Dashboard de pendências
2. Cadastrar usuários, operações, itens
3. Disponibilizar atendimentos aos motoristas
4. Consultar histórico, fotos, assinaturas
5. Gerenciar destinatários de e-mail
6. Acompanhar pesquisas e ações da Qualidade

### Pesquisa (Público)
1. Cliente recebe e-mail com link seguro
2. Responde 4 perguntas (Ótimo/Bom/Regular/Ruim) + sugestão
3. Sistema salva e analisa com IA
4. Regular/Ruim gera alerta automático

## Formulários de Referência

- **IPP 41** — Check List de Vistoria de Equipamentos Sensíveis (Rev. 17, 13/06/2025)
- **IPP 35** — Pesquisa Sobre Serviço Prestado, Logística Sensível (Rev. 10, 13/06/2025)

## Licença

Propriedade de Grupo Prime Cargo. Uso restrito.
