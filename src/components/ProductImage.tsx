import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImage = ({ src, alt, className = "" }: ProductImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <p className="text-muted-foreground text-sm">فشل تحميل الصورة</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="eager"
          style={{ display: loading ? 'none' : 'block' }}
        />
      )}
    </div>
  );
};
