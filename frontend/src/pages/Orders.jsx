import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { fetchOrders, createOrder, updateOrder, deleteOrder } from "../store/apiActions";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { setCurrentView } from "../store/dashboardSlice";

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector((state) => state.orders);
  
  // States for Modals and UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Search and Notifications
  const [searchTerm, setSearchTerm] = useState("");
  const [toaster, setToaster] = useState({ show: false, message: "", type: "added" });
  const menuRef = useRef(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      emailId: "",
      phoneNumber: "",
      streetAddress: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
      product: "",
      quantity: 1,
      unitPrice: 0,
      status: "Pending",
      createdBy: ""
    }
  });

  const quantity = watch("quantity") || 0;
  const unitPrice = watch("unitPrice") || 0;
  const totalAmount = (quantity * unitPrice).toFixed(2);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(setCurrentView("Table"));
    
    // Close context menu on outside click
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  const showSuccessToaster = (message, type = "added") => {
    setToaster({ show: true, message, type });
    setTimeout(() => setToaster({ ...toaster, show: false }), 5000);
  };

  const onSubmit = (data) => {
    const finalData = {
        ...data,
        totalAmount: parseFloat(totalAmount)
    };

    if (editingOrder) {
        // Check for changes (simplified check vs initial values)
        const hasChanges = Object.keys(data).some(key => data[key] !== editingOrder[key]);
        if (!hasChanges) {
            setIsModalOpen(false);
            setEditingOrder(null);
            return;
        }

        dispatch(updateOrder({ ...finalData, id: editingOrder.id })).then((res) => {
            if (res.payload) {
                showSuccessToaster("All set! Your changes have been saved successfully!", "saved");
                setIsModalOpen(false);
                setEditingOrder(null);
                reset();
            }
        });
    } else {
        dispatch(createOrder(finalData)).then((res) => {
            if (res.payload) {
                const orderIdStr = `ORD-${res.payload.id.toString().padStart(4, '0')}`;
                showSuccessToaster(`Nice work! Your new order "${orderIdStr}" is now in the list!`, "added");
                setIsModalOpen(false);
                reset();
            }
        });
    }
  };

  const handleDelete = () => {
    if (deletingOrderId) {
        dispatch(deleteOrder(deletingOrderId)).then(() => {
            showSuccessToaster("Done! Your item has been removed", "removed");
            setIsDeleteModalOpen(false);
            setDeletingOrderId(null);
        });
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setOpenMenuId(null);
    Object.keys(order).forEach(key => {
        if (key !== 'id' && key !== 'createdAt') {
            setValue(key, order[key]);
        }
    });
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id) => {
    setDeletingOrderId(id);
    setOpenMenuId(null);
    setIsDeleteModalOpen(true);
  };

  const filteredOrders = orders.filter(order => 
    `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const countries = ["United States", "Canada", "Australia", "Singapore", "Hong Kong"];
  const products = ["VoIP Corporate Package", "Business Internet 500 Mbps", "Fiber Internet 1 Gbps", "5G Unlimited Mobile Plan", "Fiber Internet 300 Mbps"];
  const statuses = ["Pending", "In Progress", "Completed"];
  const creators = ["Mr. Michael Harris", "Mr. Ryan Cooper", "Ms. Olivia Carter", "Mr. Lucas Martin"];

  const FormField = ({ label, name, type = "text", options = null, prefix = null, rules = {}, readOnly = false, value = undefined }) => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {label} <span className="text-red-400 font-bold">*</span>
      </label>
      <div className="relative group">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{prefix}</span>
        )}
        {options ? (
          <select 
            {...register(name, rules)}
            className={`w-full ${prefix ? 'pl-8' : 'px-5'} py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#10b981]/10 focus:border-[#10b981] outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer ${errors[name] ? 'border-red-400 bg-red-50/20' : ''}`}
          >
            <option value="">Select {label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input 
            type={type}
            readOnly={readOnly}
            value={value}
            {...register(name, rules)}
            className={`w-full ${prefix ? 'pl-8' : 'px-5'} py-3.5 ${readOnly ? 'bg-gray-100/50 cursor-not-allowed' : 'bg-gray-50'} border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#10b981]/10 focus:border-[#10b981] outline-none transition-all font-bold text-gray-700 ${errors[name] ? 'border-red-400 bg-red-50/20' : ''}`}
          />
        )}
        {options && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
      </div>
      {errors[name] && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 ml-1">
          <AlertCircle className="w-3 h-3" /> {errors[name].message || "This field is required"}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-10 bg-[#f3f4f6]/50 h-screen overflow-hidden flex flex-col relative">
      {/* Toaster Notification */}
      {toaster.show && (
        <div className="fixed top-8 right-8 z-[1000]">
           <div className={`bg-white border ${toaster.type === 'removed' ? 'border-red-100' : 'border-emerald-100'} shadow-2xl rounded-2xl p-5 flex items-center gap-4 max-w-sm`}>
             <div className={`w-10 h-10 ${toaster.type === 'removed' ? 'bg-red-500' : 'bg-emerald-500'} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <CheckCircle2 className="w-6 h-6" />
             </div>
             <div className="pr-4">
               <p className="text-[13px] font-black text-gray-800 leading-tight">{toaster.message}</p>
             </div>
             <button onClick={() => setToaster({ ...toaster, show: false })} className="text-gray-300 hover:text-gray-500 transition-colors">
               <X className="w-5 h-5" />
             </button>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-shrink-0">
        <div className="space-y-1">
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Orders</h1>
           <p className="text-sm text-gray-400 font-medium">View and manage customer orders and details</p>
        </div>
        <button 
          onClick={() => { setEditingOrder(null); reset(); setIsModalOpen(true); }} 
          className="flex items-center gap-2 px-6 py-3 bg-[#10b981] text-white font-black rounded-xl hover:bg-[#059669] transition-all shadow-lg shadow-emerald-200"
        >
          <Plus className="w-5 h-5" /> Create Order
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
         <div className="flex gap-10">
            <div onClick={() => navigate("/")} className="flex items-center gap-2 py-3 border-b-2 border-transparent text-gray-400 font-bold hover:text-gray-600 cursor-pointer transition-all">
               <LayoutGrid className="w-4 h-4" /> Dashboard
            </div>
            <div className="flex items-center gap-2 py-3 border-b-2 border-[#10b981] text-[#10b981] font-black">
               <TableIcon className="w-4 h-4" /> Table
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#10b981] transition-colors" />
              <input 
                type="text" 
                placeholder="Search orders..."
                className="pl-11 pr-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#10b981]/10 focus:border-[#10b981] transition-all w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 shadow-sm transition-all hover:bg-gray-50">
               <Filter className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden bg-white border border-gray-100 rounded-[40px] shadow-sm flex flex-col p-8">
        {orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="w-24 h-24 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center mb-8 text-gray-200">
               <TableIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-400 font-medium mb-10 text-center max-w-xs leading-relaxed">Click Create Order and enter your order information to get started.</p>
            <button 
               onClick={() => { setEditingOrder(null); reset(); setIsModalOpen(true); }}
               className="px-10 py-4 bg-[#10b981] text-white font-black rounded-2xl hover:bg-[#059669] shadow-xl shadow-emerald-100 transition-all flex items-center gap-2"
            >
               <Plus className="w-5 h-5" /> Create order
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm min-w-[1400px]">
              <thead className="sticky top-0 bg-white z-10 border-b border-gray-50">
                <tr className="bg-gray-50/50 rounded-2xl">
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-16">S.no</th>
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-32">Order ID</th>
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-48">Order date</th>
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-48">Product</th>
                  <th className="px-6 py-5 text-center font-bold text-gray-400 text-[10px] uppercase tracking-widest w-24">Quantity</th>
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-32">Unit price</th>
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-32">Total amount</th>
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-32">Status</th>
                  <th className="px-6 py-5 text-left font-bold text-gray-400 text-[10px] uppercase tracking-widest w-48">Created by</th>
                  <th className="px-6 py-5 text-right font-bold text-gray-400 text-[10px] uppercase tracking-widest w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-6 py-5 font-bold text-gray-400">{index + 1}</td>
                    <td className="px-6 py-5 font-black text-gray-900">ORD-{order.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-5 font-bold text-gray-400">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-5 font-bold text-gray-600">{order.product}</td>
                    <td className="px-6 py-5 text-center font-black text-gray-900">{order.quantity}</td>
                    <td className="px-6 py-5 font-black text-gray-900">$ {parseFloat(order.unitPrice).toFixed(2)}</td>
                    <td className="px-6 py-5 font-black text-gray-900">$ {parseFloat(order.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-5">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                        order.status === "Pending" ? "bg-amber-50 text-amber-600" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-600">{order.createdBy}</td>
                    <td className="px-6 py-5 text-right relative">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === order.id ? null : order.id); }}
                         className="p-2.5 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                       >
                          <MoreVertical className="w-5 h-5" />
                       </button>

                       {openMenuId === order.id && (
                          <div 
                            ref={menuRef}
                            className="absolute right-12 top-1/2 -translate-y-1/2 bg-white border border-gray-100 shadow-2xl rounded-2xl py-2 w-40 z-[100] transition-all duration-200"
                          >
                             <button 
                               onClick={() => openEditModal(order)}
                               className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                             >
                                <Edit className="w-4 h-4 text-emerald-500" /> Edit
                             </button>
                             <button 
                               onClick={() => openDeleteConfirm(order.id)}
                               className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-500 flex items-center gap-3 transition-colors"
                             >
                                <Trash2 className="w-4 h-4 text-red-400" /> Delete
                             </button>
                          </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[600] flex items-center justify-center p-6 overflow-y-auto duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl p-12 max-w-4xl w-full my-auto transition-all duration-400">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{editingOrder ? 'Edit order' : 'Create order'}</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} 
                className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
              {/* Customer Info Section */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#10b981] rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">Customer Information</h3>
                 </div>
                 <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                    <FormField label="First name" name="firstName" rules={{ required: "First name not filled" }} />
                    <FormField label="Email id" name="emailId" type="email" rules={{ required: "Email id not filled", pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email address" } }} />
                    <FormField label="Last name" name="lastName" rules={{ required: "Last name not filled" }} />
                    <FormField label="Phone number" name="phoneNumber" rules={{ required: "Phone number not filled", pattern: { value: /^[0-9]{10}$/, message: "Mobile digit must be 10" } }} />
                    <div className="col-span-2">
                        <FormField label="Street Address" name="streetAddress" rules={{ required: "Street address not filled" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-6 col-span-2">
                        <FormField label="City" name="city" rules={{ required: "City not filled" }} />
                        <FormField label="State / Province" name="stateProvince" rules={{ required: "State not filled" }} />
                        <FormField label="Postal code" name="postalCode" rules={{ required: "Postal code not filled" }} />
                        <FormField label="Country" name="country" options={countries} rules={{ required: "Country not filled" }} />
                    </div>
                 </div>
              </div>

              {/* Order Info Section */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">Order Information</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    <FormField label="Choose product" name="product" options={products} rules={{ required: "Please select a product" }} />
                    <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                        <FormField label="Quantity" name="quantity" type="number" rules={{ required: "Quantity not filled", min: { value: 1, message: "Quantity must be at least 1" } }} />
                        <FormField label="Unit price" name="unitPrice" type="number" prefix="$" rules={{ required: "Unit price not filled", min: { value: 0, message: "Price cannot be negative" } }} />
                        <FormField label="Total amount" name="totalAmount" readOnly prefix="$" value={totalAmount} />
                        <FormField label="Status" name="status" options={statuses} rules={{ required: "Status not filled" }} />
                        <FormField label="Created by" name="createdBy" options={creators} rules={{ required: "Creator not filled" }} />
                    </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} className="px-10 py-4 border border-emerald-500 text-emerald-500 font-black rounded-2xl transition-all hover:bg-emerald-50 uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="px-14 py-4 bg-[#10b981] text-white font-black rounded-2xl hover:bg-[#059669] shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-xs active:scale-95">
                    {editingOrder ? 'Save' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[700] flex items-center justify-center p-6 duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-md w-full duration-200">
              <div className="flex justify-between items-start mb-6">
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delete</h2>
                 <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-gray-500 font-bold mb-10 leading-relaxed">
                 Are you sure you want to delete the <span className="text-red-500">ORD-{deletingOrderId?.toString().padStart(4, '0')}</span>?
              </p>
              <div className="flex justify-end gap-3">
                 <button onClick={() => setIsDeleteModalOpen(false)} className="px-8 py-3.5 bg-gray-50 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-all text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={handleDelete} className="px-10 py-3.5 bg-[#10b981] text-white font-black rounded-2xl hover:bg-red-500 transition-all shadow-lg text-xs uppercase tracking-widest">Delete</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
