import { Request, Response } from "express";
import { ClinicAssignmentService } from "../../services";
import {
  ClinicAssignmentDto,
  GetDoctorsAssignedDto,
  HandlerError,
} from "../../../domain";

export class ClinicAssignmentController {
  constructor(
    private readonly clinicAssignmentService: ClinicAssignmentService
  ) {}

  getAssignableDoctors = (request: Request, response: Response) => {
    this.clinicAssignmentService
      .gettingAssignableDoctor()
      .then((doctorList) => response.json(doctorList))
      .catch((error) => {
        const { statusCode, errorMessage } = HandlerError.hasError(error);
        return response.status(statusCode).json({ error: errorMessage });
      });
  };

  getAssignedDoctors = (request: Request, response: Response) => {
    const [error, getDoctorsAssigned] = GetDoctorsAssignedDto.create(
      request.params.clinic
    );
    if (error) return response.status(400).json({ error });
    this.clinicAssignmentService
      .gettingAssignedDoctors(getDoctorsAssigned?.clinic!)
      .then((doctorList) => response.json(doctorList))
      .catch((error) => {
        const { statusCode, errorMessage } = HandlerError.hasError(error);
        return response.status(statusCode).json({ error: errorMessage });
      });
  };

  createClinicAssignment = (request: Request, response: Response) => {
    const [error, createClinicAssignmentDto] = ClinicAssignmentDto.create(
      request.body
    );
    if (error) return response.status(400).json({ error });

    this.clinicAssignmentService
      .creatingClinicAssignment(createClinicAssignmentDto!)
      .then((clinicAssignment) => response.json(clinicAssignment))
      .catch((error) => {
        const { statusCode, errorMessage } = HandlerError.hasError(error);
        return response.status(statusCode).json({ error: errorMessage });
      });
  };

  updateClinicAssignment = (request: Request, response: Response) => {
    const [error, updateClinicAssignmentDto] = ClinicAssignmentDto.create(
      request.body
    );
    if (error) return response.status(400).json({ error });

    this.clinicAssignmentService
      .updatingClinicAssignment(updateClinicAssignmentDto!)
      .then((clinicAssignment) => response.json(clinicAssignment))
      .catch((error) => {
        const { statusCode, errorMessage } = HandlerError.hasError(error);
        return response.status(statusCode).json({ error: errorMessage });
      });
  };

  deleteClinicAssignment = (request: Request, response: Response) => {
    const [error, deleteClinicAssignmentDto] = ClinicAssignmentDto.create(
      request.body
    );
    if (error) return response.status(400).json({ error });

    this.clinicAssignmentService
      .deletingClinicAssignment(deleteClinicAssignmentDto!)
      .then((result) => response.json(result))
      .catch((error) => {
        const { statusCode, errorMessage } = HandlerError.hasError(error);
        return response.status(statusCode).json({ error: errorMessage });
      });
  };
}
