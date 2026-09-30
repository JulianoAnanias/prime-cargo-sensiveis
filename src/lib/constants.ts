// ============================================================
// Prime Cargo PWA - Constantes do Aplicativo
// Baseado nos formulários IPP41 e IPP35
// ============================================================

export const APP_NAME = 'Prime Cargo Vistorias';
export const APP_DESCRIPTION = 'Vistoria de equipamentos sensíveis';
export const TIMEZONE = 'America/Sao_Paulo';
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const DATETIME_FULL_FORMAT = 'dd/MM/yyyy HH:mm:ss';

// --- Cores da marca ---
export const BRAND_COLORS = {
  primaryOrange: '#F47920',
  darkOrange: '#E94E1B',
  lightOrange: '#F9A825',
  darkGray: '#4D4D4D',
  mediumGray: '#666666',
  lightGray: '#F5F5F5',
  white: '#FFFFFF',
} as const;

// --- Labels de Perfil ---
export const PERFIL_LABELS: Record<string, string> = {
  motorista: 'Motorista',
  gestao: 'Gestão',
  qualidade: 'Qualidade',
};

// --- Labels de Procedimento ---
export const PROCEDIMENTO_LABELS: Record<string, string> = {
  coleta: 'Coleta',
  entrega: 'Entrega',
  transferencia: 'Transferência',
};

// --- Labels de Tipo de Documento ---
export const TIPO_DOCUMENTO_LABELS: Record<string, string> = {
  NF: 'NF',
  coleta: 'Número de Coleta',
  'CT-e': 'CT-e',
};

// --- Labels de Etapa ---
export const ETAPA_LABELS: Record<string, string> = {
  coleta: 'Coleta',
  transferencia: 'Transferência',
  entrega: 'Entrega',
  concluido: 'Concluído',
};

// --- Labels de Situação de Operação ---
export const SITUACAO_OPERACAO_LABELS: Record<string, string> = {
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  parcial: 'Parcial',
};

// --- Labels de Status de Sincronização ---
export const SYNC_STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  salvo_local: 'Salvo no aparelho',
  aguardando_sync: 'Aguardando sincronização',
  sincronizado: 'Sincronizado',
  falha_envio: 'Falha de envio',
};

export const SYNC_STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-200 text-gray-700',
  salvo_local: 'bg-blue-100 text-blue-700',
  aguardando_sync: 'bg-yellow-100 text-yellow-700',
  sincronizado: 'bg-green-100 text-green-700',
  falha_envio: 'bg-red-100 text-red-700',
};

// --- Condições do Equipamento (IPP41) ---
export const CONDICAO_EQUIPAMENTO_OPCOES = {
  estado: [
    { value: 'novo', label: 'Novo' },
    { value: 'usado', label: 'Usado' },
  ],
  embalagem: [
    { value: 'embalado', label: 'Embalado' },
    { value: 'desembalado', label: 'Desembalado' },
  ],
  funcionamento: [
    { value: 'funcionando', label: 'Funcionando' },
    { value: 'danificado', label: 'Danificado / Com sinais de avaria' },
    { value: 'nao_verificado', label: 'Não foi possível verificar' },
  ],
} as const;

// --- Inspeção da Embalagem (IPP41) ---
export const INSPECAO_EMBALAGEM_OPCOES = [
  { value: 'embalagemOriginal', label: 'Embalagem original do equipamento' },
  { value: 'embalagemInadequada', label: 'Embalagem inadequada para o transporte' },
  { value: 'embalagemComAvaria', label: 'Embalagem com sinais de avaria e/ou umidade' },
  { value: 'semEmbalagem', label: 'Sem embalagem' },
] as const;

// --- Inspeção do Equipamento/Produto (IPP41) ---
export const INSPECAO_EQUIPAMENTO_OPCOES = [
  { value: 'semAvarias', label: 'Equipamento sem sinais de avarias' },
  { value: 'apresentaAvarias', label: 'Equipamento apresenta sinais de avarias' },
  { value: 'umidoMolhado', label: 'Equipamento úmido / molhado' },
  { value: 'outros', label: 'Outros' },
] as const;

// --- Unidades de medida ---
export const UNIDADES = {
  altura: 'cm',
  largura: 'cm',
  comprimento: 'cm',
  peso: 'kg',
} as const;

// --- Dimensões labels ---
export const DIMENSOES_LABELS: Record<string, string> = {
  altura: 'Altura',
  largura: 'Largura',
  comprimento: 'Comprimento',
  peso: 'Peso',
};

