import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator((field: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = (req as any).user;
    return field ? user?.[field] : user;
});