import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Activity, ChevronDown, Plus, Trash2, Check } from "lucide-react";

/**
 * Premium Sliding side panel for widget configuration
 */
const WidgetSettingsDrawer = ({ widget, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("Data");
  const [formData, setFormData] = useState({ 
    w: 2, 
    h: 2, 
    metric: "", 
    aggregation: "Count", 
    format: "Number", 
    precision: 0,
    selectedColumns: ["Order ID", "Product", "Status", "Total amount"],
    sortBy: "Ascending",
    pagination: 5,
    applyFilter: false,
    filters: [],
    fontSize: 14,
    headerBackground: "#D8D8D8",
    ...widget 
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (widget) {
      setFormData(prev => ({
        w: widget.type === "KPI" ? 2 : (widget.type === "TABLE" ? 5 : 4),
        h: widget.type === "KPI" ? 2 : (widget.type === "TABLE" ? 5 : 4),
        metric: "",
        aggregation: "Count",
        format: "Number",
        precision: 0,
        selectedColumns: ["Order ID", "Product", "Status", "Total amount"],
        sortBy: "Ascending",
        pagination: 5,
        applyFilter: false,
        filters: [],
        fontSize: 14,
        headerBackground: "#D8D8D8",
        ...widget
      }));
      setActiveTab("Data");
    }
  }, [widget]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleColumnToggle = (col) => {
    const current = formData.selectedColumns || [];
    const updated = current.includes(col) 
      ? current.filter(c => c !== col) 
      : [...current, col];
    setFormData(prev => ({ ...prev, selectedColumns: updated }));
    if (errors.selectedColumns) setErrors(prev => ({ ...prev, selectedColumns: null }));
  };

  const addFilter = () => {
    setFormData(prev => ({
      ...prev,
      filters: [...(prev.filters || []), { attribute: "", operator: "=", value: "" }]
    }));
  };

  const removeFilter = (index) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const updateFilter = (index, field, value) => {
    setFormData(prev => {
      const newFilters = [...prev.filters];
      newFilters[index] = { ...newFilters[index], [field]: value };
      return { ...prev, filters: newFilters };
    });
  };

  const handleSave = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Widget title is required";
    if (formData.type === "KPI" && !formData.metric) newErrors.metric = "Please fill the field";
    if (formData.type === "TABLE" && (!formData.selectedColumns || formData.selectedColumns.length === 0)) {
        newErrors.selectedColumns = "Please select at least one column";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  const renderDataSettings = () => {
    switch (widget?.type) {
      case "KPI":
        return (
          <div className="space-y-6">
             <div className="relative w-full mt-0">
                  <select 
                    name="metric" 
                    id="floating_metric"
                    className={`peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border ${errors.metric ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'} rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10`}
                    onChange={handleChange} 
                    value={formData.metric || ""}
                  >
                    <option value="" disabled>Select metric</option>
                    {[
                      "Customer ID", "Customer name", "Email id", "Address", 
                      "Order date", "Product", "Created by", "Status", 
                      "Total amount", "Unit price", "Quantity"
                    ].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <label htmlFor="floating_metric" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">
                     Select metric <span className="text-red-400 font-bold ml-0.5">*</span>
                  </label>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                {errors.metric && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 ml-1">
                    <AlertCircle className="w-3 h-3" /> {errors.metric}
                  </p>
                )}
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="relative w-full mt-0">
                      <select id="floating_agg" name="aggregation" className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10" onChange={handleChange} value={formData.aggregation || "Count"}>
                        <option>Sum</option>
                        <option>Average</option>
                        <option>Count</option>
                      </select>
                      <label htmlFor="floating_agg" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Aggregation <span className="text-red-400 font-bold ml-0.5">*</span></label>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                 </div>
                 <div className="relative w-full mt-0">
                      <select id="floating_fmt" name="format" className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10" onChange={handleChange} value={formData.format || "Number"}>
                        <option>Number</option>
                        <option>Currency</option>
                      </select>
                      <label htmlFor="floating_fmt" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Data format <span className="text-red-400 font-bold ml-0.5">*</span></label>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                 </div>
             </div>
             <div className="relative w-full mt-0">
                <input 
                  type="number" 
                  name="precision" 
                  id="floating_prec"
                  className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all" 
                  min="0" 
                  max="5" 
                  onChange={handleChange} 
                  value={formData.precision ?? 0}
                  placeholder=" " 
                />
                <label htmlFor="floating_prec" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Decimal Precision <span className="text-red-400 font-bold ml-0.5">*</span></label>
             </div>
          </div>
        );
      case "TABLE":
        return (
          <div className="space-y-6">
             <div className="relative w-full mt-0">
                <div className="absolute inset-0 border border-gray-300 rounded-[4px] pointer-events-none" />
                <label className="absolute text-[12px] font-medium text-gray-400 -translate-y-3.5 scale-75 top-3.5 z-10 bg-white px-1 left-3 pointer-events-none">
                    Choose columns <span className="text-red-400 font-bold ml-0.5">*</span>
                </label>
                <div className="relative group pt-4 pb-2 px-3 w-full min-h-[50px] flex flex-wrap gap-2 items-center">
                    {formData.selectedColumns?.map(col => (
                        <span key={col} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded bg-white border border-gray-200 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                            {col} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => handleColumnToggle(col)} />
                        </span>
                    ))}
                    {formData.selectedColumns?.length === 0 && <span className="text-gray-300 text-[13px] font-medium">Select columns</span>}
                    <select 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                      onChange={(e) => handleColumnToggle(e.target.value)}
                      value=""
                    >
                        <option value="">Add column</option>
                        {[
                          "Customer ID", "Customer name", "Email id", "Address", 
                          "Order date", "Product", "Created by", "Status", 
                          "Total amount", "Unit price", "Quantity", "Order ID"
                        ].filter(c => !formData.selectedColumns?.includes(c)).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.selectedColumns && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 ml-1">
                    <AlertCircle className="w-3 h-3" /> {errors.selectedColumns}
                  </p>
                )}
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="relative w-full mt-0">
                      <select id="floating_sort" name="sortBy" className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10" onChange={handleChange} value={formData.sortBy || "Ascending"}>
                        <option>Ascending</option>
                        <option>Descending</option>
                      </select>
                      <label htmlFor="floating_sort" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Sort by</label>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                 </div>
                 <div className="relative w-full mt-0">
                      <select id="floating_page" name="pagination" className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10" onChange={handleChange} value={formData.pagination || 5}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                      </select>
                      <label htmlFor="floating_page" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Pagination</label>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                 </div>
             </div>

             <div className="space-y-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-[3px] border transition-all flex items-center justify-center ${formData.applyFilter ? 'bg-[#10b981] border-[#10b981]' : 'bg-white border-gray-300 group-hover:border-[#10b981]'}`}>
                    <input type="checkbox" name="applyFilter" checked={formData.applyFilter} onChange={handleChange} className="hidden" />
                    {formData.applyFilter && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] font-medium text-gray-900">Apply filter</span>
                </label>

                {formData.applyFilter && (
                   <div className="space-y-4 p-4 bg-gray-50/50 rounded-3xl border border-gray-100/50 duration-300">
                      {(formData.filters || []).map((filter, index) => (
                         <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <select 
                                className="col-span-12 lg:col-span-5 input-field py-2 text-xs" 
                                value={filter.attribute} 
                                onChange={(e) => updateFilter(index, 'attribute', e.target.value)}
                            >
                                <option value="">Choose attribute</option>
                                <option>Product</option><option>Quantity</option><option>Status</option>
                            </select>
                            <select 
                                className="col-span-12 lg:col-span-3 input-field py-2 text-xs" 
                                value={filter.operator} 
                                onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                            >
                                {["=", "!=", ">", ">=", "<", "<=", "Contains"].map(op => <option key={op} value={op}>{op}</option>)}
                            </select>
                            <div className="col-span-12 lg:col-span-3">
                                <input 
                                    type="text" 
                                    placeholder="Value" 
                                    className="input-field py-2 text-xs" 
                                    value={filter.value} 
                                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                                />
                            </div>
                            <button onClick={() => removeFilter(index)} className="col-span-1 p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      ))}
                      <button 
                        onClick={addFilter}
                        className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-700 transition-colors tracking-widest"
                      >
                         <Plus className="w-4 h-4" /> Add filter
                      </button>
                   </div>
                )}
             </div>
          </div>
        );
      case "BAR_CHART":
      case "LINE_CHART":
      case "AREA_CHART":
      case "SCATTER_PLOT":
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4 mt-0">
                 <div className="relative w-full mt-0">
                      <select id="floating_x" name="xAxis" className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10" onChange={handleChange} value={formData.xAxis || "Date"}>
                          <option>Date</option>
                          <option>Product</option>
                          <option>Category</option>
                      </select>
                      <label htmlFor="floating_x" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Choose X - axis data <span className="text-red-400 font-bold ml-0.5">*</span></label>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                 </div>
                 <div className="relative w-full mt-0">
                      <select id="floating_y" name="yAxis" className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10" onChange={handleChange} value={formData.yAxis || "Total amount"}>
                          <option>Total amount</option>
                          <option>Quantity</option>
                      </select>
                      <label htmlFor="floating_y" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Choose Y - axis data <span className="text-red-400 font-bold ml-0.5">*</span></label>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                 </div>
             </div>
             <div className="space-y-2">
                <label className="label">Chart Color</label>
                <div className="flex gap-3">
                   {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"].map(c => (
                     <button 
                       key={c}
                       onClick={() => setFormData(p => ({ ...p, color: c }))}
                       className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                </div>
             </div>
             <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-[3px] border transition-all flex items-center justify-center ${formData.showDataLabel ? 'bg-[#10b981] border-[#10b981]' : 'bg-white border-gray-300 group-hover:border-[#10b981]'}`}>
                    <input type="checkbox" name="showDataLabel" checked={formData.showDataLabel || false} onChange={handleChange} className="hidden" />
                    {formData.showDataLabel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] font-medium text-gray-900">Show data label</span>
                </label>
             </div>
          </div>
        );
      case "PIE_CHART":
        return (
          <div className="space-y-6">
             <div className="relative w-full mt-0">
                  <select id="floating_pie_m" name="metric" className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer pr-10" onChange={handleChange} value={formData.metric || "Product"}>
                      <option>Product</option>
                      <option>Quantity</option>
                      <option>Unit price</option>
                      <option>Total amount</option>
                      <option>Status</option>
                      <option>Created by</option>
                  </select>
                  <label htmlFor="floating_pie_m" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">Choose chart data <span className="text-red-400 font-bold ml-0.5">*</span></label>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
             </div>
             <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-[3px] border transition-all flex items-center justify-center ${formData.showLegend !== false ? 'bg-[#10b981] border-[#10b981]' : 'bg-white border-gray-300 group-hover:border-[#10b981]'}`}>
                    <input type="checkbox" name="showLegend" checked={formData.showLegend !== false} onChange={handleChange} className="hidden" />
                    {formData.showLegend !== false && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px] font-medium text-gray-900">Show legend</span>
                </label>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90] duration-300" 
          onClick={onClose} 
        />
      )}

      {/* Drawer */}
      <div className={`side-drawer ${isOpen ? 'open' : 'closed'} flex flex-col bg-white w-full max-w-[500px]`}>
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-white">
           <div>
              <h2 className="text-[16px] font-semibold text-gray-900">Widget configuration</h2>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-all text-gray-400">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar bg-gray-50/30">
            {/* Section: Basic Settings */}
            <section className="space-y-6">
                    
                    <div className="relative w-full">
                        <input 
                            type="text" 
                            name="title" 
                            id="floating_title"
                            className={`peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border ${errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'} rounded-md appearance-none focus:outline-none focus:ring-2 transition-all`} 
                            value={formData.title || ""} 
                            onChange={handleChange}
                            placeholder=" "
                        />
                        <label htmlFor="floating_title" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">
                            Widget title <span className="text-red-400 font-bold ml-0.5">*</span>
                        </label>
                        {errors.title && (
                            <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 ml-1">
                                <AlertCircle className="w-3 h-3" /> {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="relative w-full">
                        <select 
                            id="floating_type" 
                            disabled 
                            className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-500 bg-gray-50 border border-gray-300 rounded-md appearance-none cursor-not-allowed"
                        >
                            <option>{widget?.type?.replace('_', ' ')}</option>
                        </select>
                        <label htmlFor="floating_type" className="absolute text-[12px] font-medium text-gray-400 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-gradient-to-b from-white to-gray-50 px-1 left-3 pointer-events-none">
                            Widget type <span className="text-red-400 font-bold ml-0.5">*</span>
                        </label>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                    </div>

                    <div className="relative w-full">
                        <textarea 
                            name="description" 
                            id="floating_desc"
                            className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all h-24 resize-none"
                            placeholder="Describe what this widget shows..."
                            onChange={handleChange}
                            value={formData.description || ""}
                        />
                        <label htmlFor="floating_desc" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">
                            Description
                        </label>
                    </div>
                </section>

                {/* Section: Grid Settings */}
                <section className="space-y-4">
                    <div className="mb-2">
                        <span className="text-[13px] font-bold text-gray-900">Widget size</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative w-full">
                            <input 
                                type="number" 
                                name="w"
                                id="floating_w" 
                                className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all" 
                                min="1" max="12" 
                                onChange={handleChange} 
                                value={formData.w} 
                                placeholder=" "
                            />
                            <label htmlFor="floating_w" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">
                                Width (Columns) <span className="text-red-400 font-bold ml-0.5">*</span>
                            </label>
                        </div>
                        <div className="relative w-full">
                            <input 
                                type="number" 
                                name="h" 
                                id="floating_h"
                                className="peer block w-full px-3 pt-4 pb-2 text-[13px] text-gray-900 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-md appearance-none focus:outline-none focus:ring-2 transition-all" 
                                min="1" max="100" 
                                onChange={handleChange} 
                                value={formData.h} 
                                placeholder=" "
                            />
                            <label htmlFor="floating_h" className="absolute text-[12px] font-medium text-gray-400 duration-300 transform -translate-y-3.5 scale-75 top-3.5 z-10 origin-[0] bg-white px-1 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-3.5 peer-focus:-translate-y-3.5 peer-focus:scale-75 pointer-events-none">
                                Height (Rows) <span className="text-red-400 font-bold ml-0.5">*</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Section: Data Settings */}
                <section className="space-y-4 pb-10">
                    <div className="mb-2">
                        <span className="text-[14px] font-semibold text-gray-900">Data setting</span>
                    </div>
                    {renderDataSettings()}
                </section>
        </div>

        <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
           <button onClick={onClose} className="px-6 py-1.5 border border-[#10b981] text-[#10b981] rounded-md text-[13px] font-medium hover:bg-emerald-50 transition-colors">Cancel</button>
           <button onClick={handleSave} className="px-6 py-1.5 bg-[#10b981] text-white rounded-md text-[13px] font-medium hover:bg-[#059669] transition-colors shadow-sm">Add</button>
        </div>
      </div>
    </>
  );
};

export default WidgetSettingsDrawer;
