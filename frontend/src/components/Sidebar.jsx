import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  AreaChart, 
  ScatterChart, 
  Table as TableIcon, 
  Activity, 
  ChevronDown, 
  ChevronRight,
  GripHorizontal,
  Calendar
} from "lucide-react";
import { setDateFilter } from "../store/dashboardSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const isConfiguring = useSelector((state) => state.dashboard.isConfiguring);
  const dateFilter = useSelector((state) => state.dashboard.dateFilter);
  const [expandedSections, setExpandedSections] = useState({
    charts: true,
    tables: true,
    kpis: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isConfiguring) {
    return (
      <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Insight Core</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2">Main Menu</div>
           <a href="/" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100 transition-all">
             <Activity className="w-5 h-5" /> Dashboard
           </a>
           <a href="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-all">
             <TableIcon className="w-5 h-5" /> Orders
           </a>
        </nav>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-r border-gray-100 h-screen flex flex-col shadow-xl z-20">
      <div className="p-6 border-b border-gray-50 flex flex-col space-y-6">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#10b981] shadow-sm border border-[#10b981]/20 bg-emerald-50">
              <Activity className="w-5 h-5" />
            </div>
            <div className="font-bold text-gray-900 text-[15px]">Config Mode</div>
        </div>

        {/* Show data for */}
        <div className="space-y-2">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Show data for</label>
           <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={dateFilter}
                onChange={(e) => dispatch(setDateFilter(e.target.value))}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 hover:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                {["All time", "Today", "Last 7 Days", "Last 30 Days"].map(f => <option key={f}>{f}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
           </div>
        </div>

        <div className="space-y-0.5 pt-2">
           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Widget library</div>
           <div className="text-[10px] text-gray-300 font-medium pl-1">Drag and drop your canvas</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {/* Charts Section */}
        <div className="space-y-1">
          <button onClick={() => toggleSection("charts")} className="w-full flex items-center justify-between py-2 group">
            <span className="font-bold text-[11px] text-gray-900 group-hover:text-[#10b981] transition-colors">Charts</span>
            {expandedSections.charts ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
          </button>
          
          {expandedSections.charts && (
            <div className="grid grid-cols-1 gap-2 pl-2">
              {[
                { name: "Bar Chart", type: "BAR_CHART", icon: <BarChart3 className="w-3.5 h-3.5" /> },
                { name: "Line Chart", type: "LINE_CHART", icon: <LineChart className="w-3.5 h-3.5" /> },
                { name: "Pie Chart", type: "PIE_CHART", icon: <PieChart className="w-3.5 h-3.5" /> },
                { name: "Area Chart", type: "AREA_CHART", icon: <AreaChart className="w-3.5 h-3.5" /> },
                { name: "Scatter Plot", type: "SCATTER_PLOT", icon: <ScatterChart className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <div 
                  key={item.name} 
                  className="group flex flex-col justify-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-xl p-2 transition-all border border-transparent hover:border-gray-100"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("widgetType", item.type);
                    e.dataTransfer.setData("widgetName", item.name);
                    const dragIcon = document.createElement("div");
                    dragIcon.style.opacity = "0";
                    e.dataTransfer.setDragImage(dragIcon, 0, 0);
                  }}
                >
                  <div className="flex items-center gap-1.5 opacity-50 mb-1">
                    <GripHorizontal className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 border border-gray-100 rounded-lg bg-gray-50/50 group-hover:bg-white group-hover:border-[#10b981]/30 transition-all">
                    <div className="text-[#10b981]">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tables Section */}
        <div className="space-y-1">
          <button onClick={() => toggleSection("tables")} className="w-full flex items-center justify-between py-2 group">
            <span className="font-bold text-[11px] text-gray-900 group-hover:text-[#10b981] transition-colors">Tables</span>
            {expandedSections.tables ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
          </button>
          {expandedSections.tables && (
            <div className="pl-2">
              <div 
                className="group flex flex-col justify-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-xl p-2 transition-all border border-transparent hover:border-gray-100"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("widgetType", "TABLE");
                  e.dataTransfer.setData("widgetName", "Table");
                }}
              >
                  <div className="flex items-center gap-1.5 opacity-50 mb-1">
                    <GripHorizontal className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 border border-gray-100 rounded-lg bg-gray-50/50 group-hover:bg-white group-hover:border-[#10b981]/30 transition-all">
                    <div className="text-blue-500">
                      <TableIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">Table</span>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* KPIs Section */}
        <div className="space-y-1 mb-10">
          <button onClick={() => toggleSection("kpis")} className="w-full flex items-center justify-between py-2 group">
            <span className="font-bold text-[11px] text-gray-900 group-hover:text-[#10b981] transition-colors">KPIs</span>
            {expandedSections.kpis ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
          </button>
          {expandedSections.kpis && (
            <div className="pl-2">
              <div 
                className="group flex flex-col justify-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-xl p-2 transition-all border border-transparent hover:border-gray-100"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("widgetType", "KPI");
                  e.dataTransfer.setData("widgetName", "KPI Value");
                }}
              >
                  <div className="flex items-center gap-1.5 opacity-50 mb-1">
                    <GripHorizontal className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 border border-gray-100 rounded-lg bg-gray-50/50 group-hover:bg-white group-hover:border-[#10b981]/30 transition-all">
                    <div className="text-[#10b981]">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-700">KPI Value</span>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
