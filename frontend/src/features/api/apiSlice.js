import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_URL = import.meta.env.VITE_URL;

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
  }),
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
    "Profile",
    "CountryMap", // Added new tag for the country map list
     "CurrencyRates" , //----------(Added by Pawan currency)------------- 
  ],

  endpoints: (builder) => ({
    // AUTHENTICATION ENDPOINTS
    login: builder.mutation({
      query: (loginData) => ({
        url: "/user/login",
        method: "POST",
        body: loginData,
        credentials: "include",
      }),
      invalidatesTags: (res, err) => [{ type: "Profile" }],
    }),

    register: builder.mutation({
      query: (registerData) => ({
        url: "/user/register",
        method: "POST",
        body: registerData,
        credentials: "include",
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/user/logout",
        method: "POST",
        credentials: "include",
      }),
    }),

    profile: builder.query({
      query: () => ({
        url: "/user/profile",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Profile"],
    }),

    updateUser: builder.mutation({
      query: ({ userId, formData }) => ({
        url: `/user/update-user/${userId}`,
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Profile"],
    }),

    // CATEGORY ENDPOINTS FOR GEMSTONE
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: "category/create-category",
        method: "POST",
        body: categoryData,
        credentials: "include",
      }),
    }),

    getCategory: builder.query({
      query: () => ({
        url: "category/get-categories",
        method: "GET",
        credentials: "include",
      }),
    }),

    // SUBCATEGORY ENDPOINTS FOR GEMSTONE
    createSubCategory: builder.mutation({
      query: ({ categoryId, formData }) => ({
        url: `subcategory/create-subcategory/${categoryId}`,
        method: "POST",
        body: formData,
        credentials: "include",
      }),
    }),

    getSubCategory: builder.query({
      query: () => ({
        url: "subcategory/get-subcategories",
        method: "GET",
        credentials: "include",
      }),
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
    }),

    getJewelryCategory: builder.query({
      query: () => ({
        url: "/jewelryCategory/get-jewelry-categories",
        method: "GET",
        credentials: "include",
      }),
    }),

    // SUB-CATEGORY ENDPOINTS FOR JEWELLERY
    createJewellerySubCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/jewelrySubCategory/create-jewelry-subcategory/${categoryId}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),

    getJewellerySubCategory: builder.query({
      query: () => ({
        url: "/jewelrySubCategory/get-jewelry-subcategories",
        method: "GET",
        credentials: "include",
      }),
    }),

    // JEWELLERY ENDPOINTS
    createJewellery: builder.mutation({
      query: ({ productId, jewellerySubcategoryId, jewelleryData }) => ({
        url: `/jewelry/create-jewelry/${productId}/${jewellerySubcategoryId}`,
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

    // search api, dashboard endpoints etc
    searchProducts: builder.query({
      query: (searchTerm) => ({
        url: `/product/search?keyword=${searchTerm}`,
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

    // offer ---- vishwajeet
    applyOffer: builder.mutation({
      query: (promoCode) => ({
        url: "/offer/apply_promocode",
        method: "POST",
        body: { promoCode },
        credentials: "include",
      }),
    }),

    getUpsellingProductList: builder.query({
      query: (productId) => ({
        url: `/product/upselling-product-list/${productId}`,
        method: "GET",
        credentials: "include",
      }),
    }),

    // ORIGIN COUNTRY MAP ENDPOINTS
    getOriginCountryList: builder.query({
      query: () => ({
        url: "/originCountryMap/get_all_country_list",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["CountryMap"],
    }),
    //-----------------Add By Pawan for Currency------------------
    getCurrencyRates:builder.query({
     query:()=>({
       url:"/currency/rates",
       
     }),
     providesTags:["CurrencyRates"],
    }),
   //-----------------Add By Pawan for Currency------------------
  }),
});
export const {
  //auth
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useProfileQuery,
  useUpdateUserMutation,

  // gemstone category & subcategory
  useCreateCategoryMutation,
  useGetCategoryQuery,
  useCreateSubCategoryMutation,
  useGetSubCategoryQuery,

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
  useCreateJewellerySubCategoryMutation,
  useGetJewellerySubCategoryQuery,

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

  // analytics
  useGetReveuneByMonthYearQuery,
  useGetOrdersCountByMonthYearQuery,

  // search, dashboard etc
  useLazySearchProductsQuery,
  useSalesDataQuery,
  useCustomerStatsQuery,

  // offer endpoints
  useApplyOfferMutation,
  useGetUpsellingProductListQuery,
  //-----------------Add By Pawan for Currency--------------------
   useGetCurrencyRatesQuery,
  //-----------------Add By Pawan for Currency------------------- 
  // country map endpoints
  useGetOriginCountryListQuery,
} = apiSlice;
