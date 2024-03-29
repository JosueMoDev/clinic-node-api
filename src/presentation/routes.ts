import { Router } from "express";
import { AccountRoutes, AppointmentRoutes, AuthenticationRoutes, ClinicAssignmentRoutes, ClinicRoutes, RecordRoutes } from "./app";
import { JWTStrategy } from "./middlewares";

export class AppRoutes {
    static get routes(): Router {

        const router = Router();

        router.use('/api/authentication', AuthenticationRoutes.routes);
        router.use(JWTStrategy.validateAccessToken);
        router.use('/api/account', AccountRoutes.routes);
        router.use('/api/appointment', AppointmentRoutes.routes);
        router.use('/api/clinic-assignment', ClinicAssignmentRoutes.routes);
        router.use('/api/clinic', ClinicRoutes.routes);
        router.use('/api/record', RecordRoutes.routes);


        return router;
    }
}