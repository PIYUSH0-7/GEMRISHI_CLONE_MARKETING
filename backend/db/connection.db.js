import mongoose from 'mongoose'
import dns from 'node:dns'

// Fix for Node.js SRV resolution issue on Windows
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    // Ignore if not allowed or already set
}
async function databaseconnection() {
    const green = '\x1b[32m';    // Green
    const magenta = '\x1b[35m';  // Magenta
    const reset = '\x1b[0m';     // Reset
    try {
        // console.log(`${green}Connecting to MongoDB...${reset}`);
        //& Clear the previous line in the console
        process.stdout.write('\r\x1b[K');
        process.stdout.write(`${green}Connecting to MongoDB...${reset}`);

        //& Connect to MongoDB using the connection string from environment variables
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URL}`)

        // Clear the previous line
        process.stdout.write('\r\x1b[K'); // \r moves to start, \x1b[K clears the line

        console.log(`${green}Mongodb is Connected ${magenta}${connectioninstance.connection.host}${reset}`)
    } catch (error) {
        console.log("ERROR:- Something Went Worng While Connecting to DB\n", error);
        throw error
    }
}
export default databaseconnection
