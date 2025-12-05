import { Server, AlertTriangle } from "lucide-react";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-lg">
        {/* Destroyed Server Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
            <Server className="w-16 h-16 text-red-500 opacity-50" />
            <AlertTriangle className="w-8 h-8 text-yellow-500 absolute top-4 right-1/2 translate-x-1/2" />
          </div>
          {/* Destruction effects */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-1 bg-red-500/30 rotate-45 absolute"></div>
            <div className="w-24 h-1 bg-red-500/30 -rotate-45 absolute"></div>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          الموقع تحت الصيانة
        </h1>
        
        <p className="text-gray-400 text-lg mb-6">
          للأسف، الموقع غير متاح حالياً
        </p>

        <p className="text-gray-500 text-sm">
          نعتذر عن أي إزعاج. يرجى المحاولة لاحقاً.
        </p>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
