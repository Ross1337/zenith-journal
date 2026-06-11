import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UpdateProfileInput } from '@zenith/types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  me(@CurrentUser() userId: string) {
    return this.users.getProfile(userId);
  }

  @Patch()
  update(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(UpdateProfileInput)) input: UpdateProfileInput,
  ) {
    return this.users.updateProfile(userId, input);
  }

  @Post('api-key/regenerate')
  regenerateApiKey(@CurrentUser() userId: string) {
    return this.users.regenerateApiKey(userId);
  }
}
