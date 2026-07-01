import React from 'react';

const MetricCard = ({ title, value, icon: Icon, gradient, trend }) => {
  return (
    <div className={`p-6 rounded-2xl shadow-lg bg-gradient-to-br ${gradient} text-white transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden group`}>
      {/* Background glow animation effect */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black mt-2 tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center mt-3 text-xs bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full w-fit font-medium">
              {trend}
            </div>
          )}
        </div>
        <div className="p-3.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/15 shadow-inner">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;