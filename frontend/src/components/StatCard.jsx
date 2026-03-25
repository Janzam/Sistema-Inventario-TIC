import React from 'react';

const StatCard = ({ title, count, color, icon }) => {
  const colors = {
    blue: 'bg-sky-500',
    orange: 'bg-orange-500',
    green: 'bg-emerald-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className={`${colors[color]} p-6 rounded-2xl shadow-lg relative overflow-hidden group`}>
      <div className="relative z-10 text-white">
        <p className="text-xs font-bold opacity-80 uppercase">{title}</p>
        <h3 className="text-4xl font-black">{count}</h3>
        <p className="text-[10px] mt-4 font-bold opacity-70 border-t pt-2 w-fit">REPORTE DETALLADO</p>
      </div>
      <div className="absolute right-[-10px] bottom-[-10px] opacity-20 text-white group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 80 })}
      </div>
    </div>
  );
};

export default StatCard;