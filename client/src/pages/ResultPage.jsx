import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Send, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { sendReport } from '../services/api';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, formData } = location.state || {};

    if (!result) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-2xl font-bold text-gray-700">No result found.</h2>
                <Link to="/predict" className="text-blue-500 hover:underline mt-4 block">Go back to prediction</Link>
            </div>
        );
    }

    const { risk_level, probability, advice, color_class, top_features } = result;

    const chartData = top_features.map(f => ({
        name: f.feature,
        importance: (f.importance * 100).toFixed(1)
    }));

    const [doctorNotes, setDoctorNotes] = React.useState('');
    const [prescribedMeds, setPrescribedMeds] = React.useState(result ? result.medications.join('\n') : '');
    const [sending, setSending] = React.useState(false);
    const [sentStatus, setSentStatus] = React.useState(null); // null | 'success' | 'error'
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleSendReport = async () => {
        setSending(true);
        setSentStatus(null);
        setErrorMessage('');
        try {
            await sendReport({
                prediction_id: result.prediction_id,
                patient_email: result.patient_email,
                doctor_notes: doctorNotes,
                prescribed_meds: prescribedMeds,
                report_data: formData,
                result_context: result
            });
            setSentStatus('success');
        } catch (error) {
            console.error("Error sending report:", error);
            setErrorMessage(error.message || 'Failed to send report. Please check server logs.');
            setSentStatus('error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition">
                <ArrowLeft size={20} className="mr-2" /> Back
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                <div className={`p-6 ${risk_level === 'High Risk' ? 'bg-red-50' : risk_level === 'Medium Risk' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-3xl font-bold ${color_class}`}>{risk_level}</h2>
                            <p className="text-gray-600 mt-2">Patient: <span className="font-semibold">{result.patient_name}</span></p>
                            <p className="text-gray-600">Probability: <span className="font-semibold">{(probability * 100).toFixed(1)}%</span></p>
                        </div>
                        {risk_level === 'High Risk' ? <AlertTriangle size={64} className="text-red-500" /> :
                            risk_level === 'Medium Risk' ? <Info size={64} className="text-yellow-500" /> :
                                <CheckCircle size={64} className="text-green-500" />}
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Recommendations</h3>
                    <p className="text-gray-700 text-lg mb-6 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        {advice}
                    </p>

                    {result.precautions && result.precautions.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Automated Precautions</h3>
                            <ul className="list-disc list-inside bg-yellow-50 p-4 rounded-lg text-gray-700 space-y-1">
                                {result.precautions.map((p, index) => <li key={index}>{p}</li>)}
                            </ul>
                        </div>
                    )}

                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Why this prediction?</h3>
                    <p className="text-gray-500 mb-4 text-sm">Top contributing factors to this result based on our AI model.</p>

                    <div className="h-64 w-full mb-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 14 }} />
                                <Tooltip />
                                <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#60a5fa'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Doctor's Action Section */}
                    <div className="border-t pt-8 mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="bg-blue-600 text-white p-2 rounded mr-3 text-sm">DOCTOR USE ONLY</span>
                            Doctor's Review &amp; Approval
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Notes / Additional Instructions</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter specific dietary advice, follow-up schedule, or clinical observations..."
                                    value={doctorNotes}
                                    onChange={(e) => setDoctorNotes(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prescribed Medications (Editable)</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="List prescribed medications..."
                                    value={prescribedMeds}
                                    onChange={(e) => setPrescribedMeds(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Pre-filled with automated suggestions. Please edit as necessary.</p>
                            </div>

                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Send Report to Patient</p>
                                    <p className="text-sm text-gray-500">
                                        Will send PDF report to: <strong>{result.patient_email || 'No email provided'}</strong>
                                    </p>
                                </div>
                                <button
                                    onClick={handleSendReport}
                                    disabled={sending || sentStatus === 'success' || !result.patient_email}
                                    className={`px-6 py-3 rounded-lg font-bold text-white transition shadow-md flex items-center gap-2
                                        ${sentStatus === 'success'
                                            ? 'bg-green-600 cursor-default'
                                            : !result.patient_email
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {sentStatus === 'success'
                                        ? <><CheckSquare size={18} /> Report Sent!</>
                                        : sending
                                            ? 'Sending...'
                                            : <><Send size={18} /> Approve &amp; Send Report</>
                                    }
                                </button>
                            </div>

                            {sentStatus === 'error' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm font-semibold">❌ Failed to send report</p>
                                    <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                                </div>
                            )}

                            {sentStatus === 'success' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-700 text-sm font-semibold">✅ Report sent successfully to {result.patient_email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
