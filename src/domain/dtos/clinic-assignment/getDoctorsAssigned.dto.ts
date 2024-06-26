import { IsMongoId, IsNotEmpty } from "class-validator";
import { CustomErrors, CustomValidationErrors } from "../utils";

export class GetDoctorsAssignedDto {
  @IsMongoId()
  @IsNotEmpty({ message: "Clinic ID is required" })
  public readonly clinic: string;

  constructor(clinic: string) {
    this.clinic = clinic;
  }

  static create(clinic: string): [undefined | CustomErrors[], GetDoctorsAssignedDto?] {
    const assignmentDto = new GetDoctorsAssignedDto(clinic);
    const [errors, validatedDto] =
      CustomValidationErrors.validateDto<GetDoctorsAssignedDto>(assignmentDto);
    if (errors) return [errors];

    return [undefined, validatedDto];
  }
}
