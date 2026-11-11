import { useState } from "react";
import { motion } from "framer-motion";
import Shape from "../../assets/Shape.png";
import { useNavigate } from "react-router-dom";
import { useRetailerSendOtpMutation, useSendOtpMutation } from "../../features/api/apiSlice";

function RetailerForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const [sendOtp] = useRetailerSendOtpMutation();

  const handleSendOtp = async () => {
    setErrorMessage(""); // clear previous errors
    if (!email) {
      setErrorMessage("Please enter your email");
      return;
    }

    try {
      const response = await sendOtp(email).unwrap();
      // assuming API returns success message or otp sent
      // navigate to reset password page
      navigate("/retailer/verify", { state: { email } });
    } catch (error) {
      setErrorMessage(error?.data?.msg || error?.data?.message || error?.error || "Failed to send OTP. Try again.");
    }
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
        className="w-[90%] h-auto border border-gray-300 rounded-2xl bg-white flex items-center justify-center md:w-[500px] shadow-xl p-12"
      >
        <div className="w-[100%] h-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-3"
          >
            <h1 className="text-2xl lg:text-[25px] font-bold">
              Forgot Password
            </h1>
            <p className="text-sm text-[#202224]">Please enter your email</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col gap-3 mt-4"
          >
            <label className="text-gray-800">Email address:</label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: "#264A3F" }}
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);

                // Clear previous error immediately
                if (errorMessage) setErrorMessage("");

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                  setErrorMessage("Invalid email address");
                } else {
                  setErrorMessage(""); // clear error if valid
                }
              }}
              className="border border-gray-300 rounded-md p-2 w-full transition-all duration-200"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#1e3a32" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#264A3F] text-white rounded-md p-2 w-[300px] mt-4 flex items-center justify-center cursor-pointer"
              onClick={handleSendOtp}
            >
              Send OTP
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default RetailerForgotPassword;
