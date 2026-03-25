import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, Award, Activity, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../services/api';

const ModelPerformance = () => {
    const [metrics, setMetrics] = useState(null);
    const [featureImportance, setFeatureImportance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bestModel, setBestModel] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Metrics
                const metricsResponse = await fetch(`${API_URL}/metrics`);
                const metricsData = await metricsResponse.json();
                setMetrics(metricsData);

                // Find best model based on recall (or whatever logic you prefer)
                let best = { name: '', recall: 0 };
                Object.entries(metricsData).forEach(([name, metric]) => {
                    if (metric.recall > best.recall) {
                        best = { name, ...metric };
                    }
                });
                setBestModel(best);

                // Fetch Feature Importance
                const fiResponse = await fetch(`${API_URL}/feature-importance`);
                if (fiResponse.ok) {
                    const fiData = await fiResponse.json();
                    setFeatureImportance(fiData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (!metrics) return <div className="text-center text-red-500 p-8">Failed to load model metrics.</div>;

    // Transform data for Recharts
    const chartData = Object.keys(metrics).map(modelName => ({
        name: modelName,
        Accuracy: (metrics[modelName].accuracy * 100).toFixed(1),
        Precision: (metrics[modelName].precision * 100).toFixed(1),
        Recall: (metrics[modelName].recall * 100).toFixed(1),
        F1: (metrics[modelName].f1_score * 100).toFixed(1),
        AUC: (metrics[modelName].auc * 100).toFixed(1)
    }));

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8 flex items-center justify-center">
                <Activity className="mr-3" /> Model Performance Analysis
            </h2>

            {/* Best Model Highlight */}
            {bestModel && (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center">
                            <Award className="mr-2 text-yellow-300" /> Best Performing Model (Recall Optimized)
                        </h3>
                        <p className="text-3xl font-extrabold">{bestModel.name}</p>
                        <p className="opacity-90 mt-1">Highest Recall of {(bestModel.recall * 100).toFixed(2)}% (Crucial for medical diagnosis).</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-4xl font-bold">{(bestModel.auc * 100).toFixed(1)}%</div>
                        <div className="text-sm uppercase tracking-wide opacity-75">AUC Score</div>
                    </div>
                </div>
            )}

            {/* Visualizations Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ROC Curve */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <ImageIcon className="mr-2 text-purple-600" /> ROC Curves
                    </h3>
                    <div className="flex justify-center">
                        <img
                            src={`${API_URL}/images/roc_curve.png`}
                            alt="ROC Curve"
                            className="max-w-full h-auto rounded border border-gray-200"
                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<p class="text-red-500">Image not available</p>' }}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">Reference for model discrimination capability.</p>
                </div>

                {/* Confusion Matrix (Best Model) */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <ImageIcon className="mr-2 text-purple-600" /> Confusion Matrix ({bestModel?.name})
                    </h3>
                    <div className="flex justify-center">
                        <img
                            src={`${API_URL}/images/cm_${bestModel?.name.replace(/ /g, "_").toLowerCase()}.png`}
                            alt="Confusion Matrix"
                            className="max-w-full h-auto rounded border border-gray-200"
                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<p class="text-red-500">Image not available</p>' }}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">Visualizes True Positives, False Positives, etc.</p>
                </div>
            </div>

            {/* Metric Comparison Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <TrendingUp className="mr-2 text-green-600" /> Comparative Metrics
                </h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="AUC" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="F1" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Metrics Table</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precision</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recall</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F1 Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AUC</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Object.entries(metrics).map(([name, metric]) => (
                                <tr key={name} className={name === bestModel?.name ? "bg-blue-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                        {name}
                                        {name === bestModel?.name && <Award className="w-4 h-4 text-yellow-500 ml-2" />}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{(metric.accuracy * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{(metric.precision * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{(metric.recall * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{(metric.f1_score * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{(metric.auc * 100).toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ModelPerformance;
