import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-blue-800 mb-6">Early Prediction of Gestational Diabetes Mellitus</h1>
            <p className="text-xl text-gray-600 mb-8">
                Using Artificial Intelligence to assess risk factors early and ensure maternal and fetal health.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 transform hover:scale-105 transition duration-300">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-4">Manual Prediction</h2>
                    <p className="text-gray-500 mb-6">Enter clinical data manually for a single patient assessment.</p>
                    <Link to="/predict" className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">Start Prediction</Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 transform hover:scale-105 transition duration-300">
                    <h2 className="text-2xl font-semibold text-green-600 mb-4">Batch Upload</h2>
                    <p className="text-gray-500 mb-6">Upload CSV files for bulk analysis of multiple patient records.</p>
                    <Link to="/upload" className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition">Upload File</Link>
                </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Why Early Prediction Matters?</h3>
                <p className="text-gray-700">
                    Gestational Diabetes (GDM) affects many pregnancies. Early detection allows for lifestyle interventions,
                    dietary changes, and better monitoring, significantly reducing risks for both mother and child.
                </p>
            </div>
        </div>
    );
};

export default Home;
