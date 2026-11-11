import { useState } from "react";
import { motion } from "framer-motion";
import Shape from "../../assets/Shape.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useResetPasswordMutation } from "../../features/api/apiSlice";
import { toast } from "react-toastify";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const [resetPassword] = useResetPasswordMutation();

  const validate = () => {
    const newErrors = { newPassword: "", confirmPassword: "" };
    const passwordRegex = /^(?=.*\d).{6,}$/;

    if (!newPassword) newErrors.newPassword = "New Password is required";
    else if (!passwordRegex.test(newPassword))
      newErrors.newPassword =
        "Password must be at least 6 characters and include a number";

    if (!confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    // return true if no errors
    return !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      toast.success("Password Reset Successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error?.data?.msg || error?.data?.message || error?.error || "Something went wrong");
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
        className="w-[90%] h-auto border border-gray-300 rounded-2xl bg-white flex items-center justify-center md:w-[500px] shadow-xl p-8"
      >
        <div className="w-[100%] h-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-3"
          >
            <h1 className="text-2xl lg:text-[25px] font-bold">
              Reset Password
            </h1>
            <p className="text-sm text-[#202224]">
              Enter your new password below
            </p>
          </motion.div>
          <label htmlFor="password">New Password</label>

          <motion.input
            whileFocus={{ scale: 1.02, borderColor: "#264A3F" }}
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => {
              const value = e.target.value;
              setNewPassword(value);

              // live validation
              const passwordRegex = /^(?=.*\d).{6,}$/;
              setErrors((prev) => ({
                ...prev,
                newPassword: !value
                  ? "New Password is required"
                  : !passwordRegex.test(value)
                  ? "Password must be at least 6 characters and include a number"
                  : "",
              }));
            }}
            className={`border rounded-md p-2 w-full transition-all duration-200 ${
              errors.newPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">{errors.newPassword}</p>
          )}

          <label htmlFor="password">Confirm Password</label>

          <motion.input
            whileFocus={{ scale: 1.02, borderColor: "#264A3F" }}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              const value = e.target.value;
              setConfirmPassword(value);

              setErrors((prev) => ({
                ...prev,
                confirmPassword: !value
                  ? "Confirm Password is required"
                  : value !== newPassword
                  ? "Passwords do not match"
                  : "",
              }));
            }}
            className={`border rounded-md p-2 w-full transition-all duration-200 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full flex flex-col items-center justify-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#1e3a32" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#264A3F] text-white rounded-md p-2 w-[300px] mt-4 flex items-center justify-center"
              onClick={handleResetPassword}
            >
              Reset Password
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
