import { z } from 'zod';

export const UsuarioSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.string(),
});

export const validateUsuario = (data: any) => UsuarioSchema.safeParse(data);

export const validateVistoria = (data: any) => {
  return z.object({
    operacaoId: z.string(),
    itemId: z.string(),
    etapa: z.string(),
    fotos: z.array(z.string()).min(1, 'No mínimo 1 foto é necessária'),
    assinaturas: z.array(z.string()).min(1, 'Assinatura é obrigatória'),
  }).safeParse(data);
};

export const validateReconferencia = (data: any) => {
  return z.object({
    ncs: z.array(z.object({
      id: z.string(),
      status: z.string(),
    })).min(1),
    assinatura: z.string(),
  }).safeParse(data);
};

export const validatePesquisa = (data: any) => {
  return z.object({
    respostas: z.array(z.string()).length(4, 'É obrigatório responder as 4 perguntas'),
  }).safeParse(data);
};

export const validateUpload = (file: File) => {
  if (file.size > 10 * 1024 * 1024) return false;
  return true;
};
