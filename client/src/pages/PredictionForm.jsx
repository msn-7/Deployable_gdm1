import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictGDM } from '../services/api';
import { Loader2 } from 'lucide-react';

const PredictionForm = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        Age: '',
        No_of_Pregnancy: '',
        Gestation_in_previous_Pregnancy: '',
        BMI: '',
        HDL: '',
        Family_History: '0',
        unexplained_prenetal_loss: '0',
        Large_Child_or_Birth_Default: '0',
        PCOS: '0',
        Sys_BP: '',
        Dia_BP: '',
        OGTT: '',
        Hemoglobin: '',
        Sedentary_Lifestyle: '0',
        Prediabetes: '0',
        patient_name: '',
        patient_email: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = { ...formData };
            if (user) {
                payload.user_id = user.id;
            }
            if (user && !payload.patient_email) {
                payload.patient_email = user.email; // Auto-fill email if not provided
            }

            const result = await predictGDM(payload);
            navigate('/result', { state: { result, formData } });
        } catch (err) {
            setError('Failed to get prediction. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">GDM Risk Assessment</h2>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Clinical Data */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age (years)</label>
                        <input required type="number" name="Age" value={formData.Age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">No. of Pregnancies</label>
                        <input required type="number" name="No_of_Pregnancy" value={formData.No_of_Pregnancy} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gestation in Prev. Pregnancy</label>
                        <input type="number" name="Gestation_in_previous_Pregnancy" value={formData.Gestation_in_previous_Pregnancy} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Weeks (Optional)" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">BMI (kg/m²)</label>
                        <input required type="number" step="0.1" name="BMI" value={formData.BMI} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">HDL Cholesterol</label>
                        <input required type="number" name="HDL" value={formData.HDL} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Systolic BP (mmHg)</label>
                        <input required type="number" name="Sys_BP" value={formData.Sys_BP} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diastolic BP (mmHg)</label>
                        <input required type="number" name="Dia_BP" value={formData.Dia_BP} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">OGTT (mg/dL)</label>
                        <input required type="number" name="OGTT" value={formData.OGTT} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hemoglobin (g/dL)</label>
                        <input required type="number" step="0.1" name="Hemoglobin" value={formData.Hemoglobin} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>

                    {/* Binary/Categorical Data */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Family History of Diabetes</label>
                        <select name="Family_History" value={formData.Family_History} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unexplained Prenatal Loss</label>
                        <select name="unexplained_prenetal_loss" value={formData.unexplained_prenetal_loss} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Large Child / Birth Default</label>
                        <select name="Large_Child_or_Birth_Default" value={formData.Large_Child_or_Birth_Default} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PCOS</label>
                        <select name="PCOS" value={formData.PCOS} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sedentary Lifestyle</label>
                        <select name="Sedentary_Lifestyle" value={formData.Sedentary_Lifestyle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prediabetes</label>
                        <select name="Prediabetes" value={formData.Prediabetes} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="0">No</option>
                            <option value="1">Yes</option>
                        </select>
                    </div>
                </div>

                {/* Contact Information for Alerts */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Patient Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                            <input required type="text" name="patient_name" value={formData.patient_name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="Full Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Patient Email</label>
                            <input required type="email" name="patient_email" value={formData.patient_email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="For final report" />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition flex justify-center items-center">
                    {loading ? <><Loader2 className="animate-spin mr-2" /> Predicting...</> : 'Assess Risk'}
                </button>
            </form>
        </div>
    );
};

export default PredictionForm;
