export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  AUD: "A$",
  CAD: "C$",
  
};
//------------------which currency to show a customer based on the country-----------(Pawan)
export const COUNTRY_TO_CURRENCY =
{
    IN:"INR",
    US:"USD",
    DE:"EUR",
    GB:"GBP",
    AE:"AED",
    AU:"AUD",
    CA:"CAD"
}
//------------------------amount always store in inr in database--------------------(Pawan) 
export const ConvertFromINR =(amountInInr,rates,targetCurrency)=>
{
    if (amountInInr == null || isNaN(amountInInr)) 
        return 0;
    if(targetCurrency==="INR" || !rates || !rates[targetCurrency])
        return Number (amountInInr);
    return Number(amountInInr)*rates[targetCurrency];
};
//--------------------------------functionality------------------------------------(pawan) 
export const formatCurrency=(amount,currency)=>
{
    const Symbol = CURRENCY_SYMBOLS[currency] || currency;
    const rounded=amount%1===0?amount:amount.toFixed(2);
    return `${Symbol} ${Number(rounded).toLocaleString("en-US")}`;
};
