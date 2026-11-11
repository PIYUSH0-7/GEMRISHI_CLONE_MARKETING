"use client"

import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { useLoginMutation } from "../features/api/apiSlice"
import { useDispatch, useSelector } from "react-redux"
import { setCredentials, clearRedirectPath } from "../features/api/authSlice"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
// import { withBase } from "../utils/withBase";
// Skeleton Loader
const FormSkeleton = () => (
  <div className="w-full space-y-6 animate-pulse">
    <div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
    <div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
    <div className="h-10 bg-gray-300 rounded-md"></div>
    <div className="text-center h-4 bg-gray-200 rounded w-1/2 mx-auto mt-4"></div>
  </div>
)

export default function LoginModal({ onClose, onSwitchToSignup, onForgotPassword }) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({ email: "", password: "", api: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { redirectPath } = useSelector((state) => state.auth)

  // Email Validation
  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required"
    if (/\s/.test(email)) return "Email must not contain spaces"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return ""
  }

  // Strong Password Validation
  const validatePassword = (password) => {
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters long"
    return ""
  }

  // Real-time Field Validation
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    let errorMsg = ""
    if (name === "email") errorMsg = validateEmail(value)
    if (name === "password") errorMsg = validatePassword(value)

    setErrors((prev) => ({ ...prev, [name]: errorMsg, api: "" }))
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLoading) return;

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError, api: "" })
      return
    }

    try {
      const userData = await login(formData).unwrap()
      dispatch(setCredentials(userData))
      toast.dismiss();
      toast.success("Login successful! Welcome back.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      onClose()
      // window.location = "/"
      // navigate(redirectPath || window.location.pathname, { replace: true });
      // const targetPath = redirectPath ? withBase(redirectPath) : withBase("/");
      // navigate(targetPath, { replace: true });
      navigate(redirectPath || "/", { replace: true })
      dispatch(clearRedirectPath());
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        api: err?.data?.message || "Invalid credentials. Please try again.",
      }))
      toast.error(err?.data?.message || "Login failed. Please check your credentials.", {
        position: "top-right",
        autoClose: 4000,
      })
    }
  }

  const handleCloseClick = () => {
    onClose()
  }

  const handleForgotPasswordClick = () => {
    if (onForgotPassword) onForgotPassword()
    else navigate("/forgot-password")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="bg-white rounded-[20px] shadow-2xl relative w-[547px] max-w-full" style={{ height: "520px" }}>
        {/* Header */}
        <div className="w-full h-[86px] rounded-t-[20px] bg-[#CBCCCB4D] flex items-center justify-center relative">
          <h2 className="text-3xl font-serif font-bold text-[#264A3F]">Log In</h2>
          <button
            onClick={handleCloseClick}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-12 flex flex-col items-center">
          {isLoading ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {errors.api && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
                  {errors.api}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border p-2 focus:ring focus:ring-[#264A3F] outline-none ${errors.email ? "border-red-500" : ""
                    }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-md border p-2 pr-10 focus:ring focus:ring-[#264A3F] outline-none ${errors.password ? "border-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end -mt-4">
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-gray-500 hover:text-[#264A3F] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                  onClick={(e) => {
                    if (isLoading) e.preventDefault();
                  }}
                className="w-full bg-[#264A3F] text-white py-2 rounded-md hover:bg-[#1e3a30] transition-colors"
              >
                Log In
              </button>

              <p className="text-center text-sm mt-4">
                Don&apos;t have an account?{" "}
                <button
                  onClick={onSwitchToSignup}
                  type="button"
                  className="text-[#264A3F] font-medium hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
