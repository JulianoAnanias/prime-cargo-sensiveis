// ============================================================
// Prime Cargo PWA - Definições de Tipos
// Baseado nos formulários IPP41 (Vistoria) e IPP35 (Pesquisa)
// ============================================================

// --- Enums ---

export enum Perfil {
  MOTORISTA = 'motorista',
  GESTAO = 'gestao',
  QUALIDADE = 'qualidade',
}

export enum SituacaoUsuario {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
}

export enum Procedimento {
  COLETA = 'coleta',
  ENTREGA = 'entrega',
  TRANSFERENCIA = 'transferencia',
}

export enum TipoDocumento {
  NF = 'NF',
  COLETA = 'coleta',
  CTE = 'CT-e',
}

export enum SituacaoOperacao {
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDA = 'concluida',
  PARCIAL = 'parcial',
}

export enum EtapaItem {
  COLETA = 'coleta',
  TRANSFERENCIA = 'transferencia',
  ENTREGA = 'entrega',
  CONCLUIDO = 'concluido',
}

export enum SituacaoVistoria {
  PENDENTE = 'pendente',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDA = 'concluida',
}

export enum SyncStatus {
  RASCUNHO = 'rascunho',
  SALVO_LOCAL = 'salvo_local',
  AGUARDANDO_SYNC = 'aguardando_sync',
  SINCRONIZADO = 'sincronizado',
  FALHA_ENVIO = 'falha_envio',
}

export enum FinalidadeAssinatura {
  CONCORDANCIA_VISTORIA = 'concordancia_vistoria',
  CIENCIA_NC = 'ciencia_nc',
  RESPONSAVEL_PRIME = 'responsavel_prime',
  TERMO_ABERTURA = 'termo_abertura',
}

export enum TipoMidia {
  FOTO_GERAL = 'foto_geral',
  FOTO_IDENTIFICACAO = 'foto_identificacao',
  EVIDENCIA_NC = 'evidencia_nc',
  OUTRO = 'outro',
}

export enum OrigemMidia {
  CAMERA = 'camera',
  ARQUIVO = 'arquivo',
}

export enum SituacaoNC {
  PENDENTE = 'pendente',
  PERMANECE = 'permanece',
  RESOLVIDA = 'resolvida',
  AGRAVOU = 'agravou',
  NAO_VERIFICAVEL = 'nao_verificavel',
}

export enum TipoNC {
  EMBALAGEM = 'embalagem',
  EQUIPAMENTO = 'equipamento',
  OUTRO = 'outro',
}

export enum RespostaPesquisa {
  OTIMO = 'otimo',
  BOM = 'bom',
  REGULAR = 'regular',
  RUIM = 'ruim',
}

export enum SituacaoPesquisa {
  PENDENTE = 'pendente',
  RESPONDIDA = 'respondida',
  EXPIRADA = 'expirada',
}

export enum TipoConfigEmail {
  RESULTADO_VISTORIA = 'resultado_vistoria',
  PESQUISA_CLIENTE = 'pesquisa_cliente',
  RESPOSTA_PESQUISA = 'resposta_pesquisa',
  ANALISE_IA = 'analise_ia',
  GRUPO_SENSIVEIS = 'grupo_sensiveis',
}

export enum SituacaoFila {
  PENDENTE = 'pendente',
  PROCESSANDO = 'processando',
  CONCLUIDO = 'concluido',
  FALHA = 'falha',
}

export enum TipoFila {
  EMAIL_VISTORIA = 'email_vistoria',
  EMAIL_PESQUISA = 'email_pesquisa',
  EMAIL_RESPOSTA = 'email_resposta',
  EMAIL_ANALISE = 'email_analise',
  ANALISE_IA = 'analise_ia',
}

export enum ResultadoGeo {
  SUCESSO = 'sucesso',
  NEGADO = 'negado',
  INDISPONIVEL = 'indisponivel',
  IMPRECISO = 'impreciso',
}

