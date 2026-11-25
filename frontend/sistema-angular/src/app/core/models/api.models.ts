export type PerfilNome = 'ADMIN' | 'GESTOR' | 'OPERADOR';

export interface PerfilDto {
  id: number;
  nome: PerfilNome;
  descricao: string;
}

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilNome;
  ativo: boolean;
  ultimoAcessoEm: string | null;
  criadoEm: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
  lembrarAcesso: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: AuthUser;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UsuarioDto {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilNome;
  perfilDescricao: string;
  ativo: boolean;
  ultimoAcessoEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface UsuarioCreateRequest {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilNome;
  ativo: boolean;
}

export interface UsuarioUpdateRequest {
  nome: string;
  email: string;
  perfil: PerfilNome;
  ativo: boolean;
}

export interface CursoResumoDto {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface DisciplinaResumoDto {
  id: number;
  nome: string;
  codigo: string;
  cargaHoraria: number;
  ativo: boolean;
}

export interface CursoDto {
  id: number;
  nome: string;
  codigo: string;
  descricao: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  disciplinas: DisciplinaResumoDto[];
}

export interface CursoRequest {
  nome: string;
  codigo: string;
  descricao: string | null;
  ativo: boolean;
  disciplinaIds: number[];
}

export interface DisciplinaDto {
  id: number;
  nome: string;
  codigo: string;
  descricao: string | null;
  cargaHoraria: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
  cursos: CursoResumoDto[];
}

export interface DisciplinaRequest {
  nome: string;
  codigo: string;
  descricao: string | null;
  cargaHoraria: number;
  ativo: boolean;
  cursoIds: number[];
}

export interface AuditoriaDto {
  id: number;
  usuarioId: number | null;
  usuarioEmail: string | null;
  acao: string;
  entidade: string;
  entidadeId: string | null;
  detalhes: string | null;
  ipOrigem: string | null;
  criadoEm: string;
}

export interface ConfiguracaoDto {
  id: number;
  chave: string;
  valor: string;
  descricao: string | null;
  categoria: string;
  atualizadoEm: string;
}

export interface SerieMensalDto {
  periodo: string;
  quantidade: number;
}

export interface DistribuicaoCursoDto {
  cursoNome: string;
  codigo: string;
  totalDisciplinas: number;
  ativo: boolean;
}

export interface AtividadeDiaDto {
  data: string;
  quantidade: number;
}

export interface DashboardResumoDto {
  totalUsuarios: number;
  usuariosAtivos: number;
  totalCursos: number;
  cursosAtivos: number;
  totalDisciplinas: number;
  disciplinasAtivas: number;
  taxaUsuariosAtivosPercent: number;
  mediaDisciplinasPorCurso: number;
  crescimentoUsuarios: SerieMensalDto[];
  distribuicaoCursos: DistribuicaoCursoDto[];
  atividadesPorDia: AtividadeDiaDto[];
  ultimosUsuarios: UsuarioDto[];
  cursosRecentes: CursoDto[];
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}
