import React, { useState } from 'react';
import { uploadFile } from '../services/api';
import { UploadCloud, CheckCircle, AlertTriangle, Download } from 'lucide-react';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResults([]);
        setError('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await uploadFile(file);
            setResults(data.results || []);
        } catch (err) {
            setError(err.message || 'Upload failed. Please ensure the CSV format is correct.');
        } finally {
            setLoading(false);
        }
    };

    // Function to download results as CSV
    const downloadCSV = () => {
        if (results.length === 0) return;

        const headers = ["Patient_ID", "Prediction", "Probability", "Risk_Level"];
        const csvContent = [
            headers.join(","),
            ...results.map(row => `${row.Patient_ID},${row.Prediction},${row.Probability},${row.Risk_Level}`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gdm_predictions.csv";
        a.click();
    };

    const downloadTemplate = () => {
        const headers = [
            'Age', 'No_of_Pregnancy', 'Gestation_in_previous_Pregnancy', 'BMI', 'HDL',
            'Family_History', 'unexplained_prenetal_loss', 'Large_Child_or_Birth_Default',
            'PCOS', 'Sys_BP', 'Dia_BP', 'OGTT', 'Hemoglobin', 'Sedentary_Lifestyle', 'Prediabetes'
        ];

        // Create a dummy row for clarity
        const dummyRow = [
            '30', '2', '0', '25.5', '50', '1', '0', '0', '0', '120', '80', '140', '12.5', '0', '0'
        ];

        const csvContent = [headers.join(','), dummyRow.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gdm_prediction_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Batch Prediction Upload</h2>

            <div className="bg-white p-8 rounded-lg shadow-md mb-8 text-center">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">Upload a CSV file containing patient data.</p>
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        <Download className="w-4 h-4 mr-1" /> Download Template
                    </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 hover:border-blue-500 transition cursor-pointer relative">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                        <UploadCloud size={64} className="text-blue-500 mb-4" />
                        <p className="text-gray-600 text-lg">{file ? file.name : "Drag & Drop or Click to Upload CSV"}</p>
                        <p className="text-sm text-gray-400 mt-2">Format: Age, No_of_Pregnancy, BMI...</p>
                    </div>
                </div>

                {error && <div className="text-red-500 mt-4">{error}</div>}

                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="mt-6 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Upload & Predict'}
                </button>
            </div>

            {results.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Prediction Results</h3>
                        <button onClick={downloadCSV} className="flex items-center text-green-600 hover:text-green-700 font-semibold">
                            <Download size={20} className="mr-2" /> Download CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.Patient_ID}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {item.Prediction === 'GDM Positive' ? (
                                                <span className="text-red-600 flex items-center"><AlertTriangle size={16} className="mr-1" /> Positive</span>
                                            ) : (
                                                <span className="text-green-600 flex items-center"><CheckCircle size={16} className="mr-1" /> Negative</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.Probability}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold 
                                            ${item.Risk_Level === 'High Risk' ? 'text-red-600' :
                                                item.Risk_Level === 'Medium Risk' ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {item.Risk_Level}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