// --- Interfaces ---

export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  perfil: Perfil;
  situacao: SituacaoUsuario;
  criadoEm?: string;
}

export interface Operacao {
  operacaoId: string;
  procedimento: Procedimento;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string; // Texto para preservar zeros à esquerda
  minutaDACTe?: string;
  nfNumero?: string;
  cliente: string;
  contatoCliente?: string;
  emailCliente?: string;
  funcaoContato?: string;
  telefoneCliente?: string;
  local: string;
  endereco?: string;
  setor?: string;
  ramal?: string;
  veiculo: string; // Placa
  veiculoDestino?: string; // Para transferência
  motorista: string; // Email do motorista
  motoristaId?: number;
  situacao: SituacaoOperacao;
  criadoEm?: string;
}

export interface Item {
  itemId: string;
  operacaoId: string;
  descricao: string;
  volumetria?: string;
  etapaAtual: EtapaItem;
  situacaoVistoria: SituacaoVistoria;
  criadoEm?: string;
}

// --- Condição do Equipamento (IPP41) ---

export interface CondicaoEquipamento {
  novo: boolean;
  usado: boolean;
  embalado: boolean;
  desembalado: boolean;
  funcionando: boolean;
  funcionandoNaoVerificado: boolean;
  danificado: boolean;
  descricaoDanificado?: string;
  outros: boolean;
  descricaoOutros?: string;
}

// --- Dimensões do Material ---

export interface Dimensoes {
  altura?: number; // cm - NÃO preencher com zero quando desconhecido
  largura?: number; // cm
  comprimento?: number; // cm
  peso?: number; // kg
}

// --- Inspeção da Embalagem (IPP41) ---

export interface InspecaoEmbalagem {
  embalagemOriginal: boolean;
  embalagemInadequada: boolean;
  embalagemComAvaria: boolean; // com sinais de avaria e/ou umidade
  semEmbalagem: boolean;
}

// --- Inspeção do Equipamento/Produto (IPP41) ---

export interface InspecaoEquipamento {
  semAvarias: boolean;
  apresentaAvarias: boolean;
  descricaoAvarias?: string;
  umidoMolhado: boolean;
  outros: boolean;
  descricaoOutros?: string;
}

export interface Vistoria {
  vistoriaId: string;
  itemId: string;
  operacaoId: string;
  etapa: Procedimento;
  numeroEtapa: number;
  motorista: string; // Email
  veiculo: string; // Placa
  dataVistoria: string;

  // Dados do IPP41
  condicaoEquipamento: CondicaoEquipamento;
  dimensoes: Dimensoes;
  inspecaoEmbalagem: InspecaoEmbalagem;
  inspecaoEquipamento: InspecaoEquipamento;

  observacoes?: string;
  aberturaAutorizada?: boolean;
  termoAssinado: boolean;

  // Geolocalização
  latitude?: number;
  longitude?: number;
  precisaoGeo?: number; // metros
  resultadoGeo: ResultadoGeo;
  justificativaGeo?: string;

  // Sincronização
  situacaoSync: SyncStatus;
  idAcao: string; // Idempotência

  criadoEm?: string;
}

export interface NaoConformidade {
  ncId: string;
  vistoriaId: string;
  itemId: string;
  descricao: string;
  tipo: TipoNC;
  etapaOrigem: Procedimento;
  situacao: SituacaoNC;
  motivoNaoVerificavel?: string;
  observacaoAcao?: string;
  reconferenciaId?: string;
  criadoEm?: string;
}

export interface Reconferencia {
  reconferenciaId: string;
  vistoriaId: string;
  itemId: string;
  dataReconferencia: string;
  responsavel: string;
  observacoes?: string;
  criadoEm?: string;
}

