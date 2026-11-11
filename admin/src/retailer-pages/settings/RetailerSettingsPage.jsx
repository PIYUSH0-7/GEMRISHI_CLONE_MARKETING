import React, { useEffect } from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Separator } from "../../ui/separator";
import {
  ArrowLeft,
  Save,
  Building,
  CreditCard,
  Bell,
  Users,
  Gem,
  Settings as SettingsIcon,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import UpperBar from "../../components/UpperBar";
import {
  useChangeAdminPasswordMutation,
  useChangeRetailerPasswordMutation,
  useGetAdminProfileQuery,
  useGetRetailerProfileQuery,
  useUpdateAdminProfileMutation,
  useUpdateRetailerProfileMutation,
} from "../../features/api/apiSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import RetailerNavbar from "../../components/RetailerNavbar";
import RetailerUpperBar from "../../components/RetailerUpperBar";

function RetailerSettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetRetailerProfileQuery();


  const [updateRetailerProfile] = useUpdateRetailerProfileMutation();
  const [changePassword] = useChangeRetailerPasswordMutation();

  const [generalSettings, setGeneralSettings] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    timezone: "America/New_York",
    currency: "USD",
    language: "English",
    avatar: null,
  });

  const [preview, setPreview] = useState(generalSettings.avatar || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // show preview
      handleInputChange("general", "avatar", file); // update state
    }
  };

  useEffect(() => {
    if (profile) {
      setGeneralSettings((prev) => ({
        ...prev,
        email: profile?.profile?.email,
        phoneNumber: profile?.profile?.mobileNo,
        fullName: profile?.profile?.fullName,
        address: profile?.profile?.address,
        avatar: profile?.profile?.avatar?.url || null,
      }));
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Append all text fields
      formData.append("fullName", generalSettings.fullName);
      formData.append("mobileNo", generalSettings.phoneNumber);
      formData.append("email", generalSettings.email);
      formData.append("address", generalSettings.address);

      // Append avatar file with correct field name
      if (generalSettings.avatar instanceof File) {
        formData.append("retailerAvatar", generalSettings.avatar); // must match backend
      }

      const res = await updateRetailerProfile({
        generalSettings: formData,
        retailerId: profile?.profile?._id,
      }).unwrap();

      localStorage.setItem("retailerName", res.retailer.fullName);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Failed to update profile"
      );
    }
  };

  const [paymentSettings, setPaymentSettings] = useState({
    defaultTaxRate: "8.25",
    acceptCreditCards: true,
    acceptBankTransfer: true,
    acceptCryptocurrency: false,
    minimumOrderAmount: "100",
    maxInstallmentPeriod: "12",
    lateFeePercentage: "2.5",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewOrders: true,
    emailLowStock: true,
    emailCustomerInquiries: true,
    smsOrderUpdates: false,
    smsUrgentAlerts: true,
    pushNotifications: true,
    dailyReports: true,
    weeklyReports: false,
  });

  const [gemstoneSettings, setGemstoneSettings] = useState({
    defaultCertificationAuthority: "GIA",
    autoCalculatePricing: true,
    requireCertification: true,
    defaultWarrantyPeriod: "12",
    minimumCaratWeight: "0.25",
    maxCaratWeight: "10.00",
    defaultMarkupPercentage: "45",
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowGuestCheckout: true,
    enableInventoryTracking: true,
    autoBackup: true,
    backupFrequency: "daily",
    sessionTimeout: "60",
    maxLoginAttempts: "5",
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    loginEmailNotifications: true,
    passwordChangeEmailNotifications: true,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = "Please fill the current password field";
    if (!formData.newPassword)
      newErrors.newPassword = "Please fill the new password password field";
    if (!formData.confirmNewPassword)
      newErrors.confirmNewPassword = "Please fill the confirm password field";

    if (
      formData.newPassword &&
      formData.confirmNewPassword &&
      formData.newPassword !== formData.confirmNewPassword
    ) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }

    
    if(formData.newPassword === formData.currentPassword || formData.confirmNewPassword === formData.currentPassword) {
      newErrors.newPassword = "New password must be different from current password";
      newErrors.confirmNewPassword = "New password must be different from current password";
    }

    // if any errors exist, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmNewPassword,
      }).unwrap();
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(
        error?.data?.msg ||
          error?.data?.message ||
          error?.error ||
          "Something went wrong"
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // live password match check
      if (name === "newPassword" || name === "confirmNewPassword") {
        if (
          updated.newPassword &&
          updated.confirmNewPassword &&
          updated.newPassword !== updated.confirmNewPassword
        ) {
          setErrors((prev) => ({
            ...prev,
            confirmNewPassword: "Passwords do not match",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            confirmNewPassword: "",
          }));
        }
      }

      return updated;
    });

    // clear individual field error on change
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (field, value) => {
    setSecuritySettings((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    if (field === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleChangePassword = () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert("New password and confirmation do not match");
      return;
    }

    if (passwordStrength < 3) {
      alert("Password is too weak. Please use a stronger password.");
      return;
    }

    // Here you would typically make an API call to change the password
    setSecuritySettings((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    alert("Password changed successfully!");
  };

  const handleInputChange = (section, field, value) => {
    setHasUnsavedChanges(true);

    switch (section) {
      case "general":
        setGeneralSettings((prev) => ({ ...prev, [field]: value }));
        break;
      case "payment":
        setPaymentSettings((prev) => ({ ...prev, [field]: value }));
        break;
      case "notifications":
        setNotificationSettings((prev) => ({ ...prev, [field]: value }));
        break;
      case "gemstone":
        setGemstoneSettings((prev) => ({ ...prev, [field]: value }));
        break;
      case "system":
        setSystemSettings((prev) => ({ ...prev, [field]: value }));
        break;
      case "security":
        setSecuritySettings((prev) => ({ ...prev, [field]: value }));
        break;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] z-50 bg-white border-r border-gray-200">
        <RetailerNavbar
          isSidebarOpen={true}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
            onClick={closeSidebar}
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-[230px] bg-white border-r border-gray-200 lg:hidden"
          >
            <RetailerNavbar
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              closeSidebar={closeSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col relative z-10">
        <div className="w-full sticky top-0 z-20">
          <RetailerUpperBar toggleSidebar={toggleSidebar} />
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-[#120213]">
                    System Settings
                  </h1>
                  <p className="text-[#565656] mt-1">
                    Configure your gemstone business settings and preferences
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSave}
                className="bg-[#329141] hover:bg-[#264a3f] text-white flex items-center gap-2 cursor-pointer"
                disabled={!hasUnsavedChanges}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-1 lg:w-auto lg:grid-cols-1">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  General
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          id="avatar"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        {/* Upload button below input */}
                        <label
                          htmlFor="avatar"
                          className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                        >
                          Upload Photo
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Company Name</Label>
                        <Input
                          id="fullName"
                          value={generalSettings.fullName}
                          onChange={(e) =>
                            handleInputChange(
                              "general",
                              "fullName",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Business Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={generalSettings.email}
                          onChange={(e) =>
                            handleInputChange(
                              "general",
                              "email",
                              e.target.value
                            )
                          }
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          patten="[0-9]{10}"
                          maxLength="10"
                          value={generalSettings.phoneNumber}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/\D/g, "");

                            handleInputChange(
                              "general",
                              "phoneNumber",
                              onlyNums
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Textarea
                        id="address"
                        value={generalSettings.address}
                        onChange={(e) =>
                          handleInputChange(
                            "general",
                            "address",
                            e.target.value
                          )
                        }
                        rows={3}
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold mb-6 text-gray-700">
                        Change Password
                      </h2>
                      <form className="space-y-4">
                        {/* Current Password */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showPassword.currentPassword
                                  ? "text"
                                  : "password"
                              }
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleChange}
                              placeholder="Enter your current password"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                toggleShowPassword("currentPassword")
                              }
                              className="absolute top-2 right-2 text-gray-500"
                            >
                              {showPassword.currentPassword ? (
                                <FaEyeSlash />
                              ) : (
                                <FaEye />
                              )}
                            </button>
                          </div>
                          {errors.currentPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.currentPassword}
                            </p>
                          )}
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showPassword.newPassword ? "text" : "password"
                              }
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              placeholder="Enter your new password"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => toggleShowPassword("newPassword")}
                              className="absolute top-2 right-2 text-gray-500"
                            >
                              {showPassword.newPassword ? (
                                <FaEyeSlash />
                              ) : (
                                <FaEye />
                              )}
                            </button>
                          </div>
                          {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.newPassword}
                            </p>
                          )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={
                                showPassword.confirmNewPassword
                                  ? "text"
                                  : "password"
                              }
                              name="confirmNewPassword"
                              value={formData.confirmNewPassword}
                              onChange={handleChange}
                              placeholder="Confirm your new password"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                toggleShowPassword("confirmNewPassword")
                              }
                              className="absolute top-2 right-2 text-gray-500"
                            >
                              {showPassword.confirmNewPassword ? (
                                <FaEyeSlash />
                              ) : (
                                <FaEye />
                              )}
                            </button>
                          </div>
                          {errors.confirmNewPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.confirmNewPassword}
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          className=" bg-green-500 text-white py-2 px-2 rounded hover:bg-green-600 transition-colors"
                          onClick={handleSubmit}
                        >
                          Change Password
                        </button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Settings */}
              <TabsContent value="payment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          step="0.01"
                          value={paymentSettings.defaultTaxRate}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "defaultTaxRate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimumOrder">
                          Minimum Order Amount
                        </Label>
                        <Input
                          id="minimumOrder"
                          type="number"
                          value={paymentSettings.minimumOrderAmount}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "minimumOrderAmount",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="installmentPeriod">
                          Max Installment Period (months)
                        </Label>
                        <Input
                          id="installmentPeriod"
                          type="number"
                          value={paymentSettings.maxInstallmentPeriod}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "maxInstallmentPeriod",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lateFee">Late Fee Percentage (%)</Label>
                        <Input
                          id="lateFee"
                          type="number"
                          step="0.1"
                          value={paymentSettings.lateFeePercentage}
                          onChange={(e) =>
                            handleInputChange(
                              "payment",
                              "lateFeePercentage",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Accepted Payment Methods</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="creditCards">
                            Credit/Debit Cards
                          </Label>
                          <Switch
                            id="creditCards"
                            checked={paymentSettings.acceptCreditCards}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "payment",
                                "acceptCreditCards",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bankTransfer">Bank Transfer</Label>
                          <Switch
                            id="bankTransfer"
                            checked={paymentSettings.acceptBankTransfer}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "payment",
                                "acceptBankTransfer",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="cryptocurrency">Cryptocurrency</Label>
                          <Switch
                            id="cryptocurrency"
                            checked={paymentSettings.acceptCryptocurrency}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "payment",
                                "acceptCryptocurrency",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Email Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailNewOrders">New Orders</Label>
                            <p className="text-sm text-[#565656]">
                              Receive email when new orders are placed
                            </p>
                          </div>
                          <Switch
                            id="emailNewOrders"
                            checked={notificationSettings.emailNewOrders}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "notifications",
                                "emailNewOrders",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailLowStock">
                              Low Stock Alerts
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Get notified when inventory is running low
                            </p>
                          </div>
                          <Switch
                            id="emailLowStock"
                            checked={notificationSettings.emailLowStock}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "notifications",
                                "emailLowStock",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="emailInquiries">
                              Customer Inquiries
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Receive customer questions and inquiries
                            </p>
                          </div>
                          <Switch
                            id="emailInquiries"
                            checked={
                              notificationSettings.emailCustomerInquiries
                            }
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "notifications",
                                "emailCustomerInquiries",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">SMS Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="smsOrderUpdates">
                              Order Updates
                            </Label>
                            <p className="text-sm text-[#565656]">
                              SMS alerts for order status changes
                            </p>
                          </div>
                          <Switch
                            id="smsOrderUpdates"
                            checked={notificationSettings.smsOrderUpdates}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "notifications",
                                "smsOrderUpdates",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="smsUrgentAlerts">
                              Urgent Alerts
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Critical system alerts via SMS
                            </p>
                          </div>
                          <Switch
                            id="smsUrgentAlerts"
                            checked={notificationSettings.smsUrgentAlerts}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "notifications",
                                "smsUrgentAlerts",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Reports</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="dailyReports">Daily Reports</Label>
                            <p className="text-sm text-[#565656]">
                              Daily sales and inventory summary
                            </p>
                          </div>
                          <Switch
                            id="dailyReports"
                            checked={notificationSettings.dailyReports}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "notifications",
                                "dailyReports",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="weeklyReports">
                              Weekly Reports
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Comprehensive weekly business reports
                            </p>
                          </div>
                          <Switch
                            id="weeklyReports"
                            checked={notificationSettings.weeklyReports}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "notifications",
                                "weeklyReports",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gemstone Settings */}
              <TabsContent value="gemstone" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gemstone Business Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="certificationAuthority">
                          Default Certification Authority
                        </Label>
                        <Select
                          value={gemstoneSettings.defaultCertificationAuthority}
                          onValueChange={(value) =>
                            handleInputChange(
                              "gemstone",
                              "defaultCertificationAuthority",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GIA">
                              GIA - Gemological Institute of America
                            </SelectItem>
                            <SelectItem value="AGS">
                              AGS - American Gem Society
                            </SelectItem>
                            <SelectItem value="SSEF">
                              SSEF - Swiss Gemmological Institute
                            </SelectItem>
                            <SelectItem value="Gübelin">
                              Gübelin Gem Lab
                            </SelectItem>
                            <SelectItem value="AGL">
                              AGL - American Gemological Laboratories
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warrantyPeriod">
                          Default Warranty Period (months)
                        </Label>
                        <Input
                          id="warrantyPeriod"
                          type="number"
                          value={gemstoneSettings.defaultWarrantyPeriod}
                          onChange={(e) =>
                            handleInputChange(
                              "gemstone",
                              "defaultWarrantyPeriod",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minCarat">Minimum Carat Weight</Label>
                        <Input
                          id="minCarat"
                          type="number"
                          step="0.01"
                          value={gemstoneSettings.minimumCaratWeight}
                          onChange={(e) =>
                            handleInputChange(
                              "gemstone",
                              "minimumCaratWeight",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxCarat">Maximum Carat Weight</Label>
                        <Input
                          id="maxCarat"
                          type="number"
                          step="0.01"
                          value={gemstoneSettings.maxCaratWeight}
                          onChange={(e) =>
                            handleInputChange(
                              "gemstone",
                              "maxCaratWeight",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="markupPercentage">
                          Default Markup Percentage (%)
                        </Label>
                        <Input
                          id="markupPercentage"
                          type="number"
                          step="0.1"
                          value={gemstoneSettings.defaultMarkupPercentage}
                          onChange={(e) =>
                            handleInputChange(
                              "gemstone",
                              "defaultMarkupPercentage",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Business Rules</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoCalculatePricing">
                              Auto-Calculate Pricing
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Automatically calculate prices based on gemstone
                              properties
                            </p>
                          </div>
                          <Switch
                            id="autoCalculatePricing"
                            checked={gemstoneSettings.autoCalculatePricing}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "gemstone",
                                "autoCalculatePricing",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="requireCertification">
                              Require Certification
                            </Label>
                            <p className="text-sm text-[#565656]">
                              All high-value gemstones must have certification
                            </p>
                          </div>
                          <Switch
                            id="requireCertification"
                            checked={gemstoneSettings.requireCertification}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "gemstone",
                                "requireCertification",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={securitySettings.currentPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "currentPassword",
                                e.target.value
                              )
                            }
                            placeholder="Enter your current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={securitySettings.newPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "newPassword",
                                e.target.value
                              )
                            }
                            placeholder="Enter your new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {securitySettings.newPassword && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    passwordStrength === 1
                                      ? "w-1/5 bg-red-500"
                                      : passwordStrength === 2
                                      ? "w-2/5 bg-orange-500"
                                      : passwordStrength === 3
                                      ? "w-3/5 bg-yellow-500"
                                      : passwordStrength === 4
                                      ? "w-4/5 bg-blue-500"
                                      : passwordStrength === 5
                                      ? "w-full bg-green-500"
                                      : "w-0"
                                  }`}
                                />
                              </div>
                              <span className="text-sm text-gray-600 min-w-[60px]">
                                {passwordStrength === 1
                                  ? "Weak"
                                  : passwordStrength === 2
                                  ? "Fair"
                                  : passwordStrength === 3
                                  ? "Good"
                                  : passwordStrength === 4
                                  ? "Strong"
                                  : passwordStrength === 5
                                  ? "Very Strong"
                                  : ""}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Password should contain:</p>
                              <ul className="list-disc list-inside space-y-1 mt-1">
                                <li
                                  className={
                                    securitySettings.newPassword.length >= 8
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  At least 8 characters
                                </li>
                                <li
                                  className={
                                    /[A-Z]/.test(securitySettings.newPassword)
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  One uppercase letter
                                </li>
                                <li
                                  className={
                                    /[a-z]/.test(securitySettings.newPassword)
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  One lowercase letter
                                </li>
                                <li
                                  className={
                                    /[0-9]/.test(securitySettings.newPassword)
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  One number
                                </li>
                                <li
                                  className={
                                    /[^A-Za-z0-9]/.test(
                                      securitySettings.newPassword
                                    )
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }
                                >
                                  One special character
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={securitySettings.confirmPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            placeholder="Confirm your new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {securitySettings.confirmPassword &&
                          securitySettings.newPassword !==
                            securitySettings.confirmPassword && (
                            <p className="text-sm text-red-600">
                              Passwords do not match
                            </p>
                          )}
                      </div>

                      <Button
                        onClick={handleChangePassword}
                        className="bg-[#329141] hover:bg-[#264a3f] text-white"
                        disabled={
                          !securitySettings.currentPassword ||
                          !securitySettings.newPassword ||
                          !securitySettings.confirmPassword ||
                          securitySettings.newPassword !==
                            securitySettings.confirmPassword
                        }
                      >
                        Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="twoFactorEnabled">
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-[#565656]">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch
                          id="twoFactorEnabled"
                          checked={securitySettings.twoFactorEnabled}
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "security",
                              "twoFactorEnabled",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="loginEmailNotifications">
                            Login Email Notifications
                          </Label>
                          <p className="text-sm text-[#565656]">
                            Get notified when someone logs into your account
                          </p>
                        </div>
                        <Switch
                          id="loginEmailNotifications"
                          checked={securitySettings.loginEmailNotifications}
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "security",
                              "loginEmailNotifications",
                              checked
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="passwordChangeEmailNotifications">
                            Password Change Notifications
                          </Label>
                          <p className="text-sm text-[#565656]">
                            Get notified when your password is changed
                          </p>
                        </div>
                        <Switch
                          id="passwordChangeEmailNotifications"
                          checked={
                            securitySettings.passwordChangeEmailNotifications
                          }
                          onCheckedChange={(checked) =>
                            handleInputChange(
                              "security",
                              "passwordChangeEmailNotifications",
                              checked
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Settings */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">
                          Session Timeout (minutes)
                        </Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) =>
                            handleInputChange(
                              "system",
                              "sessionTimeout",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts">
                          Max Login Attempts
                        </Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          value={systemSettings.maxLoginAttempts}
                          onChange={(e) =>
                            handleInputChange(
                              "system",
                              "maxLoginAttempts",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backupFrequency">
                          Backup Frequency
                        </Label>
                        <Select
                          value={systemSettings.backupFrequency}
                          onValueChange={(value) =>
                            handleInputChange(
                              "system",
                              "backupFrequency",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">System Features</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="maintenanceMode">
                              Maintenance Mode
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Enable maintenance mode to prevent customer access
                            </p>
                          </div>
                          <Switch
                            id="maintenanceMode"
                            checked={systemSettings.maintenanceMode}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "system",
                                "maintenanceMode",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="guestCheckout">
                              Allow Guest Checkout
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Customers can place orders without creating an
                              account
                            </p>
                          </div>
                          <Switch
                            id="guestCheckout"
                            checked={systemSettings.allowGuestCheckout}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "system",
                                "allowGuestCheckout",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="inventoryTracking">
                              Enable Inventory Tracking
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Track stock levels and send low stock alerts
                            </p>
                          </div>
                          <Switch
                            id="inventoryTracking"
                            checked={systemSettings.enableInventoryTracking}
                            onCheckedChange={(checked) =>
                              handleInputChange(
                                "system",
                                "enableInventoryTracking",
                                checked
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoBackup">
                              Automatic Backups
                            </Label>
                            <p className="text-sm text-[#565656]">
                              Automatically backup system data
                            </p>
                          </div>
                          <Switch
                            id="autoBackup"
                            checked={systemSettings.autoBackup}
                            onCheckedChange={(checked) =>
                              handleInputChange("system", "autoBackup", checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailerSettingsPage;
