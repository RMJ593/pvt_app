import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

function MenuItemList() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/api/menu-items', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMenuItems(response.data.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`/api/menu-items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMenuItems();
        } catch (error) {
            console.error('Error deleting menu item:', error);
            alert('Failed to delete menu item');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Menu Items</h1>
                <Link
                    to="/menu-items/create"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Add Menu Item
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {menuItems.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    No menu items found. <Link to="/menu-items/create" className="text-red-600 hover:text-red-700">Create one now</Link>
                                </td>
                            </tr>
                        ) : (
                            menuItems.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.image ? (
                                            <img
                                                src={`/storage/${item.image}`}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No image</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</div>
                                        <div className="mt-1 flex gap-2">
                                            {item.is_vegetarian && (
                                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                                     Veg
                                                </span>
                                            )}
                                            {item.is_spicy && (
                                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                                                   Spicy
                                                </span>
                                            )}
                                            {item.is_featured && (
                                                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                                                     Featured
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.category?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ${parseFloat(item.price).toFixed(2)}
                                        </div>
                                        {item.discount_price && (
                                            <div className="text-xs text-gray-500 line-through">
                                                ${parseFloat(item.discount_price).toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.is_available 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/menu-items/${item.id}/edit`}
                                            className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center"
                                        >
                                            <Edit size={16} className="mr-1" /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                                        >
                                            <Trash2 size={16} className="mr-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MenuItemList;

