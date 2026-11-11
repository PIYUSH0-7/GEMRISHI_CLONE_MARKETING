import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { data } from "react-router-dom";
const API_URL = import.meta.env.VITE_URL;
const X_ACCESS_TOKEN = import.meta.env.VITE_GOLDAPI_X_ACCESS_TOKEN;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  // baseQuery: fetchBaseQuery({ baseUrl: "https://zynotex.com/api/api/v1/" }),
  tagTypes: [
    "Product",
    "Products",
    "Jewelleries",
    "Jewellery",
    "FeaturedProducts",
    "Orders",
    "Order",
    "Users",
    "User",
    "OrderDashboardMetrics",
    "RevenueByMonthYear",
    "AdminProfile",
    "RetailerProfile",
    "Banners",
    "Categories",
    "JewelleryCategories",
    "SubCategory",
    "Subcategories",
    "JewellerySubCategory",
    "JewellerySubcategories",
    "Retailer",
    "Retailers",
    "MetalRates",
    "Countries",
    "Offers",
    "Cart",
    "BBRequests"
  ],
  endpoints: (builder) => ({
    // AUTHENTICATION ENDPOINTS
    login: builder.mutation({
      query: (loginData) => ({
        url: "admin/admin_login",
        method: "POST",
        body: loginData,
        credentials: "include",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "admin/admin_logout",
        method: "POST",
        credentials: "include",
      }),
    }),
    register: builder.mutation({
      query: (registerData) => ({
        url: "admin/admin_register",
        method: "POST",
        body: registerData,
        credentials: "include",
      }),
    }),
    sendOtp: builder.mutation({
      query: (email) => ({
        url: "admin/send-otp",
        method: "POST",
        body: { email },
        credentials: "include",
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: "admin/reset-password",
        method: "POST",
        body: { email, otp, newPassword },
        credentials: "include",
      }),
    }),
    getAdminProfile: builder.query({
      query: () => ({
        url: "admin/get_admin_profile",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "AdminProfile" }],
    }),
    updateAdminProfile: builder.mutation({
      query: (generalSettings) => ({
        url: "admin/update_admin_profile",
        method: "PUT",
        body: generalSettings,
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "AdminProfile" }],
    }),
    changeAdminPassword: builder.mutation({
      query: ({ currentPassword, newPassword, confirmPassword }) => ({
        url: "admin/change_admin_password",
        method: "PUT",
        body: { currentPassword, newPassword, confirmPassword },
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "AdminProfile"}],
    }),
    // CATEGORY ENDPOINTS FOR GEMSTONE
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "category/create-category",
        method: "POST",
        body: categoryData,
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Categories" }],
    }),
    getCategory: builder.query({
      query: () => ({
        url: "category/get-categories",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "Categories" }],
    }),
    changeCategoryOrder: builder.mutation({
      query: (data) => ({
        url: "/category/change-order",
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Category"],
    }),
    deleteSingleCategory: builder.mutation({
      query: (categoryId) => ({
        url: `category/delete-category/${categoryId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "Categories" }],
    }),
    // SUBCATEGORY ENDPOINTS FOR GEMSTONE
    createSubCategory: builder.mutation({
      query: ({ categoryId, formData }) => ({
        url: `subcategory/create-subcategory/${categoryId}`,
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "Categories" }],
    }),
    getSubCategory: builder.query({
      query: () => ({
        url: "subcategory/get-subcategories",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "Subcategories" }],
    }),
    getSingleSubCategory: builder.query({
      query: ({ slug, page = 1, limit = 10 }) => ({
        url: `subcategory/single-subcategory/${slug}?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [
        { type: "SubCategory", id: result?.subcategory?._id },
      ],
    }),
    updateSubCategory: builder.mutation({
      query: ({ subcategoryId, formData }) => ({
        url: `subcategory/update-subcategory/${subcategoryId}`,
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { subcategoryId }) => [
        { type: "SubCategory", id: subcategoryId },
        { type: "Categories" },
      ],
    }),
    deleteSubcategory: builder.mutation({
      query: (subcategoryId) => ({
        url: `subcategory/delete-subcategory/${subcategoryId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "Categories" }],
    }),
    // PRODUCT ENDPOINTS FOR GEMSTONE
    createProduct: builder.mutation({
      query: ({ subCategoryId, data }) => ({
        url: `product/create-gemstone/${subCategoryId}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getProducts: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `product/get-all-gemstones?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, arg) => [{ type: "Products" }],
    }),
    getFeaturedProducts: builder.query({
      query: () => ({
        url: "/product/featured-products", // 15 limit
        method: "GET",
        credentials: "include",
      }),
      providesTags: (res, err, arg) => [{ type: "FeaturedProducts" }],
    }),
    getSingleProduct: builder.query({
      query: (slug) => ({
        url: `product/single-gemstone/${slug}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [
        { type: "Product", id: result?.product?._id },
      ],
    }),
    editSingleProduct: builder.mutation({
      query: ({ productId, formData }) => ({
        url: `product/update-gemstone/${productId}`,
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Products" },
        { type: "SubCategory", id: result?.updatedProd?.subCategory },
        { type: "Categories" },
      ],
    }),
    deleteSingleProduct: builder.mutation({
      query: (productId) => ({
        url: `/product/delete-gemstone/${productId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Products" }],
    }),
    editSingleProductImage: builder.mutation({
      query: ({ productId, imageId, file }) => ({
        url: `/product/edit-image/${productId}/${imageId}`,
        method: "PUT",
        body: file,
        credentials: "include",
      }),
      invalidatesTags: (res, err, { productId }) => [
        { type: "Products" },
        {
          type: "Product",
          id: productId,
        },
      ],
    }),
    deleteSingleProductImage: builder.mutation({
      query: ({ productId, imageId }) => ({
        url: `/product/delete-image/${productId}/${imageId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (res, err, { productId }) => [
        { type: "Product", id: productId },
        { type: "Products" },
      ],
    }),
    editSingleProductVideo: builder.mutation({
      query: ({ productId, videoId, file }) => ({
        url: `/product/edit-video/${productId}/${videoId}`,
        method: "PUT",
        body: file,
        credentials: "include",
      }),
      invalidatesTags: (res, err, { productId }) => [
        { type: "Product", id: productId },
        { type: "Products" },
      ],
    }),
    deleteSingleProductVideo: builder.mutation({
      query: ({ productId, videoId }) => ({
        url: `/product/delete-video/${productId}/${videoId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (res, err, { productId }) => [
        { type: "Product", id: productId },
        { type: "Products" },
      ],
    }),
    // CATEGORY ENDPOINTS FOR JEWELLERY
    createJewelleryCategory: builder.mutation({
      query: (jewelryCategoryData) => ({
        url: "/jewelryCategory/create-jewelry-category",
        method: "POST",
        body: jewelryCategoryData,
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "JewelleryCategories" }],
    }),
    getJewelryCategory: builder.query({
      query: () => ({
        url: "/jewelryCategory/get-jewelry-categories",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "JewelleryCategories" }],
    }),
    deleteSingleJewelleryCategory: builder.mutation({
      query: (jewelryCategoryId) => ({
        url: `/jewelryCategory/delete-jewelry-category/${jewelryCategoryId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "JewelleryCategories" }],
    }),
    // SUB-CATEGORY ENDPOINTS FOR JEWELLERY
    createJewellerySubCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/jewelrySubCategory/create-jewelry-subcategory/${categoryId}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "JewelleryCategories" }],
    }),
    getJewellerySubCategory: builder.query({
      query: () => ({
        url: "/jewelrySubCategory/get-jewelry-subcategories",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "JewellerySubcategories" }],
    }),
    getSingleJewellerySubCategory: builder.query({
      query: ({ slug, page = 1, limit = 10 }) => ({
        url: `/jewelrySubCategory/single-jewelry-subcategory/${slug}?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [
        { type: "JewellerySubCategory", id: result?.subcategory?._id },
      ],
    }),
    updateJewellerySubCategory: builder.mutation({
      query: ({ jewelrysubCategoryId, formData }) => ({
        url: `/jewelrySubCategory/update-jewelry-subcategory/${jewelrysubCategoryId}`,
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { jewelrysubCategoryId }) => [
        { type: "JewellerySubCategory", id: jewelrysubCategoryId },
        { type: "JewelleryCategories" },
      ],
    }),
    deleteJewellerySubCategory: builder.mutation({
      query: (jewelrysubCategoryId) => ({
        url: `/jewelrySubCategory/delete-jewelry-subcategory/${jewelrysubCategoryId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "JewelleryCategories" }],
    }),
    // JEWELLERY ENDPOINTS
    createJewellery: builder.mutation({
      query: ({
        productSubCategoryId,
        jewellerySubcategoryId,
        jewelleryData,
      }) => ({
        url: `/jewelry/create-jewelry/${productSubCategoryId}/${jewellerySubcategoryId}`,
        method: "POST",
        body: jewelleryData,
        credentials: "include",
      }),
    }),
    getJewelleries: builder.query({
      query: ({ page, limit, jewelryType }) => ({
        url: `/jewelry/get-all-jewelry?page=${page}&limit=${limit}&jewelryType=${jewelryType}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, err, arg) => [{ type: "Jewelleries" }],
    }),
    getSingleJewellery: builder.query({
      query: (slug) => ({
        url: `/jewelry/single-jewelry/${slug}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, err) => [
        { type: "Jewellery", id: result?.jewelry?._id },
      ],
    }),
    editJewellery: builder.mutation({
      query: ({ formData, jewelryId }) => ({
        url: `/jewelry/update-jewelry/${jewelryId}`,
        body: formData,
        method: "PUT",
        credentials: "include",
      }),
      invalidatesTags: (res, err, { jewelryId }) => [
        { type: "Jewellery", id: jewelryId },
        { type: "Jewelleries" },
        { type: "JewellerySubCategory", id: res?.updatedProd?.subCategory },
      ],
    }),
    deleteJewellery: builder.mutation({
      query: (jewelryId) => ({
        url: `/jewelry/delete-jewelry/${jewelryId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Jewelleries" }],
    }),
    editSingleJewelleryImage: builder.mutation({
      query: ({ jewelryId, imageId, file }) => ({
        url: `/jewelry/edit-image/${jewelryId}/${imageId}`,
        method: "PUT",
        body: file,
        credentials: "include",
      }),
      invalidatesTags: (res, err, { jewelryId }) => [
        { type: "Jewellery", id: jewelryId },
        { type: "Jewelleries" },
      ],
    }),
    deleteSingleJewelleryImage: builder.mutation({
      query: ({ jewelryId, imageId }) => ({
        url: `/jewelry/delete-image/${jewelryId}/${imageId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (res, err, { jewelryId }) => [
        { type: "Jewellery", id: jewelryId },
        { type: "Jewelleries" },
      ],
    }),
    editSingleJewelleryVideo: builder.mutation({
      query: ({ jewelryId, videoId, file }) => ({
        url: `/jewelry/edit-video/${jewelryId}/${videoId}`,
        method: "PUT",
        body: file,
        credentials: "include",
      }),
      invalidatesTags: (res, err, { jewelryId }) => [
        { type: "Jewellery", id: jewelryId },
        { type: "Jewelleries" },
      ],
    }),
    deleteSingleJewelleryVideo: builder.mutation({
      query: ({ jewelryId, videoId }) => ({
        url: `/jewelry/delete-video/${jewelryId}/${videoId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (res, err, { jewelryId }) => [
        { type: "Jewellery", id: jewelryId },
        { type: "Jewelleries" },
      ],
    }),
    // ORDERS ENDPOINTS
    getOrders: builder.query({
      query: ({ page, limit, search, orderStatus }) => ({
        url: `/order/get-all-orders`,
        method: "GET",
        params: { page, limit, search, orderStatus },
        credentials: "include",
      }),
      providesTags: (res, err) => [{ type: "Orders" }],
    }),
    getOrdersForCsv: builder.query({
      query: () => ({
        url: "/order/orders-for-csv",
        method: "GET",
        credentials: "include",
      }),
    }),
    getSingleOrder: builder.query({
      query: (orderId) => ({
        url: `/order/get-single-order/${orderId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (res, err, orderId) => [{ type: "Order", id: orderId }],
    }),
    updateOrder: builder.mutation({
      query: ({ orderId, paymentStatus, orderStatus }) => ({
        url: `/order/update-order/${orderId}`,
        method: "PUT",
        body: { paymentStatus, orderStatus },
        credentials: "include",
      }),
      invalidatesTags: (res, err, { orderId }) => [
        { type: "Orders" },
        { type: "Order", id: orderId },
      ],
    }),
    getAllOrderUsers: builder.query({
      query: ({ page, limit, search }) => ({
        url: "/order/get-all-customers",
        method: "GET",
        params: { page, limit, search },
        credentials: "include",
      }),
      providesTags: (res, err) => [{ type: "Users" }],
    }),
    orderDashboardMetrics: builder.query({
      query: () => ({
        url: "/order/dashboard-metrics",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (res, err) => [{ type: "OrderDashboardMetrics" }],
    }),
    bestSellers: builder.query({
      query: () => ({
        url: "/order/best-sellers?type=product",
        method: "GET",
        credentials: "include",
      }),
    }),
    // ANALYTICS DASHBOARD ENDPOINTS
    getReveuneByMonthYear: builder.query({
      query: () => ({
        url: "/analytics/revenue",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (res, err) => [{ type: "RevenueByMonthYear" }],
    }),
    getOrdersCountByMonthYear: builder.query({
      query: () => ({
        url: "/analytics/ordersCount",
        method: "GET",
        credentials: "include",
      }),
    }),
    getInventoryData: builder.query({
      query: () => ({
        url: "/analytics/inventory",
        method: "GET",
        credentials: "include",
      }),
    }),
    getOrderStats: builder.query({
      query: () => ({
        url: "/analytics/order-stats",
        method: "GET",
        credentials: "include",
      }),
    }),
    // country/origin endpoints
    createCountryOrigin: builder.mutation({
      query: (data) => ({
        url: "/originCountryMap/add_country",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: (res, err) => [{ type: "Countries" }],
    }),
    getCountriesData: builder.query({
      query: () => ({
        url: "/originCountryMap/get_all_country_list",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (res, err) => [{ type: "Countries" }],
    }),
    updateSingleCountryOrigin: builder.mutation({
      query: (data) => ({
        url: "/originCountryMap/update_country_details",
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Countries" }],
    }),
    // BANNER/PROMOTION ENDPOINTS
    createBanner: builder.mutation({
      query: (data) => ({
        url: "/banner/create_banner",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "Banners" }],
    }),
    getBanners: builder.query({
      query: () => ({
        url: "/banner/get_all_banner_admin",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (res, err) => [{ type: "Banners" }],
    }),
    deleteBanner: builder.mutation({
      query: (bannerId) => ({
        url: `/banner/delete_banner?bannerId=${bannerId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Banners" }],
    }),
    updateBanner: builder.mutation({
      query: (payload) => ({
        url: "/banner/update_banner",
        method: "PUT",
        body: payload,
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "Banners" }],
    }),
    // METAL RATES ENDPOINTS
    goldRate: builder.query({
      query: (currency = "INR") => ({
        url: `https://www.goldapi.io/api/XAU/${currency}`,
        method: "GET",
        headers: X_ACCESS_TOKEN
          ? {
              "x-access-token": X_ACCESS_TOKEN,
            }
          : {},
      }),
      keepUnusedDataFor: 3600, // keep data for 10 minutes
    }),
    silverRate: builder.query({
      query: (currency = "INR") => ({
        url: `https://www.goldapi.io/api/XAG/${currency}`,
        method: "GET",
        headers: X_ACCESS_TOKEN
          ? {
              "x-access-token": X_ACCESS_TOKEN,
            }
          : {},
      }),
      keepUnusedDataFor: 3600,
    }),
    addRates: builder.mutation({
      query: (data) => ({
        url: "/metalRates/add_metal_rates",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [
        { type: "MetalRates" },
        { type: "Jewelleries" },
      ],
    }),
    getLatestMetalRate: builder.query({
      query: () => ({
        url: "/metalRates/get_latest_metal_rate",
        method: "GET",
        credentials: "include",
      }),
      providesTags: () => [{ type: "MetalRates" }],
    }),
    syncJewelryPrices: builder.mutation({
      query: () => ({
        url: "/metalRates/sync_jewelry_prices",
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Jewelleries" }],
    }),
    metalRatesHistory: builder.query({
      query: ({ page, limit = 10 }) => ({
        url: `/metalRates/metal_rates_history?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "MetalRates" }],
    }),
    // retailer api endpoints
    createRetailer: builder.mutation({
      query: (data) => ({
        url: "/retailer/register",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "Retailers" }],
    }),
    getAllRetailer: builder.query({
      query: ({ page, limit }) => ({
        url: `/retailer/get_all_retailers_list?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "Retailers" }],
    }),
    getSingleRetailer: builder.query({
      query: (retailerId) => ({
        url: `/retailer/get-single-retailer/${retailerId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error,  retailerId ) => [
        { type: "Retailer", id: retailerId },
      ],
    }),
    getRetailerStock: builder.query({
      query: ({ retailerId, page, limit }) => ({
        url: `/retailer/get-retailer-stock/${retailerId}`,
        method: "GET",
        params: { page, limit},
        credentials: "include",
      }),
      providesTags: (result, error, { retailerId }) => [
        { type: "RetailerStock", id: retailerId },
      ],
    }),
    createBuyBackRequest: builder.mutation({
      query: ({ retailerId, quantity = 1, items }) => ({
        url: "/buyBackReq/create-request",
        method: "POST",
        body: { retailerId, quantity, items },
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "RetailerStock" }],
    }),
    getBusinessSummary: builder.query({
      query: (retailerId) => ({
        url: `/retailer/get-business-summary/${retailerId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    getRetailerOrders: builder.query({
      query: ({ page, limit }) => ({
        url: `/retailer/get-all-orders-by-retailer?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    blockOrUnblockRetailer: builder.mutation({
      query: ({ retailerId, status }) => ({
        url: "/retailer/block_unblock_retailer_by_admin",
        method: "PUT",
        body: { retailerId, status },
        credentials: "include",
      }),
      invalidatesTags: (res, err, { retailerId }) => [
        { type: "Retailer", id: retailerId },
      ],
    }),
    getRetailerStockByToken: builder.query({
      query: ({ page, limit }) => ({
        url: `retailer/get_all_stock_list?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    retailerDashboardStats: builder.query({
      query: () => ({
        url: "/retailer/dashboard-stats",
        method: "GET",
        credentials: "include",
      }),
    }),
    // retailer auth api endpoints
    retailerLogin: builder.mutation({
      query: ({ email, password }) => ({
        url: "/retailer/login",
        method: "POST",
        body: { email, password },
        credentials: "include",
      }),
    }),
    retailerRegister: builder.mutation({
      query: () => ({
        url: "/retailer/register",
        method: "POST",
        credentials: "include",
      }),
    }),
    retailerLogout: builder.mutation({
      query: () => ({
        url: "/retailer/logout",
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "RetailerProfile"}]
    }),
    retailerSendOtp: builder.mutation({
      query: (email) => ({
        url: "/retailer/send-otp",
        method: "POST",
        body: { email },
        credentials: "include",
      }),
    }),
    retailerResetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: "/retailer/reset-password",
        method: "POST",
        body: { email, otp, newPassword },
        credentials: "include",
      }),
    }),
    getRetailerProfile: builder.query({
      query: () => ({
        url: "/retailer/profile",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error) => [{ type: "RetailerProfile" }],
    }),
    updateRetailerProfile: builder.mutation({
      query: ({generalSettings, retailerId}) => ({
        url: `/retailer/update-retailer/${retailerId}`,
        method: "PUT",
        body: generalSettings,
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "RetailerProfile" }],
    }),
    changeRetailerPassword: builder.mutation({
      query: ({ currentPassword, newPassword, confirmPassword }) => ({
        url: "/retailer/change-retailer-password",
        method: "PUT",
        body: { currentPassword, newPassword, confirmPassword },
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "RetailerProfile"}],
    }),
    // retailer cart api endpoints
    addInCart: builder.mutation({
      query: ({ itemId, quantity = 1, customization }) => ({
        url: "/retailerCart/add_item_in_cart",
        method: "POST",
        body: { itemId, quantity, customization },
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Cart" }],
    }),
    getCart: builder.query({
      query: () => ({
        url: "/retailerCart/get_all_cart_list",
        method: "GET",
        credentials: "include",
      }),
      providesTags: () => [{ type: "Cart" }],
    }),
    removeItemFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/retailerCart/remove_item_from_cart/${itemId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Cart" }],
    }),
    // retailer order api endpoints
    retailerOrder: builder.mutation({
      query: ({ address, paymentMethod }) => ({
        url: "/order/create-retailer-order",
        method: "POST",
        body: { address, paymentMethod },
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Cart" }],
    }),
    verifyRetailerOrder: builder.mutation({
      query: ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => ({
        url: "/order/verify-order",
        method: "POST",
        body: { razorpayOrderId, razorpayPaymentId, razorpaySignature },
        credentials: "include",
      }),
      invalidatesTags: () => [{ type: "Cart" , type: "Orders" }],
    }),
    // buy back requests
    getPendingRequests: builder.query({
      query: ({ page, limit }) => ({
        url: `/buyBackReq/get-pending-requests?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: () => [
        { type: "BBRequests"}
      ]
    }),
    getAllRequests: builder.query({
      query: ({ page, limit }) => ({
        url: `/buyBackReq/get-all-requests?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: () => [
        { type: "BBRequests"}
      ]
    }),
    updateRequest: builder.mutation({
      query: ({ requestId, status }) => ({
        url: `/buyBackReq/update-request/${requestId}`,
        method: "PUT",
        body: { status },
        credentials: "include",
      }),
      invalidatesTags: () => [
        { type: "BBRequests"}
      ]
    }),
    getBuyBackSummary: builder.query({
      query: () => ({
        url: "/retailer/buy-back-summary",
        method: "GET",
        credentials: "include"
      }),
    }),
    // offer api endpoints
    createOffer: builder.mutation({
      query: (offerData) => ({
        url: "/offer/create_offer",
        method: "POST",
        body: offerData,
        credentials: "include",
      }),
    }),
    getOffers: builder.query({
      query: ({ page, limit }) => ({
        url: `/offer/get_all_offers_admin?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (res, err) => [
        {
          type: "Offers",
        },
      ],
    }),
    updateOffer: builder.mutation({
      query: ({ offerId, data }) => ({
        url: `/offer/update_offer/${offerId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: () => [
        {
          type: "Offers",
        },
      ],
    }),
    deleteOffer: builder.mutation({
      query: (offerId) => ({
        url: `/offer/delete_offer/${offerId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: () => [
        {
          type: "Offers",
        },
      ],
    }),
    // contact lists
    getContacts: builder.query({
      query: ({ page, limit }) => ({
        url: `/contactUs/get_all_contact_us_list?$page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    getSubscribers: builder.query({
      query: ({ page, limit }) => ({
        url: `/emailsub/get_emails_list?isActive=all&page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    // reviews api endpoints
    getAllReviews: builder.query({
      query: ({page, limit}) => ({
        url: `/reviewRating/get-all-reviews`,
        method: "GET",
        params: { page, limit },
        credentials: "include",
      }),
    }),
    // search api, dashboard endpoints etc
    searchProducts: builder.query({
      query: ({ search, page, limit }) => ({
        url: `/product/search?keyword=${search}&page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    salesData: builder.query({
      query: () => ({
        url: "/dashboard/sales",
        method: "GET",
        credentials: "include",
      }),
    }),
    customerStats: builder.query({
      query: () => ({
        url: "/analytics/customer-stats",
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  //auth
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useChangeAdminPasswordMutation,
  useSendOtpMutation,
  useResetPasswordMutation,
  // retailer auth endpoints
  useRetailerLoginMutation,
  useGetRetailerProfileQuery,
  useRetailerLogoutMutation,
  useUpdateRetailerProfileMutation,
  useChangeRetailerPasswordMutation,
  useRetailerSendOtpMutation,
  useRetailerResetPasswordMutation,
  // gemstone category & subcategory
  useCreateCategoryMutation,
  useGetCategoryQuery,
  useChangeCategoryOrderMutation,
  useDeleteSingleCategoryMutation,
  useCreateSubCategoryMutation,
  useGetSubCategoryQuery,
  useGetSingleSubCategoryQuery,
  useUpdateSubCategoryMutation,
  useDeleteSubcategoryMutation,
  // gemstone product
  useCreateProductMutation,
  useGetProductsQuery,
  useGetSingleProductQuery,
  useEditSingleProductMutation,
  useDeleteSingleProductMutation,
  useEditSingleProductImageMutation,
  useDeleteSingleProductImageMutation,
  useEditSingleProductVideoMutation,
  useDeleteSingleProductVideoMutation,
  useGetFeaturedProductsQuery,
  // jewellery Category & subcategory
  useCreateJewelleryCategoryMutation,
  useGetJewelryCategoryQuery,
  useDeleteSingleJewelleryCategoryMutation,
  useCreateJewellerySubCategoryMutation,
  useGetJewellerySubCategoryQuery,
  useGetSingleJewellerySubCategoryQuery,
  useUpdateJewellerySubCategoryMutation,
  useDeleteJewellerySubCategoryMutation,
  // jewellery
  useCreateJewelleryMutation,
  useGetJewelleriesQuery,
  useGetSingleJewelleryQuery,
  useEditJewelleryMutation,
  useDeleteJewelleryMutation,
  useEditSingleJewelleryImageMutation,
  useEditSingleJewelleryVideoMutation,
  useDeleteSingleJewelleryImageMutation,
  useDeleteSingleJewelleryVideoMutation,
  // order
  useGetOrdersQuery,
  useGetSingleOrderQuery,
  useUpdateOrderMutation,
  useGetAllOrderUsersQuery,
  useOrderDashboardMetricsQuery,
  useBestSellersQuery,
  useGetOrdersForCsvQuery,
  // buy back reqs
  useGetPendingRequestsQuery,
  useGetAllRequestsQuery,
  useUpdateRequestMutation,
  useGetBuyBackSummaryQuery,
  // analytics
  useGetReveuneByMonthYearQuery,
  useGetOrdersCountByMonthYearQuery,
  useGetInventoryDataQuery,
  useGetOrderStatsQuery,
  // banner/ promotion
  useCreateBannerMutation,
  useGetBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
  // offer endpoints
  useCreateOfferMutation,
  useGetOffersQuery,
  useDeleteOfferMutation,
  useUpdateOfferMutation,
  // contact list
  useGetContactsQuery,
  useGetSubscribersQuery,
  // reviews
  useGetAllReviewsQuery,
  // gold, silver rates
  useGoldRateQuery,
  useSilverRateQuery,
  useAddRatesMutation,
  useGetLatestMetalRateQuery,
  useSyncJewelryPricesMutation,
  useMetalRatesHistoryQuery,
  // retailer
  useCreateRetailerMutation,
  useGetAllRetailerQuery,
  useGetSingleRetailerQuery,
  useGetRetailerStockQuery,
  useCreateBuyBackRequestMutation,
  useGetBusinessSummaryQuery,
  useGetRetailerOrdersQuery,
  useBlockOrUnblockRetailerMutation,
  useGetRetailerStockByTokenQuery,
  useRetailerDashboardStatsQuery,
  // retailer cart api endpoints
  useAddInCartMutation,
  useGetCartQuery,
  useRemoveItemFromCartMutation,
  // retailer order api endpoints
  useRetailerOrderMutation,
  useVerifyRetailerOrderMutation,
  // country origin
  useCreateCountryOriginMutation,
  useGetCountriesDataQuery,
  useUpdateSingleCountryOriginMutation,
  // search, dashboard etc
  useLazySearchProductsQuery,
  useSearchProductsQuery,
  useSalesDataQuery,
  useCustomerStatsQuery,
} = apiSlice;
