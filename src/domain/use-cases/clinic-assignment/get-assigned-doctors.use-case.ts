import { AccountEntity } from "@domain/entities";
import { ClinicAssignmentRepository } from "@domain/repositories";


interface GetAssignedDoctorsUseCase {
  excute(id: string): Promise<AccountEntity[]>;
}

export class GetAssignedDoctors implements GetAssignedDoctorsUseCase {
  constructor(
    private readonly clinicAssignmentRepository: ClinicAssignmentRepository,
  ) {}

  async excute(id: string): Promise<AccountEntity[]> {
    return await this.clinicAssignmentRepository.getAssignedDoctors(id);
  }
}
