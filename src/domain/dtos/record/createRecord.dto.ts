import { CustomValidatorErrors } from '@handler-errors';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

interface RecordDtoArgs {
  doctorId: string;
  patientId: string;
  title: string;
}

export class CreateRecordDto {
  @IsMongoId()
  @IsNotEmpty({ message: 'Doctor is required' })
  public readonly doctorId!: string;

  @IsMongoId()
  @IsNotEmpty({ message: 'Patient is required' })
  public readonly patientId!: string;

  @IsString({ message: 'Title should be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  public title!: string;

  constructor(args: RecordDtoArgs) {
    this.doctorId = args.doctorId;
    this.patientId = args.patientId;
    this.title = args.title;
  }

  static create(
    object: RecordDtoArgs,
  ): [undefined | string[], CreateRecordDto?] {
    const recordDto = new CreateRecordDto(object);
    const [errors, updatedDto] =
      CustomValidatorErrors.validateDto<CreateRecordDto>(recordDto);
    if (errors) return [errors];
    return [undefined, updatedDto];
  }
}
