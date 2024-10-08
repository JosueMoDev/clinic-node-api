import { CustomValidatorErrors } from '@handler-errors';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
interface LoginDtoOptions {
  email: string;
  password: string;
}
export class LoginDto {
  @IsEmail({}, { message: 'Email is not valid' })
  @IsNotEmpty({ message: 'Email is required' })
  public email!: string;

  @MinLength(8, { message: 'Password should be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  public password!: string;

  constructor(args: LoginDto) {
    Object.assign(this, args);
  }

  static create(
    object: LoginDtoOptions,
  ): [undefined | string[], LoginDto?] {
    const loginDto = new LoginDto(object);

    const [errors, validatedDto] =
      CustomValidatorErrors.validateDto<LoginDto>(loginDto);

    if (errors) return [errors];

    return [undefined, validatedDto];
  }
}
