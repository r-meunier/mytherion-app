"use client";

export default function WorldMapCard() {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-display font-bold text-white flex items-center">
        <span className="material-symbols-outlined mr-2 text-secondary">map</span>
        World Map
      </h4>

      <div className="relative rounded-2xl overflow-hidden group border border-white/10 glow-gold cursor-pointer transition-all">
        {/* Map Image */}
        <img
          alt="World Map Preview"
          className="w-full h-56 object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[10%] sepia-[10%]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeAjmS6YrqQ5jg8Bng7i0ZGGBB37j8jlMocp9_KT206ulGaaL-BU52WZlec62UWpQ941jokRt-sklBoxZk1VkAuF-plpg6YqXowMYKRXS2nkZNC5uUlPB-BZAk15URHObXWZ2uNShBN_zGDPOrXEqS_im-bik1c_YKVr_Z04oSkrWg5VESxJdHIvF_hdKdhQtr3RwWee1l63LTZrHMIRV4JtGcOiZoICgmSR9_BeFifOViInAjKoz182QZZYtJWz_AtQSp2OEqK3iX"
        />

        {/* Gradient Overlay with Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
          <p className="text-white font-bold text-lg">Aetheria Centralis</p>
          <p className="text-white/60 text-xs">
            8 Regions Discovered • 12 Points of Interest
          </p>
        </div>

        {/* Expand Button */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-lg text-white">
          <span className="material-symbols-outlined text-sm">open_in_full</span>
        </div>
      </div>
    </div>
  );
}
