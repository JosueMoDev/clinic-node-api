import { Router } from "express"
import { ClinicDataSourceImpl, ClinicRepositoyImpl } from '../../../infraestructure';
import { ClinicService } from "../../services";
import { ClinicController } from "./clinic.controller";
import { FileUploadMiddleware } from "../../middlewares";

export class ClinicRoutes {

    static get routes(): Router {

        const router = Router();

        const datasource = new ClinicDataSourceImpl();
        const repository = new ClinicRepositoyImpl(datasource);
        const clinicService = new ClinicService(repository);
        const controller = new ClinicController(clinicService);
        router.post('/create', controller.createClinic);
        router.patch('/update', controller.updateClinic);
        router.get('/find-one/:id', controller.findOneById);
        router.get('/find-many', controller.findMany);
        router.patch('/change-status', controller.changeStatus);

        router.post('/delete-photo', controller.deleteFile);
        router.use(FileUploadMiddleware.containFiles);
        router.post('/upload-photo', controller.uploadFile);

        return router;
    }

}