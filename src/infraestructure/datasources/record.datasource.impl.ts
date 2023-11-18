import { CreateRecordDto, PaginationDto, RecordDataSource, RecordEntity, UpdateRecordDto } from "../../domain";

export class RecordDataSourceImpl implements RecordDataSource {

    findOneById(id: string): Promise<RecordEntity> {
        throw new Error("Method not implemented.");
    }
    
    async findMany(dto: PaginationDto): Promise<RecordEntity[]> {
        throw new Error("Method not implemented.");
    }
    async create(dto: CreateRecordDto): Promise<RecordEntity> {
        return dto as any ;
    }
    async uptate(dto: UpdateRecordDto): Promise<RecordEntity> {
        return dto as any;
    }
    async hiddeRecords(id: string): Promise<Boolean> {
        throw new Error("Method not implemented.");
    }

}