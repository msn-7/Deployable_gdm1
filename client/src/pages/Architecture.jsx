import React from 'react';

const Architecture = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Project Architecture</h1>

            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-10">
                <p className="text-gray-700 mb-12 text-center text-lg leading-relaxed">
                    Our system utilizes a robust, modern architecture that seamlessly integrates a responsive frontend with a powerful backend and machine learning engine.
                </p>

                {/* Architecture Diagram */}
                <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8 py-10 bg-gray-50 rounded-lg border border-gray-200">

                    {/* User Interface */}
                    <div className="flex flex-col items-center group">
                        <div className="w-48 h-32 bg-white border-2 border-blue-500 rounded-xl flex flex-col items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                            <span className="text-blue-700 font-bold text-lg">User Interface</span>
                            <span className="text-gray-500 text-xs mt-2">(React + Vite)</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400 text-3xl font-light transform rotate-90 md:rotate-0">→</div>

                    {/* Backend API */}
                    <div className="flex flex-col items-center group">
                        <div className="w-48 h-32 bg-white border-2 border-green-500 rounded-xl flex flex-col items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                            <span className="text-green-700 font-bold text-lg">API Server</span>
                            <span className="text-gray-500 text-xs mt-2">(Flask / Python)</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400 text-3xl font-light transform rotate-90 md:rotate-0">→</div>

                    {/* ML Model */}
                    <div className="flex flex-col items-center group">
                        <div className="w-48 h-32 bg-white border-2 border-purple-500 rounded-xl flex flex-col items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                            <span className="text-purple-700 font-bold text-lg">ML Model</span>
                            <span className="text-gray-500 text-xs mt-2">(Scikit-Learn)</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400 text-3xl font-light transform rotate-90 md:rotate-0">→</div>

                    {/* Database */}
                    <div className="flex flex-col items-center group">
                        <div className="w-48 h-32 bg-white border-2 border-orange-500 rounded-xl flex flex-col items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                            <span className="text-orange-700 font-bold text-lg">Database</span>
                            <span className="text-gray-500 text-xs mt-2">(SQLite / CSV)</span>
                        </div>
                    </div>

                </div>

                <div className="mt-12 grid md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="text-xl font-bold mb-3 text-blue-800">Frontend Layer</h3>
                        <p className="text-gray-700">
                            Built with React and Vite for a fast, responsive user experience. It handles user interactions, form inputs, and visualizes the prediction results.
                        </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                        <h3 className="text-xl font-bold mb-3 text-green-800">Backend Layer</h3>
                        <p className="text-gray-700">
                            A lightweight Flask server acts as the bridge. It receives data, validates it, and passes it to the ML model for processing.
                        </p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                        <h3 className="text-xl font-bold mb-3 text-purple-800">Intelligence Layer</h3>
                        <p className="text-gray-700">
                            The ML Model (Random Forest/Logistic Regression) processes the health metrics to predict the risk of Gestational Diabetes.
                        </p>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
                        <h3 className="text-xl font-bold mb-3 text-orange-800">Data Layer</h3>
                        <p className="text-gray-700">
                            Stores user profiles, historical prediction data, and model performance metrics for long-term tracking and analysis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Architecture;
