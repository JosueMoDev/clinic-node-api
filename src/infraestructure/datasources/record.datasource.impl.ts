import { AllowedFolder, prisma, DateFnsAdapter } from '@config';
import { RecordDataSource } from '@domain/datasources';
import {
  UploadDto,
  PaginationDto,
  CreateRecordDto,
  UpdateRecordDto,
} from '@domain/dtos';
import { RecordEntity, PaginationEntity } from '@domain/entities';
import { CustomError } from '@handler-errors';
import { FileRepositoryImpl } from '@infraestructure/repositoriesimpl';
import { UploadedFile } from 'express-fileupload';
import { FileDataSourceImpl } from '@infraestructure/datasourcesimpl';

export class RecordDataSourceImpl implements RecordDataSource {
  private readonly datasource = new FileDataSourceImpl();
  private readonly repository = new FileRepositoryImpl(this.datasource);

  async uploadPDF(dto: UploadDto, file: UploadedFile): Promise<boolean> {
    const record = await this.findOneById(dto.id);

    if (!record) throw CustomError.notFound('Record Not Exist');

    if (!file) throw CustomError.badRequest('File no enviado');
    const { fileUrl, fileId } = await this.repository.uploadFile(
      dto,
      file,
      AllowedFolder.record,
    );
    const updateRecordPdf = await prisma.record.update({
      where: { id: dto.id },
      data: {
        pdfId: fileId,
        pdfUrl: fileUrl,
        lastUpdate: [
          {
            updatedBy: dto.updatedBy,
            date: DateFnsAdapter.formatDate(),
            action: 'UPDATE',
          },
        ],
      },
    });
    if (updateRecordPdf) return true;
    return false;
  }
  async deletePDF(dto: UploadDto): Promise<boolean> {
    const record = await this.findOneById(dto.id);
    if (!record.pdfUrl.length && !record.pdfId.length)
      throw CustomError.notFound('that record not have any pdf associeted');

    const { result } = await this.repository.deleteFile(record.pdfId);
    if (result === 'not found')
      throw CustomError.internalServer('we couldnt delete pfd');
    const recordUpdated = await prisma.record.update({
      where: { id: dto.id },
      data: {
        pdfId: '',
        pdfUrl: '',
        lastUpdate: [
          {
            updatedBy: dto.updatedBy,
            date: DateFnsAdapter.formatDate(),
            action: 'DELETE_FILE',
          },
        ],
      },
    });

    if (!recordUpdated) return false;
    return true;
  }

  async findOneById(id: string): Promise<RecordEntity> {
    const record = await prisma.record.findFirst({
      where: { id: id },
      include: {
        patient_record: true,
        doctor_record: true,
      },
    });

    if (!record) throw CustomError.badRequest('Any record found');

    return RecordEntity.fromObject(record);
  }

  async findMany(
    dto: PaginationDto,
  ): Promise<{ pagination: PaginationEntity; records: RecordEntity[] }> {
    const { page, pageSize } = dto;
    const [records, total] = await Promise.all([
      prisma.record.findMany({
        skip: PaginationEntity.dinamycOffset(page, pageSize),
        take: pageSize,
        include: {
          patient_record: true,
          doctor_record: true,
        },
      }),
      prisma.record.count(),
    ]);

    const recordsMapped = records.map(RecordEntity.fromObject);
    const pagination = PaginationEntity.setPagination({ ...dto, total });
    return { pagination, records: recordsMapped };
  }
  async create(dto: CreateRecordDto): Promise<RecordEntity> {
    try {
      const newRecord = await prisma.record.create({
        data: {
          ...dto,
          createdAt: DateFnsAdapter.formatDate(),
        },
        include: {
          patient_record: true,
          doctor_record: true,
        },
      });
      return RecordEntity.fromObject(newRecord);
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  async uptate(dto: UpdateRecordDto): Promise<RecordEntity> {
    const { id, updatedBy, ...rest } = dto;
    if (Object.keys(rest).length === 0)
      throw CustomError.badRequest('Nothing to update');
    const record = await this.findOneById(id);

    try {
      const recordUpdated = await prisma.record.update({
        where: { id: id },
        data: {
          ...rest,
          lastUpdate: [
            {
              updatedBy: updatedBy,
              date: DateFnsAdapter.formatDate(),
              action: 'UPDATE',
            },
          ],
        },
        include: {
          patient_record: true,
          doctor_record: true,
        },
      });
      return RecordEntity.fromObject(recordUpdated);
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
  async changeRecordStatus(dto: UpdateRecordDto): Promise<boolean> {
    const record = await this.findOneById(dto.id);
    try {
      const statusChanged = await prisma.record.update({
        where: {
          id: record.id,
        },
        data: {
          status: !record.status,
          lastUpdate: [
            {
              updatedBy: '',
              date: DateFnsAdapter.formatDate(),
              action: 'STATUS_CHANGED',
            },
          ],
        },
      });
      return statusChanged ? true : false;
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
