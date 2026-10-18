import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type UserRole } from '@prisma/client';

export interface CurrentUserData {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  firstName: string;
  lastName: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
