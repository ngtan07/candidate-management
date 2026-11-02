import { checkJobAcceptingApplications, findValidJob } from "../utils/job.helper.js";
import Application from '../models/Application.js'
import { MESSAGES } from "../constants/message.js";
import { APPLICATION_STATUS } from "../constants/application.js";
import AppError from "../utils/AppError.js";

const applyForJob = async (jobId, candidateId, applicationData, cvData) => {

    // check job exist and allow apply
    const job = await findValidJob(jobId)
    checkJobAcceptingApplications(job)

    // check double application 
    const existingApplication = await Application.findOne({
        candidateId,
        jobId
    })

    if (existingApplication) {
        throw new AppError(MESSAGES.ALREADY_APPLIED, 409)
    }

    // check info cv
    if (!cvData?.url || !cvData?.publicId || !cvData?.fileName) {
        throw new AppError(MESSAGES.CV_REQUIRED, 400);
    }

    //create application
    try {
        const application = await Application.create({
            candidateId,
            jobId,

            applicantName: applicationData.applicantName,
            applicantEmail: applicationData.applicantEmail,
            applicantPhone: applicationData.applicantPhone || null,

            cv: {
                url: cvData.url,
                publicId: cvData.publicId,
                fileName: cvData.fileName
            },

            status: APPLICATION_STATUS.APPLIED,
            statusUpdatedAt: new Date()
        });

        return application;

    } catch (error) {
        if (error.code === 11000) {
            throw new AppError(MESSAGES.ALREADY_APPLIED, 409);
        }
        throw error;
    }
}

export default {
    applyForJob
}