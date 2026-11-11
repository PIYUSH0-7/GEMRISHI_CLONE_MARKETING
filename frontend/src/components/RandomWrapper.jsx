// RandomWrapper is disabled - random string is now appended at the END of product/jewelry URLs only
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const RandomWrapper = ({ children }) => {
    // This wrapper no longer adds random string as prefix
    // Random strings are now appended at the END of product/jewelry URLs only
    return children;
};

export default RandomWrapper;