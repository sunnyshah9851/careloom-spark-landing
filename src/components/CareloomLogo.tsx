
import { Heart } from 'lucide-react';

const CareloomLogo = ({ className = "h-8 w-auto" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-rose-200/40 rounded-full blur-sm"></div>
        <div className="relative bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
          <Heart className="h-5 w-5 text-rose-500 fill-rose-200" />
        </div>
      </div>
      <span className="text-xl font-playfair font-bold text-rose-700">
        Careloom
      </span>
    </div>
  );
};

export default CareloomLogo;
