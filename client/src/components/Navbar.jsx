import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600">GDM Predictor</Link>
                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
                    <Link to="/predict" className="text-gray-600 hover:text-blue-500">Predict</Link>
                    <Link to="/upload" className="text-gray-600 hover:text-blue-500">Batch Upload</Link>
                    {user && <Link to="/history" className="text-gray-600 hover:text-blue-500">History</Link>}
                    <Link to="/performance" className="text-gray-600 hover:text-blue-500">Performance</Link>

                    {user ? (
                        <div className="flex items-center space-x-4 border-l pl-6">
                            <span className="flex items-center text-sm font-medium text-gray-700">
                                <User className="w-4 h-4 mr-2" />
                                {user.name}
                            </span>
                            <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700 text-sm font-medium">
                                <LogOut className="w-4 h-4 mr-1" /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4 border-l pl-6">
                            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-sm font-medium">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
