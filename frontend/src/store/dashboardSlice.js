import { createSlice } from "@reduxjs/toolkit";
import { fetchWidgets, saveWidgetsBatch } from "./apiActions";

const initialState = {
  widgets: [
    { id: "w1", title: "Total Orders", type: "KPI", metric: "id", aggregation: "Count", w: 3, h: 2, x: 0, y: 0 },
    { id: "w2", title: "Total Revenue", type: "KPI", metric: "totalAmount", aggregation: "Sum", format: "Currency", w: 3, h: 2, x: 3, y: 0 },
    { id: "w3", title: "Total Customers", type: "KPI", metric: "Customer", aggregation: "Count", w: 3, h: 2, x: 6, y: 0 },
    { id: "w4", title: "Total Sold Quantity", type: "KPI", metric: "quantity", aggregation: "Sum", w: 3, h: 2, x: 9, y: 0 },
    { id: "w5", title: "Monthly Revenue", type: "BAR_CHART", metric: "totalAmount", aggregation: "Sum", w: 6, h: 5, x: 0, y: 2, color: "#10b981" },
    { id: "w6", title: "Status overview", type: "PIE_CHART", metric: "status", w: 6, h: 5, x: 6, y: 2 }
  ],
  isConfiguring: false,
  dateFilter: "All time",
  currentView: "Dashboard", // "Dashboard" or "Table"
  loading: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setIsConfiguring: (state, action) => {
      state.isConfiguring = action.payload;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    setDateFilter: (state, action) => {
      state.dateFilter = action.payload;
    },
    addWidget: (state, action) => {
      state.widgets.push(action.payload);
    },
    removeWidget: (state, action) => {
      state.widgets = state.widgets.filter((w) => w.id !== action.payload);
    },
    updateWidget: (state, action) => {
      const index = state.widgets.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.widgets[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWidgets.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
            state.widgets = action.payload.map(w => ({
                ...w,
                id: w.id ? w.id.toString() : Date.now().toString(),
                w: w.width || w.w || 2,
                h: w.height || w.h || 2,
                x: w.gridX || w.x || 0,
                y: w.gridY || w.y || 0,
                ...JSON.parse(w.settingsJson || "{}")
            }));
        }
        // If empty, it naturally falls back to the hardcoded default state widgets
        state.loading = false;
      })
      .addCase(saveWidgetsBatch.fulfilled, (state, action) => {
        state.widgets = action.payload.map(w => ({
            ...w,
            id: w.id ? w.id.toString() : Date.now().toString(),
            w: w.width || w.w || 2,
            h: w.height || w.h || 2,
            x: w.gridX || w.x || 0,
            y: w.gridY || w.y || 0,
            ...JSON.parse(w.settingsJson || "{}")
        }));
      });
  }
});

export const {
  setIsConfiguring,
  setCurrentView,
  setDateFilter,
  addWidget,
  removeWidget,
  updateWidget,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
