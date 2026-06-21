import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from '../lib/betterAuth.js';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      const session = await auth.api.getSession({
        headers: new Headers(request.headers as Record<string, string>),
      });
      
      if (!session || !session.user) {
        throw new UnauthorizedException('Invalid or missing session');
      }
      
      // Inject user into request object
      request.user = {
        ...session.user,
        fullName: session.user.name,
        profilePic: session.user.image,
        _id: session.user.id,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
