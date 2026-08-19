import { Request, Response } from 'express';
import { AuthenticateUserService } from '../services/AuthenticateUserService';
import { RedefinirSenhaService } from '../services/RedefinirSenhaService';
import { z } from 'zod';

export class AuthController {
  async login(request: Request, response: Response) {
    const loginSchema = z.object({
      login: z.string().min(1, 'Login é obrigatório'),
      senha: z.string().min(1, 'Senha é obrigatória'),
    });

    const { login, senha } = loginSchema.parse(request.body);

    const authenticateUser = new AuthenticateUserService();

    const { user, token } = await authenticateUser.execute({
      login,
      senhaInput: senha,
    });

    return response.json({ user, token });
  }

  async redefinirSenha(request: Request, response: Response) {
    const redefinirSchema = z.object({
      nova_senha: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
    });

    const { nova_senha } = redefinirSchema.parse(request.body);
    const { id: user_id } = request.user; // Obtido via token de login

    const redefinirSenhaService = new RedefinirSenhaService();
    await redefinirSenhaService.execute({
      user_id,
      nova_senha,
    });

    return response.status(204).send();
  }
}
