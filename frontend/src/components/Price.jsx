import { useSelector } from "react-redux";
import {ConvertFromINR,formatCurrency} from "../utils/currency";
const Price=({ amount=0,className=""})=>
{
      const {currency,rates}=useSelector((s)=>s.currency);
      const converted= ConvertFromINR(amount,rates,currency);
      return <span className={className}>
               {formatCurrency (converted,currency)}
             </span>;
}
export default Price; 