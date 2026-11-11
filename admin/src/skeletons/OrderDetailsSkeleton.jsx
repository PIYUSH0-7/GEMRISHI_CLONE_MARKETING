import Skeleton from "react-loading-skeleton";

const OrderDetailsSkeleton = () => {
  return (
    <div className="w-full flex flex-row min-h-screen bg-gray-100">
      {/* Sidebar Placeholder */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-[230px] bg-white border-r border-gray-200 p-4">
        <Skeleton height={40} width={150} className="mb-4" />
        <Skeleton count={8} height={20} className="mb-3" />
      </div>

      <div className="w-full lg:ml-[230px] lg:w-[calc(100%-230px)] flex flex-col">
        {/* UpperBar Placeholder */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <Skeleton height={30} width={180} />
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Skeleton circle width={40} height={40} />
              <div>
                <Skeleton width={180} height={22} />
                <Skeleton width={120} height={16} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton width={90} height={28} />
              <Skeleton width={120} height={32} />
              <Skeleton width={160} height={32} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton width={140} height={20} className="mb-4" />
                <div className="space-y-4">
                  {Array(2)
                    .fill(0)
                    .map((_, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-4">
                          <Skeleton width={64} height={64} />
                          <div className="flex-1">
                            <Skeleton width={150} height={16} />
                            <Skeleton width={100} height={14} />
                          </div>
                          <div className="text-right">
                            <Skeleton width={60} height={14} />
                            <Skeleton width={80} height={14} />
                          </div>
                        </div>
                        <Skeleton count={2} height={12} />
                      </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <Skeleton width={120} height={20} className="mb-2" />
                  <Skeleton width={100} height={16} />
                </div>
              </div>

              {/* Order Status Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton width={140} height={20} className="mb-4" />
                <div className="flex gap-4">
                  <Skeleton circle width={14} height={14} />
                  <div>
                    <Skeleton width={100} height={14} />
                    <Skeleton count={3} height={12} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Customer */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton width={120} height={20} className="mb-4" />
                <Skeleton width={150} height={14} />
                <Skeleton width={180} height={14} />
                <Skeleton width={120} height={14} />
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton width={100} height={20} className="mb-4" />
                <Skeleton count={6} height={14} />
              </div>

              {/* Payment */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton width={100} height={20} className="mb-4" />
                <Skeleton width={120} height={14} />
                <Skeleton width={180} height={14} />
                <Skeleton width={100} height={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSkeleton;
