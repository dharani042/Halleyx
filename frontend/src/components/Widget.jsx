import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Settings, Trash2, GripVertical, Plus, Activity } from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LabelList, ScatterChart, Scatter
} from "recharts";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const generateHslColors = (count) => {
  if (count <= 1) return ["#3b82f6"];
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * 360) / count;
    return `hsl(${hue}, 75%, 60%)`;
  });
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border-none shadow-2xl rounded-xl px-4 py-2 flex items-center gap-2">
        <span className="text-[11px] font-black text-white tracking-widest uppercase">
            {payload[0].name} : {payload[0].value.toLocaleString()}%
        </span>
      </div>
    );
  }
  return null;
};

const getFieldValue = (order, metric) => {
  const m = metric?.toLowerCase();
  if (!m) return 0;
  
  if (m.includes("amount") || m.includes("revenue")) return parseFloat(order.totalAmount || 0);
  if (m.includes("quantity")) return parseInt(order.quantity || 0);
  if (m.includes("unit price")) return parseFloat(order.unitPrice || 0);
  
  return order[metric] || 1;
};

const Widget = ({ widget, onSettings, onDelete }) => {
  const orders = useSelector((state) => state.orders.orders);

  // Aggregation logic for KPIs
  const calculatedValue = useMemo(() => {
    if (!orders || orders.length === 0) return 0;
    const metric = widget.metric || "Total amount";
    const aggregation = widget.aggregation || "Count";

    if (aggregation === "Count") {
        if (metric.includes("Customer")) {
            return new Set(orders.map(o => o.firstName + o.lastName)).size;
        }
        return orders.length;
    }

    const values = orders.map(o => {
        const val = getFieldValue(o, metric);
        return typeof val === 'number' ? val : 0;
    });

    switch (aggregation) {
      case "Sum": return values.reduce((a, b) => a + b, 0);
      case "Average": return values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
      default: return values.reduce((a, b) => a + b, 0);
    }
  }, [orders, widget.metric, widget.aggregation]);

  // Data processing for Charts
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    // Grouping for Pie Charts (Uses 'metric' as the grouping key)
    if (widget.type === "PIE_CHART") {
        const keyField = (widget.metric || "Product").toLowerCase().replace(" ", "");
        const groups = {};
        orders.forEach(o => {
            const key = o[keyField] || o[widget.metric] || "Unknown";
            groups[key] = (groups[key] || 0) + 1;
        });
        const total = orders.length;
        return Object.entries(groups).map(([name, value]) => ({ 
            name, 
            value: Math.round((value / total) * 100) 
        }));
    }

    // Grouping for regular charts
    if (widget.title?.includes("Revenue")) {
       const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
       const values = [4000, 3000, 5000, 4500, 6000, 5500];
       return months.map((m, i) => ({ name: m, value: values[i] }));
    }

    if (widget.title?.includes("Status")) {
        return [
            { name: "In progress", value: orders.filter(o => o.status === "SHIPPED").length || 10 },
            { name: "Pending", value: orders.filter(o => o.status === "PENDING").length || 30 },
            { name: "Completed", value: orders.filter(o => o.status === "DELIVERED").length || 60 },
        ];
    }
    
    const groups = {};
    orders.forEach(o => {
      const key = o.product || "Unknown";
      groups[key] = (groups[key] || 0) + getFieldValue(o, widget.yAxis || "Total amount");
    });
    
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [orders, widget.yAxis, widget.title, widget.type, widget.metric]);

  const activeColors = useMemo(() => {
    if (widget.title?.includes("Status")) {
      return ["#3b82f6", "#f59e0b", "#10b981"]; // Blue, Orange, Green as per mockup
    }
    return chartData.length > COLORS.length ? generateHslColors(chartData.length) : COLORS;
  }, [chartData.length, widget.title]);

  const formatValue = (val) => {
    const metric = widget.metric || widget.title;
    const precision = widget.precision !== undefined ? parseInt(widget.precision) : 0;
    const formattedNum = val.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
    
    if (widget.format === "Currency" || metric?.includes("Revenue") || metric?.includes("Amount")) {
        return `$${formattedNum}`;
    }
    return formattedNum;
  };

  // Process Table Data (Filters, Sort, Pagination)
  const processedTableData = useMemo(() => {
    if (widget.type !== "TABLE" || !orders) return [];
    
    let result = [...orders];

    if (widget.applyFilter && widget.filters && widget.filters.length > 0) {
        result = result.filter(order => {
            return widget.filters.every(filter => {
                if (!filter.attribute || !filter.operator) return true;
                const field = filter.attribute.toLowerCase();
                const val = order[field] || order[filter.attribute];
                const filterVal = filter.value;

                switch (filter.operator) {
                    case "=": return String(val) === String(filterVal);
                    case "!=": return String(val) !== String(filterVal);
                    case ">": return parseFloat(val) > parseFloat(filterVal);
                    case ">=": return parseFloat(val) >= parseFloat(filterVal);
                    case "<": return parseFloat(val) < parseFloat(filterVal);
                    case "<=": return parseFloat(val) <= parseFloat(filterVal);
                    case "Contains": return String(val).toLowerCase().includes(String(filterVal).toLowerCase());
                    default: return true;
                }
            });
        });
    }

    if (widget.sortBy) {
        result.sort((a, b) => {
            const isAsc = widget.sortBy === "Ascending";
            const aVal = a.id;
            const bVal = b.id;
            return isAsc ? aVal - bVal : bVal - aVal;
        });
    }

    const limit = parseInt(widget.pagination) || 5;
    return result.slice(0, limit);
  }, [orders, widget.type, widget.applyFilter, widget.filters, widget.sortBy, widget.pagination]);

  const getColValue = (order, col) => {
    switch(col) {
        case "Customer ID": return `#${order.id}`;
        case "Customer name": return `${order.firstName} ${order.lastName}`;
        case "Email id": return order.emailId;
        case "Address": return `${order.streetAddress}, ${order.city}`;
        case "Order date": return new Date(order.createdAt).toLocaleDateString();
        case "Product": return order.product;
        case "Created by": return order.createdBy;
        case "Status": return <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{order.status}</span>;
        case "Total amount": return `$${parseFloat(order.totalAmount).toFixed(2)}`;
        case "Unit price": return `$${parseFloat(order.unitPrice).toFixed(2)}`;
        case "Quantity": return order.quantity;
        case "Order ID": return `ORD-${order.id.toString().padStart(4, '0')}`;
        default: return "-";
    }
  };

  const getWidgetContent = () => {
    switch (widget.type) {
      case "KPI":
        return (
          <div className="flex flex-col items-start justify-center h-full">
            <span className="text-[14px] font-medium text-gray-500 mb-2">{widget.title || "Untitled"}</span>
            <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {formatValue(calculatedValue)}
                </span>
            </div>
          </div>
        );
      case "BAR_CHART":
        return (
          <div className="flex flex-col h-full">
            <span className="text-[13px] font-medium text-gray-500 mb-4">{widget.title || "Untitled"}</span>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <CartesianGrid vertical={false} strokeDasharray="3 0" stroke="#f1f5f9" />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40}>
                    {widget.showDataLabel && <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} />}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "LINE_CHART":
        return (
          <div className="flex flex-col h-full">
            <span className="text-[13px] font-medium text-gray-500 mb-4">{widget.title || "Untitled"}</span>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={widget.color || "#3b82f6"} 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: widget.color || "#3b82f6" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  >
                    {widget.showDataLabel && <LabelList dataKey="value" position="top" offset={10} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} />}
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "AREA_CHART":
        return (
          <div className="flex flex-col h-full">
            <span className="text-[13px] font-medium text-gray-500 mb-4">{widget.title || "Untitled"}</span>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorArea-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={widget.color || "#3b82f6"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={widget.color || "#3b82f6"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={widget.color || "#3b82f6"} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill={`url(#colorArea-${widget.id})`}
                  >
                    {widget.showDataLabel && <LabelList dataKey="value" position="top" offset={10} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} />}
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "SCATTER_PLOT":
        return (
          <div className="flex flex-col h-full">
            <span className="text-[13px] font-medium text-gray-500 mb-4">{widget.title || "Untitled"}</span>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} label={{ value: 'X-Axis', position: 'bottom', offset: -5, fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} label={{ value: 'Y-Axis', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 'bold' }} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Scatter name="Data" data={chartData} fill={widget.color || "#10b981"}>
                    {widget.showDataLabel && <LabelList dataKey="value" position="top" offset={10} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} />}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "PIE_CHART":
        return (
            <div className="flex flex-col h-full">
              <span className="text-[13px] font-medium text-gray-500 mb-4">{widget.title || "Untitled"}</span>
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                <div className={`${widget.showLegend !== false ? "w-2/3" : "w-full"} h-full`}>
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                          data={chartData}
                          innerRadius="0%"
                          outerRadius="90%"
                          dataKey="value"
                          stroke="#fff"
                          strokeWidth={2}
                          paddingAngle={0}
                      >
                          {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={activeColors[index]} />
                          ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {widget.showLegend !== false && (
                  <div className="w-1/3 flex flex-col justify-center gap-3 pl-4 max-h-full overflow-y-auto no-scrollbar">
                      {chartData.map((d, i) => (
                          <div key={d.name} className="flex items-center gap-2.5 group cursor-default">
                              <div className="w-3 h-3 rounded-sm shrink-0 shadow-sm" style={{ backgroundColor: activeColors[i] }} />
                              <span className="text-[12px] font-medium text-gray-800 truncate group-hover:text-gray-900 transition-colors">{d.name}</span>
                          </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
      case "TABLE":
        const colsToShow = widget.selectedColumns || ["Order ID", "Product", "Status", "Total amount"];
        return (
          <div className="flex flex-col h-full">
            <span className="text-[13px] font-medium text-gray-500 mb-3">{widget.title || "Untitled"}</span>
             <div 
               className="flex-1 overflow-auto custom-scrollbar bg-gray-50/10 rounded-[24px] border border-gray-100/50 shadow-inner"
               style={{ fontSize: `${widget.fontSize || 14}px` }}
             >
                <table className="w-full text-left">
                  <thead 
                    className="sticky top-0 z-10 transition-colors"
                    style={{ backgroundColor: widget.headerBackground || "#D8D8D8" }}
                  >
                    <tr>
                        {colsToShow.map(col => (
                            <th key={col} className="p-3 font-black text-gray-700 uppercase tracking-wider text-[9px] border-b border-gray-100">{col}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {processedTableData.length === 0 ? (
                        <tr>
                            <td colSpan={colsToShow.length} className="p-8 text-center text-gray-300 font-bold">No data found</td>
                        </tr>
                    ) : (
                        processedTableData.map(o => (
                            <tr key={o.id} className="hover:bg-white/50 transition-colors group">
                                {colsToShow.map(col => (
                                    <td key={col} className="p-3 font-bold text-gray-600 border-b border-gray-50/50">
                                        {getColValue(o, col)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        );
      default: return <div>Unknown Widget</div>;
    }
  };

  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-lg p-5 h-full overflow-hidden"
    >
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
        <button 
          onClick={(e) => { e.stopPropagation(); onSettings(widget); }}
          className="p-1.5 bg-white hover:bg-gray-50 rounded-md text-gray-400 hover:text-gray-600 transition-all border border-gray-200 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 bg-white hover:bg-red-50 rounded-md text-gray-400 hover:text-red-600 transition-all border border-gray-200 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
           <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="h-full">
        {getWidgetContent()}
      </div>
    </div>
  );
};

export default Widget;
