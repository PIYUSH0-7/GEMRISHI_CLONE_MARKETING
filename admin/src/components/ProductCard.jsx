import { motion } from "framer-motion";
import { getImageUrl, onImageError } from "../utils/imageUtils";

// Custom Card Components moved outside to avoid unmounting on re-renders
const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default function ProductCard({ product, onClick, variants }) {
  const rawImage =
    product?.images?.[0]?.url ||
    product?.images?.[0]?.fileName ||
    (typeof product?.images?.[0] === "string" ? product?.images?.[0] : null) ||
    product?.image?.url ||
    product?.image;

  const imageSrc = getImageUrl(rawImage);

  return (
    <motion.div key={product?._id} variants={variants}>
      <Card className="bg-white" onClick={() => onClick && onClick(product?.slug || product?._id)}>
        <CardContent className="p-4">
          <div className="relative flex justify-center items-center mb-4 h-48 bg-gray-50 rounded-md overflow-hidden">
            <img
              src={imageSrc}
              alt={product?.name || "Product image"}
              onError={onImageError()}
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-1">{product?.name}</h3>
            <p className="text-xs text-gray-500 mb-1">
              Origin: {product?.origin}
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              {product?.price ? Number(product.price).toLocaleString() : 0} INR
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
