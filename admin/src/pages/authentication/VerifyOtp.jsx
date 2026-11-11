import { useState } from "react";
import { motion } from "framer-motion";
import Shape from "../../assets/Shape.png";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../features/api/apiSlice";
import { useLocation } from "react-router-dom";

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const { email } = location.state || [];
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);

  // Update otpValues when user types in inputs
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return; // allow only digits

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Move focus to next input if value is not empty and next exists
    if (value && index < otpValues.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleContinue = () => {
    const otp = otpValues.join(""); // combine all input digits
    navigate("/reset-password", { state: { email, otp } });
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{
        backgroundImage: `url(${Shape})`,
        width: "100vw",
        height: "100vh",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 25 }}
        className="w-[90%] md:w-[400px] h-auto border border-gray-300 rounded-2xl bg-white shadow-xl p-8 flex flex-col items-center"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-2 mb-6"
        >
          <h1 className="text-2xl font-bold">Verify Account</h1>
          <p className="text-sm text-gray-700 text-center">
            Code has been sent to your email {email}. Please enter it below
          </p>
        </motion.div>

        {/* OTP Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex gap-2 justify-center mb-6"
        >
          {otpValues.map((_, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpValues[index]}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otpValues[index] && index > 0) {
                  const prevInput = document.getElementById(`otp-${index - 1}`);
                  prevInput?.focus();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const paste = e.clipboardData
                  .getData("text")
                  .slice(0, 6)
                  .split("");
                const newOtp = [...otpValues];
                paste.forEach((val, i) => {
                  if (i < newOtp.length && /^[0-9]$/.test(val)) newOtp[i] = val;
                });
                setOtpValues(newOtp);
                const nextIndex = paste.length < 6 ? paste.length : 5;
                document.getElementById(`otp-${nextIndex}`)?.focus();
              }}
              className="w-12 h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
            />
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#1e3a32" }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#264A3F] text-white rounded-md p-2 w-full mt-2"
          onClick={handleContinue}
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}

export default VerifyOtp;
