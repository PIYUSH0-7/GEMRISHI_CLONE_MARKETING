import {createSlice} from "@reduxjs/toolkit";
const savedCurrency=typeof window !=="undefined"? localStorage.getItem("preferredCurrency"):null;
const initialState={
    currency:savedCurrency || "INR",
    Country:null,
    rates:{INR:1},
    // idle | locality /succeded | failed
    status:"idle", 
}

const currencySlice =createSlice({
    name:"Currency",
    initialState,
    reducers:{
        // For setting the currency------------(Pawan)
    setCurrency:(state,action)=>{
        state.currency=action.payload;
        if(typeof window !=="undefined")
        {
            localStorage.setItem("preferredCurrency",action.payload);
        }
    },

    // For find the country ------------------(Pawan)
    setDetectedCountry:(state,action)=>
    {
        state.Country=action.payload;
    },

    // for Rates-------------------------------(pawan)
        setRates: (state, action) =>
         {
         state.rates = action.payload;
         state.status = "succeeded";
         },
      // for Loading Status-------------------------------(pawan)
       setRatesLoading: (state) => 
         {
         state.status = "loading";
         },
      // for Failed---------------------------------------(pawan)
        setRatesFailed: (state) =>
         {
        state.status = "failed";
          },
       }
   }
);
export const 
    {
    setCurrency,
    setDetectedCountry,
    setRates,
    setRatesLoading,
    setRatesFailed
     }= currencySlice.actions;
    export default currencySlice.reducer;