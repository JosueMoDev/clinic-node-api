import { DateFnsAdapter, prisma } from "../../config";
import { CreateRecordDto, CustomError, PaginationDto, RecordDataSource, RecordEntity, UpdateRecordDto } from "../../domain";

export class RecordDataSourceImpl implements RecordDataSource {

    async findOneById(id: string): Promise<RecordEntity> {
        const record = await prisma.record.findFirst({
            where: { id: id },
        });

        if (!record) throw CustomError.badRequest("Any record found");

        return RecordEntity.fromObject(record);
    }

    async findMany(dto: PaginationDto): Promise<RecordEntity[]> {
        return dto as any
    }
    async create(dto: CreateRecordDto): Promise<RecordEntity> {
        try {
            const newRecord = await prisma.record.create({
                data: {
                    ...dto,
                    createdAt: DateFnsAdapter.formatDate(),
                }
            });
            return RecordEntity.fromObject(newRecord);
        } catch (error) {
            throw CustomError.internalServer(`${error}`)
        }
    }
    async uptate(dto: UpdateRecordDto): Promise<RecordEntity> {
        return dto as any;
    }
    async changeRecordStatus(dto: UpdateRecordDto): Promise<RecordEntity> {
        const record = await this.findOneById(dto.id);
        try {
            const statusChanged = await prisma.record.update({
                where: {
                    id: record.id,
                },
                data: {
                    status: !record.status,
                    lastUpdate: [
                        ...record.lastUpdate,
                        {
                            ...dto.lastUpdate,
                            date: DateFnsAdapter.formatDate(),
                            action: "CHANGE RECORD VISIBILITY",
                        },
                    ],
                },
            });
            return RecordEntity.fromObject(statusChanged);
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

}