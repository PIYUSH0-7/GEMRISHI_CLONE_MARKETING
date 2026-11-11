"use client"

import { createContext, useContext, useState } from "react"

const ForgotPasswordContext = createContext()

export const useForgotPassword = () => {
  const context = useContext(ForgotPasswordContext)
  if (!context) {
    throw new Error("useForgotPassword must be used within ForgotPasswordProvider")
  }
  return context
}

export const ForgotPasswordProvider = ({ children }) => {
  const [email, setEmail] = useState("")
  const [verifiedOtp, setVerifiedOtp] = useState("")

  const value = {
    email,
    setEmail,
    verifiedOtp,
    setVerifiedOtp,
  }

  return <ForgotPasswordContext.Provider value={value}>{children}</ForgotPasswordContext.Provider>
}
