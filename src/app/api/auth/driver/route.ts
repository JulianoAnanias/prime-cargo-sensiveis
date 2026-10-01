import { NextRequest, NextResponse } from 'next/server';
import { getSharePointListItems, updateSharePointListItem } from '@/lib/graph';
import { SHAREPOINT_LISTS } from '@/lib/constants';
import { hashPassword, verifyPassword } from '@/lib/password';

const siteId = process.env.SHAREPOINT_SITE_ID || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password } = body;

    // LOGOUT
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Desconectado com sucesso' });
      response.cookies.delete('prime_session');
      return response;
    }

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!siteId) {
      return NextResponse.json({ error: 'Configuração do SharePoint ausente' }, { status: 500 });
    }

    // Busca usuário na lista oficial do SharePoint
    const items = await getSharePointListItems(siteId, SHAREPOINT_LISTS.USUARIOS);
    const found = items.find((item: any) => {
      const e = item.fields?.EmailUsuario || item.fields?.Email || item.fields?.Title || '';
      return e.toLowerCase().trim() === cleanEmail;
    });

    if (!found) {
      return NextResponse.json({
        authorized: false,
        error: 'E-mail não autorizado na lista de usuários da Prime Cargo. Contate o gestor.'
      }, { status: 403 });
    }

    if (found.fields?.Situacao && found.fields.Situacao.toLowerCase() !== 'ativo') {
      return NextResponse.json({
        authorized: false,
        error: 'Este usuário está inativo no sistema. Contate a administração.'
      }, { status: 403 });
    }

    const itemId = String(found.id);
    const storedHash = (found.fields?.SenhaHash || '').trim();
    const nome = found.fields?.NomeUsuario || found.fields?.Title || cleanEmail;
    const perfil = found.fields?.Perfil || 'motorista';

    // 1. AÇÃO: CHECK (Verifica se existe e se já tem senha ou se é primeiro acesso)
    if (action === 'check') {
      return NextResponse.json({
        authorized: true,
        hasPassword: Boolean(storedHash),
        nome,
        email: cleanEmail,
        perfil,
        message: storedHash ? 'Usuário com senha cadastrada' : 'Primeiro acesso: cadastre sua senha'
      });
    }

    // 2. AÇÃO: REGISTER_PASSWORD (Primeiro acesso / cadastrar senha)
    if (action === 'register_password') {
      if (storedHash) {
        return NextResponse.json({
          error: 'Este usuário já possui uma senha cadastrada. Faça o login direto ou solicite redefinição.'
        }, { status: 400 });
      }

      if (!password || password.length < 6) {
        return NextResponse.json({
          error: 'A senha deve ter no mínimo 6 caracteres.'
        }, { status: 400 });
      }

      const newHash = hashPassword(password);

      // Salva no SharePoint
      await updateSharePointListItem(siteId, SHAREPOINT_LISTS.USUARIOS, itemId, {
        SenhaHash: newHash
      });

      const userObj = {
        id: itemId,
        name: nome,
        nome: nome,
        email: cleanEmail,
        perfil,
      };

      const response = NextResponse.json({
        success: true,
        user: userObj,
        message: 'Senha cadastrada com sucesso!'
      });

      response.cookies.set('prime_session', encodeURIComponent(JSON.stringify(userObj)), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });

      return response;
    }

    // 3. AÇÃO: LOGIN (Autenticação com senha)
    if (action === 'login') {
      if (!storedHash) {
        return NextResponse.json({
          error: 'Usuário ainda não cadastrou uma senha. Realize o primeiro acesso.'
        }, { status: 400 });
      }

      if (!password) {
        return NextResponse.json({ error: 'Senha é obrigatória.' }, { status: 400 });
      }

      const isValid = verifyPassword(password, storedHash);

      if (!isValid) {
        return NextResponse.json({
          error: 'Senha incorreta. Tente novamente.'
        }, { status: 401 });
      }

      const userObj = {
        id: itemId,
        name: nome,
        nome: nome,
        email: cleanEmail,
        perfil,
      };

      const response = NextResponse.json({
        success: true,
        user: userObj,
        message: 'Login realizado com sucesso'
      });

      response.cookies.set('prime_session', encodeURIComponent(JSON.stringify(userObj)), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na API de autenticação do motorista:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
