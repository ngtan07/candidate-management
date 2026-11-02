import cron from "node-cron";

import Job from "../models/Job.js";
import { JOB_STATUS } from "../constants/job.js";

const closeExpiredJobs = async () => {
    const currentDate = new Date();

    const result = await Job.updateMany(
        {
            status: JOB_STATUS.OPENING,
            isDeleted: false,
            applicationEndDate: {
                $lt: currentDate
            }
        },
        {
            $set: {
                status: JOB_STATUS.CLOSED
            }
        }
    );

    if (result.modifiedCount > 0) {
        console.log(
            `[Job Scheduler] Closed ${result.modifiedCount} expired jobs`
        );
    }
};

export const startJobScheduler = async () => {

    try {
        await closeExpiredJobs();
    } catch (error) {
        console.error(
            "[Job Scheduler] Initial execution failed:",
            error
        );
    }

    const task = cron.schedule(
        "* * * * *", // 1p
        async () => {
            try {
                await closeExpiredJobs();
            } catch (error) {
                console.error(
                    "[Job Scheduler] Execution failed:",
                    error
                );
            }
        },
        {
            name: "close-expired-jobs",
            timezone: "Asia/Ho_Chi_Minh",
            noOverlap: true
        }
    );

    console.log("[Job Scheduler] Started successfully");

    return task;
};