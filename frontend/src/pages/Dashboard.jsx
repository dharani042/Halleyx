import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LayoutGrid, Settings, Plus, Table as TableIcon, Activity, Calendar, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setIsConfiguring, setDateFilter, setCurrentView } from "../store/dashboardSlice";
import { fetchOrders, fetchWidgets } from "../store/apiActions";
import Widget from "../components/Widget";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const widgets = useSelector((state) => state.dashboard.widgets);
  const orders = useSelector((state) => state.orders.orders);
  const dateFilter = useSelector((state) => state.dashboard.dateFilter);
  const currentView = useSelector((state) => state.dashboard.currentView);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchWidgets());

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const handleConfigure = () => {
    dispatch(setIsConfiguring(true));
    navigate("/configure");
  };

  // Responsive Grid Logic
  const getGridCols = () => {
    if (windowWidth >= 1024) return 12; // Desktop
    if (windowWidth >= 768) return 8;   // Tablet
    return 4;                          // Mobile
  };

  const cols = getGridCols();

  if (widgets.length === 0) {
    return (
      <div className="p-10 h-screen bg-white custom-scrollbar overflow-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
               <h1 className="text-2xl font-semibold text-gray-900">Customer Orders</h1>
               <p className="text-xs text-gray-500 font-medium">View and manage customer orders and details</p>
            </div>
            <button 
              onClick={handleConfigure} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#10b981] text-[#10b981] font-medium text-sm rounded-md hover:bg-emerald-50 transition-all"
            >
              <Settings className="w-4 h-4" /> Configure dashboard
            </button>
         </div>

         <div className="flex gap-8 border-b border-gray-200 mb-6">
            <div className="flex items-center gap-2 py-2 border-b-2 border-[#10b981] text-[#10b981] font-medium text-sm cursor-pointer">
               <LayoutGrid className="w-4 h-4" /> Dashboard
            </div>
            <div onClick={() => navigate("/orders")} className="flex items-center gap-2 py-2 text-gray-500 font-medium text-sm hover:text-gray-700 cursor-pointer transition-colors">
               <TableIcon className="w-4 h-4" /> Table
            </div>
         </div>

         <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-100 rounded-[40px] bg-gray-50/30">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl border border-gray-100 flex items-center justify-center mb-8 animate-pulse text-emerald-500">
               <Activity className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Setup your dashboard</h2>
            <p className="text-gray-400 font-medium mb-10 text-center max-w-sm">Bring your data to life with custom charts and metrics.</p>
            <button 
               onClick={handleConfigure}
               className="btn-save py-4 px-10 text-lg shadow-xl shadow-emerald-200"
            >
               Start Configuration
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/30 h-screen overflow-auto">
      {/* Premium Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
           <h1 className="text-2xl font-semibold text-gray-900">Customer Orders</h1>
           <p className="text-xs text-gray-500 font-medium">View and manage customer orders and details</p>
        </div>
        <button 
          onClick={handleConfigure} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#10b981] text-[#10b981] text-sm font-medium rounded-md hover:bg-emerald-50 transition-all"
        >
          <Settings className="w-4 h-4" /> Configure dashboard
        </button>
      </div>

      {/* Tabs & Date Filter */}
      <div className="flex justify-between items-center mb-6">
         <div className="flex gap-8">
            <div 
              onClick={() => dispatch(setCurrentView("Dashboard"))}
              className={`flex items-center gap-2 py-2 border-b-2 cursor-pointer ${currentView === "Dashboard" ? 'border-[#10b981] text-[#10b981] font-medium' : 'border-transparent text-gray-500 font-medium hover:text-gray-700'}`}
            >
               <LayoutGrid className="w-4 h-4" /> Dashboard
            </div>
            <div 
              onClick={() => navigate("/orders")}
              className={`flex items-center gap-2 py-2 border-b-2 cursor-pointer border-transparent text-gray-500 font-medium hover:text-gray-700`}
            >
               <TableIcon className="w-4 h-4" /> Table
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-400">
               <Calendar className="w-5 h-5" />
            </div>
            <div className="relative">
               <select 
                 value={dateFilter}
                 onChange={(e) => dispatch(setDateFilter(e.target.value))}
                 className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 outline-none hover:border-[#10b981] transition-all appearance-none shadow-sm cursor-pointer"
               >
                 {["Last 3 Months", "Last 6 Months", "This Year", "All time"].map(f => <option key={f}>{f}</option>)}
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
         </div>
      </div>

      {currentView === "Dashboard" && (
        <div className="space-y-8 duration-700">
           {/* Widgets Grid */}
           <div 
             className="grid gap-6 auto-rows-[140px]"
             style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
           >
              {widgets.map((widget) => {
                 // Recalculate spans for smaller screens
                 let spanW = widget.w;
                 if (cols === 8) spanW = Math.min(widget.w, 8);
                 if (cols === 4) spanW = 4;

                 return (
                   <div 
                     key={widget.id}
                     style={{ gridColumn: `span ${spanW}`, gridRow: `span ${widget.h}` }}
                   >
                     <Widget widget={widget} onSettings={() => {}} onDelete={() => {}} />
                   </div>
                 );
              })}
           </div>

           {/* Pending Orders Section */}
           <div className="bg-white border border-gray-200 rounded-lg overflow-hidden p-6 mt-6">
              <h3 className="text-[14px] font-semibold text-gray-800 mb-4">Pending orders</h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-sm border-collapse">
                    <thead>
                       <tr className="border-y border-gray-200 bg-gray-50/30">
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Order ID</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Quantity</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-600">Total amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {orders.filter(o => o.status === "Pending").length === 0 ? (
                         <tr>
                            <td colSpan="4" className="py-10 text-center font-medium text-gray-400">No pending orders</td>
                         </tr>
                       ) : (
                         orders.filter(o => o.status === "Pending").slice(0, 5).map(order => (
                           <tr key={order.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-4 text-gray-600">ORD-{order.id.toString().padStart(4, '0')}</td>
                              <td className="px-4 py-4 text-gray-900">{order.quantity}</td>
                              <td className="px-4 py-4 text-gray-600">{order.product}</td>
                              <td className="px-4 py-4 font-medium text-gray-900 text-right">$ {parseFloat(order.totalAmount).toFixed(2)}</td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
