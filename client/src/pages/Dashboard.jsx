import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardData().then(setStats).catch(console.error);
    }, []);

    if (!stats) return <div className="text-center p-10">Loading Dashboard...</div>;

    const data = [
        { name: 'High Risk', value: stats.high_risk },
        { name: 'Low/Medium Risk', value: stats.low_risk },
    ];

    const COLORS = ['#ef4444', '#22c55e'];

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 text-center">
                    <h3 className="text-gray-500 text-sm uppercase">Total Predictions</h3>
                    <p className="text-4xl font-bold text-gray-800">{stats.total_predictions}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 text-center">
                    <h3 className="text-gray-500 text-sm uppercase">High Risk Cases</h3>
                    <p className="text-4xl font-bold text-red-600">{stats.high_risk}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 text-center">
                    <h3 className="text-gray-500 text-sm uppercase">Low/Medium Risk Cases</h3>
                    <p className="text-4xl font-bold text-green-600">{stats.low_risk}</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Risk Distribution</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
