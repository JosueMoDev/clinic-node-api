import { AllowedFolder, DateFnsAdapter, prisma } from '@config';
import { UploadedFile } from 'express-fileupload';
import { ClinicEntity, PaginationEntity } from '@domain/entities';
import { ClinicDataSource } from '@domain/datasources';
import { FileDataSourceImpl } from '@infraestructure/datasourcesimpl';
import {
  UploadDto,
  PaginationDto,
  CreateClinicDto,
  UpdateClinicDto,
} from '@domain/dtos';
import { FileRepositoryImpl } from '@infraestructure/repositoriesimpl';
import { CustomError } from '@handler-errors';

export class ClinicDataSourceImpl implements ClinicDataSource {
  private readonly datasource = new FileDataSourceImpl();
  private readonly repository = new FileRepositoryImpl(this.datasource);

  async uploadPhoto(dto: UploadDto, file: UploadedFile): Promise<boolean> {
    const { id } = dto;
    const clinic = await this.findOneById(id);
    if (!file) throw CustomError.badRequest('File no enviado');
    const { fileUrl, fileId } = await this.repository.uploadFile(
      dto,
      file,
      AllowedFolder.clinic,
    );
    const updateClinicPhoto = await prisma.clinic.update({
      where: { id: id },
      data: {
        photoId: fileId,
        photoUrl: fileUrl,
        lastUpdate: [
          ...clinic.lastUpdate,
          {
            updatedBy: dto.updatedBy,
            date: DateFnsAdapter.formatDate(),
            action: 'UPLOAD_FILE',
          },
        ],
      },
    });
    if (updateClinicPhoto) return true;
    return false;
  }

  async deletePhoto(dto: UploadDto): Promise<boolean> {
    const clinic = await this.findOneById(dto.id);
    if (!clinic.photoUrl.length && !clinic.photoId.length)
      throw CustomError.notFound('that clinic not have any photo associeted');

    const { result } = await this.repository.deleteFile(clinic.photoId);
    if (result === 'not found')
      throw CustomError.internalServer('we couldnt delete photo');
    const clinicUpdated = await prisma.clinic.update({
      where: { id: dto.id },
      data: {
        photoId: '',
        photoUrl: '',
        lastUpdate: [
          ...clinic.lastUpdate,
          {
            updatedBy: dto.updatedBy,
            date: DateFnsAdapter.formatDate(),
            action: 'DELETE_FILE',
          },
        ],
      },
    });

    if (!clinicUpdated) return false;
    return true;
  }

  async findOneById(id: string): Promise<ClinicEntity> {
    const clinic = await prisma.clinic.findFirst({
      where: { id: id },
    });

    if (!clinic) throw CustomError.badRequest('Any clinic found');

    return ClinicEntity.fromObject(clinic);
  }

  async findMany(
    dto: PaginationDto,
    sort?: string | undefined,
  ): Promise<{ pagination: PaginationEntity; clinics: ClinicEntity[] }> {
    const sortting =
      sort !== undefined ? (sort === 'true' ? true : false) : undefined;
    const { page: currentPage, pageSize } = dto;
    const [clinics, total] = await Promise.all([
      prisma.clinic.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        where: {
          status: sortting,
        },
      }),
      prisma.clinic.count({ where: { status: sortting } }),
    ]);
    const pagination = PaginationEntity.setPagination({ ...dto, total });
    const clinicsMapped = clinics.map(ClinicEntity.fromObject);
    return { pagination, clinics: clinicsMapped };
  }

  async create(dto: CreateClinicDto): Promise<ClinicEntity> {
    try {
      const newClinic = await prisma.clinic.create({
        data: {
          ...dto
        },
      });
      return ClinicEntity.fromObject(newClinic);
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  async update(dto: UpdateClinicDto): Promise<ClinicEntity> {
    const { id, updatedBy, ...rest } = dto;

    if (Object.keys(rest).length === 0)
      throw CustomError.badRequest('Nothing to update');

    const clinic = await this.findOneById(id);

    if (rest.address)
      rest.address = {
        ...clinic.address,
        ...rest.address,
      };

    try {
      const clinicUpdated = await prisma.clinic.update({
        where: { id: id },
        data: {
          ...rest,
          lastUpdate: [
            ...clinic.lastUpdate,
            {
              updatedBy,
              date: DateFnsAdapter.formatDate(),
              action: 'UPDATE',
            },
          ],
        },
      });
      return ClinicEntity.fromObject(clinicUpdated);
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  async changeStatus(dto: UpdateClinicDto): Promise<boolean> {
    const clinic = await this.findOneById(dto.id);
    try {
      const clinicInvalidated = await prisma.clinic.update({
        where: {
          id: clinic.id,
        },
        data: {
          status: !clinic.status,
          lastUpdate: [
            ...clinic.lastUpdate,
            {
              updatedBy: dto.updatedBy,
              date: DateFnsAdapter.formatDate(),
              action: 'STATUS_CHANGED',
            },
          ],
        },
      });
      return clinicInvalidated ? true : false;
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
