import cron from "node-cron";
import { refreshRate } from "../services/currency.services.js";
console.log("Currency Rate Updater Cron Job Set Initiated");
cron.schedule("0 * * * *", async () => 
{
    try{
        await  refreshRate ();
    }
    catch(err)
    {
        console.error("currency cron refresh failed:",err.message);
    }
});
// ---------------------Add By Pawan For Currency--------------------------- 