import { connect, disconnect } from "mongoose";
async function connectToDatabase() {
    try {
        const mongoURL = process.env.MONGODB_URL?.trim().replace(/^"(.*)"$/, "$1");
        if (!mongoURL) {
            throw new Error("MONGODB_URL is not set");
        }
        await connect(mongoURL);
    }
    catch (error) {
        console.log(error);
        throw new Error("Could not Connect To MongoDB");
    }
}
async function disconnectFromDatabase() {
    try {
        await disconnect();
    }
    catch (error) {
        console.log(error);
        throw new Error("Could not Disconnect From MongoDB");
    }
}
export { connectToDatabase, disconnectFromDatabase };
//# sourceMappingURL=connection.js.map