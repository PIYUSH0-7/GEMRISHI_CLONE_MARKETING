import { useState } from "react";
import { motion } from "framer-motion";
import Shape from "../../assets/Shape.png";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../features/api/apiSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [adminLogin, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const baseUrl = import.meta.env.VITE_BASE_SITE_URL;
    setErrorMessage("");
    let hasError = false;

    if (!email) {
      setEmailErrorMessage("Email is required");
      hasError = true;
    }

    if (!password) {
      setPasswordErrorMessage("Password is required"); // similarly for password
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await adminLogin({ email, password }).unwrap(); // unwrap to handle errors
      localStorage.setItem("adminName", res.admin.fullName);
      // navigate("/gemstone/admin/");
      window.location = `${baseUrl}`;
    } catch (error) {
      setErrorMessage(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Login failed. Try again later."
      );
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Clear previous error immediately
    if (emailErrorMessage) setEmailErrorMessage("");

    // Optional: show error only if input is non-empty and invalid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setEmailErrorMessage("Invalid email address");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Clear previous error immediately while typing
    if (passwordErrorMessage) setPasswordErrorMessage("");
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
        className="w-[90%] h-[450px] border border-gray-300 rounded-2xl bg-white lg:w-[450px] lg:h-[500px] flex items-center justify-center md:w-[500px] shadow-xl"
      >
        <div className="w-[90%] h-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-3"
          >
            <h1 className="text-2xl lg:text-[25px] font-bold">
              Login to Account
            </h1>
            <p className="text-sm text-[#202224]">
              Please enter your email and password to continue
            </p>
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
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={handleEmailChange}
              className="border border-gray-300 rounded-md p-2 w-full transition-all duration-200"
            />
            {emailErrorMessage && (
              <p className="text-red-500 text-sm">{emailErrorMessage}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col gap-3 mt-4"
          >
            <div className="flex justify-between items-center">
              <label className="text-gray-800">Password:</label>
              <motion.p
                whileHover={{ color: "#264A3F" }}
                className="text-gray-500 cursor-pointer"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </motion.p>
            </div>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.02, borderColor: "#264A3F" }}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="border border-gray-300 rounded-md p-2 w-full transition-all duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-[#264A3F]"
              >
                {showPassword ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </button>
            </div>
            {passwordErrorMessage && (
              <p className="text-red-500 text-sm">{passwordErrorMessage}</p>
            )}

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-2"
              >
                {error.data?.message || "An error occurred. Please try again."}
              </motion.p>
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
              className="bg-[#264A3F] text-white rounded-md p-2 w-[300px] mt-4 flex items-center justify-center"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm text-gray-500"
            >
              Don't have an account?{" "}
              <motion.span
                whileHover={{ color: "#264A3F", scale: 1.05 }}
                className="text-[#264A3F] underline cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </motion.span>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
