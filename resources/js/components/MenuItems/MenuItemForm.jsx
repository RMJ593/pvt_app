import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

function MenuItemForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        description: '',
        price: '',
        discount_price: '',
        is_vegetarian: false,
        is_spicy: false,
        is_available: true,
        is_featured: false,
        order: 0
    });
    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchMenuItem();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchMenuItem = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`/menu-items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const item = response.data.data;
            setFormData({
                category_id: item.category_id,
                name: item.name,
                description: item.description || '',
                price: item.price,
                discount_price: item.discount_price || '',
                is_vegetarian: item.is_vegetarian,
                is_spicy: item.is_spicy,
                is_available: item.is_available,
                is_featured: item.is_featured,
                order: item.order
            });
            setCurrentImage(item.image);
        } catch (error) {
            console.error('Error fetching menu item:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const token = localStorage.getItem('auth_token');
            const data = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (typeof formData[key] === 'boolean') {
                    data.append(key, formData[key] ? '1' : '0');
                } else {
                    data.append(key, formData[key]);
                }
            });
            
            if (image) {
                data.append('image', image);
            }

            if (isEdit) {
                await axios.post(`/menu-items/${id}?_method=PUT`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post('/menu-items', data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            navigate('/menu-items');
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Failed to save menu item');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => navigate('/menu-items')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Menu Items
            </button>

            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {isEdit ? 'Edit Menu Item' : 'Create Menu Item'}
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.category_id[0]}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount Price
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="discount_price"
                                value={formData.discount_price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image
                        </label>
                        {currentImage && (
                            <div className="mb-2">
                                <img
                                    src={`/storage/${currentImage}`}
                                    alt="Current"
                                    className="w-32 h-32 object-cover rounded"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Order
                        </label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_vegetarian"
                                checked={formData.is_vegetarian}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700"> Vegetarian</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_spicy"
                                checked={formData.is_spicy}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700"> Spicy</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_available"
                                checked={formData.is_available}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700"> Available</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700"> Featured</span>
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/menu-items')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')} Menu Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MenuItemForm;


