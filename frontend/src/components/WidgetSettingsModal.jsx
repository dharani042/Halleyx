import React, { useState } from "react";
import { X, Save } from "lucide-react";

const WidgetSettingsModal = ({ widget, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...widget });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const renderDataSettings = () => {
    switch (widget.type) {
      case "KPI":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Select metric</label>
                <select name="metric" className="input" onChange={handleChange} value={formData.metric || ""}>
                  <option value="Total amount">Total amount</option>
                  <option value="Quantity">Quantity</option>
                  <option value="Unit price">Unit price</option>
                </select>
              </div>
              <div>
                <label className="label">Aggregation</label>
                <select name="aggregation" className="input" onChange={handleChange} value={formData.aggregation || "Sum"}>
                  <option>Sum</option>
                  <option>Average</option>
                  <option>Count</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="label">Data format</label>
                <select name="format" className="input" onChange={handleChange} value={formData.format || "Number"}>
                  <option>Number</option>
                  <option>Currency</option>
                </select>
              </div>
              <div>
                <label className="label">Decimal Precision</label>
                <input type="number" name="precision" className="input" min="0" onChange={handleChange} value={formData.precision || 0} />
              </div>
            </div>
          </>
        );
      case "BAR_CHART":
      case "LINE_CHART":
      case "AREA_CHART":
      case "SCATTER_PLOT":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Choose X-Axis data</label>
                <select name="xAxis" className="input" onChange={handleChange} value={formData.xAxis || ""}>
                   <option>Product</option>
                   <option>Status</option>
                   <option>Created by</option>
                </select>
              </div>
              <div>
                <label className="label">Choose Y-Axis data</label>
                <select name="yAxis" className="input" onChange={handleChange} value={formData.yAxis || ""}>
                   <option>Total amount</option>
                   <option>Quantity</option>
                   <option>Unit price</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
               <label className="label">Chart color</label>
               <input type="color" name="color" className="w-full h-10 rounded-lg cursor-pointer" onChange={handleChange} value={formData.color || "#3b82f6"} />
            </div>
          </>
        );
      case "TABLE":
        return (
          <div className="space-y-4">
             <div>
                <label className="label">Choose columns</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   {["Customer ID", "Customer Name", "Product", "Quantity", "Total amount", "Status"].map(col => (
                     <label key={col} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-blue-600" /> {col}
                     </label>
                   ))}
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden duration-300">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Widget Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-auto space-y-6">
          <section>
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core Info</h4>
             <div className="space-y-4">
                <div>
                   <label className="label">Widget title</label>
                   <input 
                     type="text" 
                     name="title" 
                     className="input" 
                     value={formData.title} 
                     onChange={handleChange}
                     placeholder="Enter title..."
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="label">Width (Columns)</label>
                      <input type="number" name="w" className="input" value={formData.w} onChange={handleChange} min="1" max="12" />
                   </div>
                   <div>
                      <label className="label">Height (Rows)</label>
                      <input type="number" name="h" className="input" value={formData.h} onChange={handleChange} min="1" />
                   </div>
                </div>
             </div>
          </section>

          <section>
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Data Settings</h4>
             {renderDataSettings()}
          </section>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
           <button onClick={onClose} className="btn-secondary">Cancel</button>
           <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Settings
           </button>
        </div>
      </div>

      <style>{`
        .label { @apply block text-sm font-semibold text-gray-700 mb-1.5; }
        .input { @apply w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all; }
      `}</style>
    </div>
  );
};

export default WidgetSettingsModal;
