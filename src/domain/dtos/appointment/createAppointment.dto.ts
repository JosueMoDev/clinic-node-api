import { CustomValidatorErrors } from '@handler-errors';
import { IsISO8601, IsMongoId, IsNotEmpty } from 'class-validator';

interface CreateAppointmentDtoArgs {
  startDate: string;
  endDate: string;
  doctorId: string;
  patientId: string;
  clinicId: string;
  createdBy: string;
}
export class CreateAppointmentDto {
  @IsNotEmpty({ message: 'Start Date is required' })
  @IsISO8601({ strict: true })
  public startDate!: string;

  @IsNotEmpty({ message: 'End Date is required' })
  @IsISO8601({ strict: true })
  public endDate!: string;

  @IsMongoId()
  @IsNotEmpty()
  public readonly doctorId!: string;

  @IsMongoId()
  @IsNotEmpty()
  public readonly patientId!: string;

  @IsMongoId()
  @IsNotEmpty()
  public readonly clinicId!: string;

  @IsMongoId()
  @IsNotEmpty()
  public readonly createdBy!: string;

  constructor(args: CreateAppointmentDtoArgs) {
    Object.assign(this, args);
  }

  static create(
    object: CreateAppointmentDto,
  ): [undefined | string[], CreateAppointmentDto?] {
    const updateAccountDto = new CreateAppointmentDto(object);

    const [errors, validatedDto] =
      CustomValidatorErrors.validateDto<CreateAppointmentDto>(
        updateAccountDto,
      );

    if (errors) return [errors];

    return [undefined, validatedDto];
  }
}