// --- Perguntas do IPP35 (Pesquisa de Satisfação) ---
export const IPP35_PERGUNTAS = [
  {
    numero: 1,
    texto: 'Colaboradores da Prime Cargo atuaram com uniformes adequados, identificação visível, habilidades técnicas e atendimento respeitoso.',
  },
  {
    numero: 2,
    texto: 'Sobre os veículos da Prime Cargo, bem conservados e adequados às operações.',
  },
  {
    numero: 3,
    texto: 'Entregas e retiradas são realizadas dentro do prazo, com uso de equipamentos apropriados para cada operação.',
  },
  {
    numero: 4,
    texto: 'De maneira geral, qual sua classificação aos serviços prestados?',
  },
] as const;

// --- Alternativas da pesquisa ---
export const IPP35_ALTERNATIVAS = [
  { value: 'otimo', label: 'Ótimo' },
  { value: 'bom', label: 'Bom' },
  { value: 'regular', label: 'Regular' },
  { value: 'ruim', label: 'Ruim' },
] as const;

// --- Textos do Termo de Responsabilidade (IPP41) ---
export const TERMO_RESPONSABILIDADE = `Caso a abertura da embalagem para inspeção do equipamento/produto não seja autorizada, o responsável declara-se ciente de que quaisquer danos ou avarias eventualmente identificadas posterior a entrega, serão de sua inteira responsabilidade.`;

export const DECLARACAO_CONCORDANCIA = `Declaro estar ciente e de pleno acordo com as informações acima registradas no momento da inspeção do equipamento/produto.`;

// --- Finalidades de assinatura ---
export const FINALIDADE_ASSINATURA_LABELS: Record<string, string> = {
  concordancia_vistoria: 'Concordância com a vistoria',
  ciencia_nc: 'Ciência das não conformidades',
  responsavel_prime: 'Responsável Prime',
  termo_abertura: 'Termo de abertura não autorizada',
};

// --- Situações de NC ---
export const SITUACAO_NC_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  permanece: 'Permanece',
  resolvida: 'Foi resolvida',
  agravou: 'Se agravou',
  nao_verificavel: 'Não foi possível verificar',
};

// --- Tipos de foto obrigatória ---
export const TIPOS_FOTO_OBRIGATORIA = [
  { tipo: 'foto_geral', label: 'Foto geral do equipamento/embalagem', obrigatorio: true },
  { tipo: 'foto_identificacao', label: 'Foto da identificação', obrigatorio: true },
] as const;

// --- Resposta da pesquisa labels ---
export const RESPOSTA_PESQUISA_LABELS: Record<string, string> = {
  otimo: 'Ótimo',
  bom: 'Bom',
  regular: 'Regular',
  ruim: 'Ruim',
};

// --- Nomes das listas no SharePoint ---
export const SHAREPOINT_LISTS = {
  USUARIOS: 'PrimeCargo_Usuarios',
  OPERACOES: 'PrimeCargo_Operacoes',
  ITENS: 'PrimeCargo_Itens',
  VISTORIAS: 'PrimeCargo_Vistorias',
  NAO_CONFORMIDADES: 'PrimeCargo_NaoConformidades',
  RECONFERENCIAS: 'PrimeCargo_Reconferencias',
  ASSINATURAS: 'PrimeCargo_Assinaturas',
  MIDIAS: 'PrimeCargo_Midias',
  PESQUISAS: 'PrimeCargo_Pesquisas',
  ANALISE_IA: 'PrimeCargo_AnaliseIA',
  CONFIG_EMAIL: 'PrimeCargo_ConfigEmail',
  CONFIGURACOES: 'PrimeCargo_Configuracoes',
  FILA_PROCESSAMENTO: 'PrimeCargo_FilaProcessamento',
} as const;

// --- Configuração mínima de fotos padrão ---
export const MINIMO_FOTOS_PADRAO = {
  foto_geral: 1,
  foto_identificacao: 1,
  evidencia_nc: 1, // por NC
} as const;

// --- Header do formulário IPP41 ---
export const IPP41_HEADER = {
  titulo: 'Check List de Vistoria de Equipamentos Sensíveis',
  codigo: 'IPP 41',
  revisao: '17',
  emissao: '13/06/2025',
  elaboradoPor: 'Qualidade – Prime Cargo',
  procedimentoOrigem: 'POP – 06.001.01 Propriedade do Cliente',
} as const;

// --- Header do formulário IPP35 ---
export const IPP35_HEADER = {
  titulo: 'Pesquisa Sobre Serviço Prestado',
  subtitulo: 'Logística Sensível',
  codigo: 'IPP - 35',
  revisao: '10',
  emissao: '13/06/2025',
  elaboradoPor: 'Qualidade – Prime Cargo',
  procedimentoOrigem: 'POP - SATISFAÇÃO DO CLIENTE 01.001.04',
  mensagem: 'Sua avaliação é muito importante para nós',
  submensagem: 'Seu feedback é essencial para aprimorarmos continuamente nossos serviços.',
} as const;
