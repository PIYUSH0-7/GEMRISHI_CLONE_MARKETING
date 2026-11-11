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

const JewelleryCard = ({ item, onClick, variants }) => {
  const rawImage =
    item?.images?.[0]?.url ||
    item?.images?.[0]?.fileName ||
    (typeof item?.images?.[0] === "string" ? item?.images?.[0] : null) ||
    item?.image?.url ||
    item?.image;

  const imageSrc = getImageUrl(rawImage);

  return (
    <motion.div key={item?._id} variants={variants}>
      <Card className="bg-white" onClick={() => onClick && onClick(item?.slug || item?._id)}>
        <CardContent className="p-4">
          <div className="relative flex justify-center items-center mb-4 h-48 bg-gray-50 rounded-md overflow-hidden">
            <img
              src={imageSrc}
              alt={item?.jewelryName || "Jewelry image"}
              onError={onImageError()}
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-800">{item?.jewelryName}</h3>
            <p className="text-sm font-semibold text-gray-800">
              ₹ {item?.jewelryPrice ? Number(item.jewelryPrice).toLocaleString() : 0}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default JewelleryCard;