export interface Assinatura {
  assinaturaId: string;
  vistoriaId: string;
  itemId: string;
  finalidade: FinalidadeAssinatura;
  nome: string;
  cpf?: string;
  rg?: string;
  dataHora: string;
  arquivoPath?: string; // Caminho no SharePoint
  imagemBase64?: string; // Para armazenamento local
  conteudoAssinado?: string; // Hash/resumo do conteúdo assinado
  criadoEm?: string;
}

export interface Midia {
  midiaId: string;
  vistoriaId: string;
  itemId: string;
  ncId?: string; // Para evidência de NC
  tipo: TipoMidia;
  origem: OrigemMidia;
  arquivoPath?: string; // Caminho no SharePoint
  nomeOriginal?: string;
  urlLocal?: string; // URL local (blob)
  syncStatus: SyncStatus;
  criadoEm?: string;
}

// --- Pesquisa IPP35 ---

export interface Pesquisa {
  pesquisaId: string;
  operacaoId: string;
  tokenAcesso: string;
  validoAte: string;

  // Dados do formulário IPP35
  minutaDACTe?: string;
  nfNumero?: string;
  resultadoPesquisa?: string; // Uso da Qualidade

  // Remetente
  remetenteCliente: string;
  remetenteContato?: string;
  remetenteFuncao?: string;
  remetenteTelefone?: string;
  remetenteData?: string;

  // Destinatário
  destinatarioCliente: string;
  destinatarioContato?: string;
  destinatarioFuncao?: string;
  destinatarioTelefone?: string;
  destinatarioData?: string;

  // 4 perguntas do IPP35
  pergunta1?: RespostaPesquisa;
  pergunta2?: RespostaPesquisa;
  pergunta3?: RespostaPesquisa;
  pergunta4?: RespostaPesquisa;
  sugestao?: string;

  respondidaPor?: string;
  dataResposta?: string;
  realizadaPor?: string; // Responsável Prime
  dataRealizacao?: string;

  conviteEnviado: boolean;
  situacao: SituacaoPesquisa;
  criadoEm?: string;
}

export interface AnaliseIA {
  analiseId: string;
  pesquisaId: string;
  resumo: string;
  temas: string[]; // JSON array
  pontosAtencao: string[]; // JSON array
  acoesSugeridas: string[]; // JSON array
  alertaRegularRuim: boolean;
  situacaoAnalise: SituacaoFila;
  emailEnviado: boolean;
  criadoEm?: string;
}

export interface ConfigEmail {
  configId: string;
  tipo: TipoConfigEmail;
  email: string;
  nome?: string;
  ativo: boolean;
}

export interface Configuracao {
  chave: string;
  valor: string;
  descricao?: string;
}

export interface FilaProcessamento {
  filaId: string;
  tipo: TipoFila;
  referencia: string; // ID do registro associado
  situacao: SituacaoFila;
  tentativas: number;
  ultimaTentativa?: string;
  erro?: string;
  criadoEm?: string;
}

// --- Tipos auxiliares ---

export interface SyncQueueItem {
  id?: number;
  tipo: 'vistoria' | 'midia' | 'assinatura' | 'reconferencia' | 'nc';
  dados: unknown;
  referencia: string;
  status: 'pendente' | 'processando' | 'concluido' | 'falha';
  tentativas: number;
  criadoEm: string;
  erro?: string;
}

export interface GeolocalizacaoCaptura {
  latitude: number;
  longitude: number;
  precisao: number; // metros
  timestamp: string;
  resultado: ResultadoGeo;
  justificativa?: string;
}

export interface VideoSession {
  sessionId: string;
  token: string;
  viewerUrl: string;
  status: 'aguardando' | 'ao_vivo' | 'interrompido' | 'encerrado';
  criadoEm: string;
  expiraEm: string;
}

export interface PendenciaDashboard {
  tipo: string;
  titulo: string;
  contagem: number;
  itens: Array<{
    id: string;
    descricao: string;
    data?: string;
    motorista?: string;
    cliente?: string;
  }>;
}
