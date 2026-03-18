import { createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:8080/api";

// Orders Actions
export const fetchOrders = createAsyncThunk("orders/fetchAll", async () => {
    const response = await fetch(`${API_BASE}/orders`);
    return await response.json();
});

export const createOrder = createAsyncThunk("orders/create", async (orderData) => {
    const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    return await response.json();
});

export const updateOrder = createAsyncThunk("orders/update", async (order) => {
    const response = await fetch(`${API_BASE}/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    return await response.json();
});

export const deleteOrder = createAsyncThunk("orders/delete", async (id) => {
    await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
    return id;
});

// Dashboard Actions
export const fetchWidgets = createAsyncThunk("dashboard/fetchWidgets", async () => {
    const response = await fetch(`${API_BASE}/dashboard/widgets`);
    return await response.json();
});

export const saveWidgetsBatch = createAsyncThunk("dashboard/saveBatch", async (widgets) => {
    // We clear current and save new for a true "Save Configuration" feel
    await fetch(`${API_BASE}/dashboard/widgets/clear`, { method: 'DELETE' });
    const response = await fetch(`${API_BASE}/dashboard/widgets/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgets)
    });
    return widgets;
});
