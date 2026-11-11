import React, { useState } from "react";
import Shape from "../../assets/Shape.png";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../features/api/apiSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecretPassword, setadminSecretPassword] = useState("");
  const [rememberPassword, setRememberPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);

  // const adminSecretPassword = import.meta.env.VITE_GEMSTONE_ADMIN_SECRET;
  const [adminRegister, { isLoading, error }] = useRegisterMutation();

  const handleSignup = async () => {
    // Basic validation
    const newErrors = {};
    if (!fullName) newErrors.fullName = "Full Name is required";
    if (!adminSecretPassword)
      newErrors.adminSecretPassword = "Admin Secret Password is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    const baseUrl = import.meta.env.VITE_BASE_SITE_URL;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const res = await adminRegister({
        fullName,
        email,
        password,
        // adminSecret,
        adminSecretPassword,
      }).unwrap();
      localStorage.setItem("adminName", res.admin.fullName);

      navigate(`${baseUrl}`);
    } catch (errpr) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
      // error handled below in JSX
    }
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setErrors((prev) => ({
      ...prev,
      email: !value
        ? "Email is required"
        : !emailRegex.test(value)
        ? "Invalid email address"
        : "",
    }));
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const alphaNumRegex = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

    setErrors((prev) => ({
      ...prev,
      password: !value
        ? "Password is required"
        : !alphaNumRegex.test(value)
        ? "Password must contain letters and numbers"
        : value.length < 6
        ? "Password must be at least 6 characters long"
        : "",
    }));
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        backgroundImage: `url(${Shape})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="w-[90%] max-w-md p-6 border rounded-2xl bg-white shadow-lg flex flex-col items-center justify-center md:p-8">
        <div className="w-full">
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create an Account
            </h1>
            <p className="text-sm text-gray-600">
              Create an account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md text-center bg-red-100 text-red-700">
              {error?.data?.message || "Signup failed. Please try again."}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label
              htmlFor="email"
              className="text-gray-800 text-sm font-medium"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#264A3F]"
              value={email}
              onChange={handleEmailChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <label
              htmlFor="username"
              className="text-gray-800 text-sm font-medium"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#264A3F]"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);

                setErrors((prev) => ({ ...prev, fullName: "" })); // Clear error on change
              }}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="text-gray-800 text-sm font-medium"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#264A3F]"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="adminSecretPassword"
                  className="text-gray-800 text-sm font-medium"
                >
                  Admin Secret Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showAdminSecret ? "text" : "password"}
                  id="adminSecretPassword"
                  placeholder="Admin Secret Password"
                  className="border border-gray-300 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#264A3F]"
                  value={adminSecretPassword}
                  onChange={(e) => {
                    setadminSecretPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      adminSecretPassword: "",
                    }));
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowAdminSecret(!showAdminSecret)}
                >
                  {showAdminSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.adminSecretPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.adminSecretPassword}
                </p>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-3 mt-6">
            <button
              className="bg-[#264A3F] text-white rounded-md p-3 w-full font-semibold hover:bg-opacity-90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <span
                className="text-[#264A3F] underline cursor-pointer hover:text-[#1e3a32]"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
