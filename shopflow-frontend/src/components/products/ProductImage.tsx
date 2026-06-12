import { useState } from "react";

interface ProductImageProps {
  name: string;
  primary_image: string | null;
}

const ProductImage = ({ name, primary_image }: ProductImageProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      {!imageError && primary_image ? (
        <img src={primary_image} alt={name} onError={() => setImageError(true)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-text-muted text-5xl opacity-20">📦</div>
        </div>
      )}
    </>
  );
};

export default ProductImage;
