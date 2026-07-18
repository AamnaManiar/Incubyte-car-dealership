import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import VehicleCard from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';
import { Plus, PackageSearch, AlertCircle } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Fetch vehicles
  const fetchVehicles = async (filters = {}) => {
    setIsLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
      const response = await axiosClient.get(`/vehicles?${queryParams}`);
      setVehicles(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Actions
  const handlePurchase = async (id: string) => {
    try {
      await axiosClient.post(`/vehicles/${id}/purchase`);
      // Re-fetch to update inventory
      fetchVehicles();
      alert('Vehicle purchased successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to purchase vehicle');
    }
  };

  const handleRestock = async (id: string, amount: number) => {
    try {
      await axiosClient.post(`/vehicles/${id}/restock`, { amount });
      fetchVehicles();
      alert(`Restocked by ${amount} units.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to restock vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await axiosClient.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleSaveVehicle = async (vehicleData: any) => {
    try {
      if (editingVehicle?.id) {
        // Update
        await axiosClient.put(`/vehicles/${editingVehicle.id}`, vehicleData);
      } else {
        // Create
        await axiosClient.post('/vehicles', vehicleData);
      }
      setIsModalOpen(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventory</h1>
            <p className="text-gray-500 mt-1">Browse and manage available vehicles.</p>
          </div>
          
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Vehicle
            </button>
          )}
        </div>

        <SearchBar onSearch={fetchVehicles} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Loading Skeletons */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-xl h-64 border border-gray-100 p-5 flex flex-col justify-between animate-pulse">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <PackageSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria.</p>
            {isAdmin && (
              <button onClick={openAddModal} className="mt-4 text-blue-600 font-medium hover:underline">
                Add a new vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={handlePurchase}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onRestock={handleRestock}
              />
            ))}
          </div>
        )}
      </main>

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        initialData={editingVehicle}
      />
    </div>
  );
};

export default DashboardPage;
