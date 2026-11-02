import env from "./config/env.js";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import { startJobScheduler } from "./schedulers/job.scheduler.js";

const startServer = async () => {
    try {
        await connectDatabase();
        await startJobScheduler();

        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();