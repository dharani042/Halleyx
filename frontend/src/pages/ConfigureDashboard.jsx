import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsConfiguring, addWidget, removeWidget, updateWidget } from "../store/dashboardSlice";
import { Save, X, ArrowLeft, Check, AlertTriangle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Widget from "../components/Widget";
import WidgetSettingsDrawer from "../components/WidgetSettingsDrawer";
import { saveWidgetsBatch } from "../store/apiActions";

const ConfigureDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const widgets = useSelector((state) => state.dashboard.widgets);
  const canvasRef = useRef(null);
  
  const [hoverPos, setHoverPos] = useState(null);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null); // Stores widget to delete
  const [toaster, setToaster] = useState({ show: false, message: "", type: "success" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Grid configuration
  const cols = 12;
  const rows = 20;
  const gap = 8;
  const cellSize = 60;

  useEffect(() => {
    dispatch(setIsConfiguring(true));
    return () => dispatch(setIsConfiguring(false));
  }, [dispatch]);

  const showToast = (message) => {
    setToaster({ show: true, message });
    setTimeout(() => setToaster({ show: false, message: "" }), 3000);
  };

  const getDefaultSize = (type) => {
    switch(type) {
      case 'KPI': return { w: 2, h: 2 };
      case 'TABLE': return { w: 5, h: 5 };
      case 'BAR_CHART':
      case 'LINE_CHART':
      case 'AREA_CHART':
      case 'SCATTER_PLOT':
      case 'PIE_CHART': return { w: 4, h: 4 };
      default: return { w: 5, h: 5 }; 
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 8; 
    const y = e.clientY - rect.top - 8;
    const col = Math.floor(x / (rect.width / cols));
    const row = Math.floor(y / (cellSize + gap));
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      setHoverPos({ col, row });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setHoverPos(null);
    
    // Check if dragging an existing widget
    const existingWidgetId = e.dataTransfer.getData("widgetId");
    
    if (existingWidgetId && hoverPos) {
      // Reposition existing widget
      const widgetToMove = widgets.find(w => w.id === existingWidgetId);
      if (widgetToMove) {
        dispatch(updateWidget({ ...widgetToMove, x: hoverPos.col, y: hoverPos.row }));
        setHasUnsavedChanges(true);
      }
      return;
    }

    // Creating a new widget from the sidebar
    const type = e.dataTransfer.getData("widgetType");
    if (!type || !hoverPos) return;
    const size = getDefaultSize(type);
    
    // Calculate new widget size limits 
    // Wait, the grid shouldn't just let widgets overflow off the right side
    let safeW = size.w;
    if (hoverPos.col + safeW > cols) {
       safeW = cols - hoverPos.col;
    }

    const newWidget = {
      id: Date.now().toString(),
      type,
      title: "Untitled",
      w: safeW,
      h: size.h,
      x: hoverPos.col,
      y: hoverPos.row,
      value: type === 'KPI' ? 0 : null
    };
    dispatch(addWidget(newWidget));
    setHasUnsavedChanges(true);
    showToast("All set! Your new widget have been added successfully!");
  };

  const handleSaveConfig = () => {
    const batch = widgets.map(w => ({
        title: w.title,
        type: w.type,
        width: w.w,
        height: w.h,
        gridX: w.x,
        gridY: w.y,
        settingsJson: JSON.stringify({
            metric: w.metric,
            aggregation: w.aggregation,
            format: w.format,
            precision: w.precision,
            xAxis: w.xAxis,
            yAxis: w.yAxis,
            color: w.color,
            description: w.description,
            selectedColumns: w.selectedColumns,
            sortBy: w.sortBy,
            pagination: w.pagination,
            applyFilter: w.applyFilter,
            filters: w.filters,
            fontSize: w.fontSize,
            headerBackground: w.headerBackground,
            showDataLabel: w.showDataLabel,
            showLegend: w.showLegend
        })
    }));
    
    dispatch(saveWidgetsBatch(batch)).then(() => {
        setHasUnsavedChanges(false);
        showToast("All set! Your changes have been saved successfully");
        setTimeout(() => {
            dispatch(setIsConfiguring(false));
            navigate("/");
        }, 1500);
    });
  };

  const confirmDelete = () => {
    if (showDeleteModal) {
      dispatch(removeWidget(showDeleteModal.id));
      setHasUnsavedChanges(true);
      setShowDeleteModal(null);
      showToast("Done! Your widget has been removed");
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6] relative overflow-hidden">
      {/* Success Toaster */}
      {toaster.show && (
        <div className="toaster-success">
           <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <Check className="w-4 h-4 font-black" />
           </div>
           <span className="text-sm font-bold text-gray-800">{toaster.message}</span>
           <button onClick={() => setToaster({ ...toaster, show: false })} className="ml-4 p-1 hover:bg-emerald-100 rounded text-gray-400">
              <X className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5 bg-white border-b border-gray-100 shadow-sm z-40">
        <div className="flex items-center gap-6">
           <button onClick={handleBack} className="p-3 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all text-gray-400 hover:text-gray-900 shadow-sm">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <div className="space-y-0.5">
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Configure dashboard</h2>
              <p className="text-xs text-gray-400 font-medium">Configure your dashboard to start viewing analytics</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="btn-secondary h-auto py-3 px-8 text-sm font-bold border-gray-200">Cancel</button>
          <button onClick={handleSaveConfig} className="btn-save shadow-lg shadow-emerald-200 h-auto py-3 px-10 text-sm">
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-12 flex justify-center bg-[#f3f4f6] custom-scrollbar">
        <div 
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={() => setHoverPos(null)}
          className="relative bg-white border border-gray-200 shadow-2xl rounded-3xl p-2 transition-all duration-300"
          style={{
            width: '1100px',
            minHeight: '1200px',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridAutoRows: `${cellSize}px`,
            gap: `${gap}px`,
          }}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-2 grid-canvas pointer-events-none rounded-2xl" />

          {/* Hover Placeholder */}
          {hoverPos && (
             <div 
               className="bg-emerald-50 border-2 border-dashed border-emerald-400 rounded-3xl absolute z-10 pointer-events-none transition-all duration-200"
               style={{
                 left: `calc(${(hoverPos.col / cols) * 100}% + 8px)`,
                 top: `calc(${hoverPos.row * (cellSize + gap)}px + 8px)`,
                 width: `calc(${(2 / cols) * 100}% - ${gap}px)`, 
                 height: `${2 * cellSize + gap}px`,
               }}
             />
          )}

           {/* Widgets */}
          {widgets.map((widget) => (
             <div 
               key={widget.id}
               className="absolute z-20 cursor-grab active:cursor-grabbing hover:z-30"
               draggable
               onDragStart={(e) => {
                 e.dataTransfer.setData("widgetId", widget.id);
                 // Optional: Set drag image behavior
               }}
               style={{
                 left: `calc(${(widget.x / cols) * 100}% + 8px)`,
                 top: `calc(${widget.y * (cellSize + gap)}px + 8px)`,
                 width: `calc(${(widget.w / cols) * 100}% - ${gap}px)`,
                 height: `${widget.h * cellSize + (widget.h - 1) * gap}px`,
                 transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
               }}
             >
               <Widget 
                 widget={widget} 
                 onDelete={(id) => setShowDeleteModal(widget)}
                 onSettings={(w) => setSelectedWidget(w)}
               />
             </div>
          ))}
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl p-12 max-w-lg w-full text-center space-y-8 duration-300">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
                 <AlertTriangle className="w-10 h-10 text-amber-500" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Unsaved changes</h3>
                 <p className="text-gray-500 font-medium px-4 leading-relaxed">Do you want to save your changes before navigating away?</p>
              </div>
              <div className="flex gap-4 pt-4">
                 <button 
                   onClick={() => navigate("/")}
                   className="flex-1 btn-discard h-auto py-5 uppercase tracking-[0.1em]"
                 >
                   Discard
                 </button>
                 <button 
                   onClick={handleSaveConfig}
                   className="flex-1 btn-save h-auto py-5 uppercase tracking-[0.1em]"
                 >
                   Save
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 duration-300">
           <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full duration-200">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-gray-900">Delete</h3>
                 <button onClick={() => setShowDeleteModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <X className="w-5 h-5 text-gray-400" />
                 </button>
              </div>
              <p className="text-gray-500 font-medium mb-10">
                 Are you sure you want to delete the <span className="font-black text-gray-900">{showDeleteModal.title || "Untitled"}</span> widget?
              </p>
              <div className="flex gap-3 justify-end pt-4">
                 <button 
                   onClick={() => setShowDeleteModal(null)}
                   className="px-6 py-2.5 border border-emerald-500 text-emerald-500 font-black rounded-xl hover:bg-emerald-50 transition-all shadow-sm"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmDelete}
                   className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-md active:scale-95"
                 >
                   Delete
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Settings Drawer */}
      <WidgetSettingsDrawer 
        widget={selectedWidget}
        isOpen={!!selectedWidget}
        onClose={() => setSelectedWidget(null)}
        onSave={(updated) => { dispatch(updateWidget(updated)); setHasUnsavedChanges(true); }}
      />
    </div>
  );
};

export default ConfigureDashboard;
