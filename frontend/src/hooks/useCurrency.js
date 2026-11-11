import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {
     setCurrency,
     setDetectedCountry,
     setRates,
     setRatesLoading,
     setRatesFailed
       } from "../redux/currencySlice";
import {COUNTRY_TO_CURRENCY} from "../utils/currency";
import {useGetCurrencyRatesQuery} from "../features/api/apiSlice";
export default function useCurrencyInit()
{
        const dispatch=useDispatch();
        const {data, isLoading, isError }=useGetCurrencyRatesQuery();
//-----------------------------Pull live Rate from Backend-----------------------------<Pawan>
useEffect(()=>
{
    if(isLoading)
        dispatch(setRatesLoading());
    if(data?.rates)
        dispatch(setRates(data.rates));
    if(isError)
        dispatch(setRatesFailed());
},[data,
   isLoading,
   isError,
   dispatch]
);
//------------------------Auto-detect country on first visit only-----------------------(Pawan)
useEffect(()=>{
    const hasManualPreference=!!localStorage.getItem("preferredCurrency");
    if(hasManualPreference)
        return ;

    let cancelled=false; // guards against dispatching after unmount / after a manual pick

    fetch("https://ipapi.co/json/")
    .then((res)=>res.json())
    .then((geo)=>
    {
        if(cancelled || localStorage.getItem("preferredCurrency"))
            return;

        dispatch(setDetectedCountry(geo.country_code));
        const detectedCurrency= COUNTRY_TO_CURRENCY[geo.country_code] || "USD";
        dispatch(setCurrency(detectedCurrency));
    })
    .catch(()=>{
//-----------------------------geolocation failed sliently -------------------------(Pawan)
    });

    return ()=>{ cancelled=true; };
},[dispatch]);
}