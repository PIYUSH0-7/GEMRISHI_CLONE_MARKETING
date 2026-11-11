import redisClient from "../config/redis.js";
const RATE_CACHE_KEY ="currency:rates:INR";
// 1 hour
const CACHE_TTL_SECONDS=60*60;
// used only if the live api and the redis cache both fail
const FALLBACK_RATES={
    INR:1,
    USD:0.012,
    EUR:0.011,
    GBP:0.0095,
    AED:0.044,
    AUD:0.018,
    CAD:0.016,
};
export const fetchLiveRates= async()=>
{
    const response =  await fetch("https://open.er-api.com/v6/latest/INR");
    if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
}
    const data = await response.json();
    if(data.result!=="success") throw new Error("Failed to fetch currency rate");
    return data.rates;
}
   export const getRates= async()=>{
    try{
         const cached=await redisClient.get(RATE_CACHE_KEY);
         if(cached)
            return JSON.parse(cached);
    }
    catch(err)
    {
       console.log("Redis Read Error:", err.message);
    }
      try
      {
         const liveRates=await fetchLiveRates();
         await redisClient.setEx(RATE_CACHE_KEY,CACHE_TTL_SECONDS,JSON.stringify(liveRates));
         return liveRates;
      }
      catch(err)
      {
            console.log("Live Currency fetch failed,using fallback:",err.message);
            return FALLBACK_RATES;
      }
   };
       export const refreshRate= async()=>
       {
        const liveRates=await fetchLiveRates();
        await redisClient.setEx(RATE_CACHE_KEY,CACHE_TTL_SECONDS,JSON.stringify(liveRates));
        console.log("currency rates refreshed:",new Date().toISOString());
        return liveRates;
       }