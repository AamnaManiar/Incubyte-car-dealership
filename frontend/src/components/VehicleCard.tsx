import React from 'react';
import { Edit2, Trash2, Tag, Hash, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onRestock?: (id: string, amount: number) => void; // Optional for admin
}

const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  onPurchase, 
  onEdit, 
  onDelete,
  onRestock 
}) => {
  const { isAdmin } = useAuth();
  
  // Format price to USD currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="glass-panel rounded-xl overflow-hidden hover-float transition-all duration-300 flex flex-col h-full group cursor-pointer relative top-0 hover:-top-2">
      {/* Card Header with Image */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {/* Dark Gradient Overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {vehicle.imageUrl ? (
          <img 
            src={`http://localhost:5000${vehicle.imageUrl}`} 
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="p-5 border-b border-gray-50 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {vehicle.make} {vehicle.model}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <Tag className="w-3.5 h-3.5" />
            <span>{vehicle.category}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-black text-gray-900 flex items-center">
            {formattedPrice}
          </span>
          {/* Stock Badge */}
          <div className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isOutOfStock 
              ? 'bg-red-50 text-red-700 border border-red-100' 
              : vehicle.quantity < 3 
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'bg-green-50 text-green-700 border border-green-100'
          }`}>
            <Hash className="w-3 h-3 mr-1" />
            {isOutOfStock ? 'Out of Stock' : `${vehicle.quantity} left`}
          </div>
        </div>
      </div>

      {/* Card Actions (Bottom) */}
      <div className="p-4 mt-auto bg-gray-50 flex gap-2 justify-between items-center border-t border-gray-100">
        <button
          onClick={() => onPurchase(vehicle.id)}
          disabled={isOutOfStock}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow active:scale-[0.98]'
          }`}
        >
          {isOutOfStock ? 'Sold Out' : 'Purchase'}
        </button>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-2">
            {onRestock && (
              <button
                onClick={() => {
                  const amt = window.prompt(`How many units to restock for ${vehicle.make} ${vehicle.model}?`);
                  if (amt && !isNaN(Number(amt)) && Number(amt) > 0) {
                    onRestock(vehicle.id, Number(amt));
                  }
                }}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                title="Restock"
              >
                +
              </button>
            )}
            <button
              onClick={() => onEdit(vehicle)}
              className="p-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
              title="Edit Vehicle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(vehicle.id)}
              className="p-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
