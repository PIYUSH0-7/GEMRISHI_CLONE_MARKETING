import Skeleton from "react-loading-skeleton";

const ProductDetailsSkeleton = () => {
  return (
    <div className="p-6 w-full">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-4">
        <Skeleton width={80} height={12} />
        <Skeleton width={10} height={12} />
        <Skeleton width={60} height={12} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton width={180} height={28} />
        <div className="flex gap-3">
          <Skeleton circle width={32} height={32} />
          <Skeleton circle width={32} height={32} />
        </div>
      </div>

      {/* Product card */}
      <div className="bg-white rounded-lg p-6 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - media */}
        <div className="flex flex-col items-center gap-4">
          <Skeleton height={240} width={240} />
          <div className="flex gap-2 justify-center">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} width={60} height={60} />
              ))}
          </div>
        </div>

        {/* Right side - info */}
        <div className="flex flex-col gap-4">
          <div>
            <Skeleton width={200} height={20} />
            <Skeleton width={150} height={16} />
            <Skeleton width={100} height={16} />
            <Skeleton width={120} height={28} />
          </div>

          <div>
            <Skeleton width={180} height={18} />
            <Skeleton count={3} height={14} />
          </div>
        </div>
      </div>

      {/* Product attributes */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex justify-between py-2 border-b border-gray-100"
            >
              <Skeleton width={100} height={14} />
              <Skeleton width={80} height={14} />
            </div>
          ))}
      </div>

      {/* Certificates */}
      <div className="p-6 border-t border-gray-100 mt-6">
        <Skeleton width={120} height={16} />
        <div className="mt-2 flex flex-col gap-1">
          <Skeleton width={160} height={14} />
          <Skeleton width={140} height={14} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
