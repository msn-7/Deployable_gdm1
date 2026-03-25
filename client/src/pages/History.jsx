import React, { useEffect, useState } from 'react';
import { Loader2, History as HistoryIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { API_URL } from '../services/api';

const History = ({ user }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                let url = `${API_URL}/history`;
                if (user && user.id) {
                    url += `?user_id=${user.id}`;
                }
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8 flex items-center justify-center">
                <HistoryIcon className="mr-3" /> Prediction History
            </h2>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No history available yet.</td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.patient_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.age}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.prediction === "GDM Positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                                                }`}>
                                                {item.prediction}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(item.probability * 100).toFixed(1)}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center">
                                                {item.risk_level === "High Risk" && <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />}
                                                {item.risk_level === "Low Risk" && <CheckCircle className="w-4 h-4 text-green-500 mr-2" />}
                                                <span className={`${item.risk_level === "High Risk" ? "text-red-600 font-bold" :
                                                    item.risk_level === "Medium Risk" ? "text-yellow-600 font-medium" :
                                                        "text-green-600"
                                                    }`}>
                                                    {item.risk_level}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;
