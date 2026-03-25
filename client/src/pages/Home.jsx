import React from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/generated-image-1.png';

const Home = () => {
    return (
        <div className="relative min-h-[85vh] -mx-6 -mt-8 px-6 pt-8 flex items-center justify-center overflow-hidden">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            {/* Overlay for readability */}
            <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[2px]" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-4xl mx-auto py-12">
                <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg"
                    style={{ color: '#1e3a5f' }}>
                    Early Prediction of Gestational Diabetes Mellitus
                </h1>
                <p className="text-xl mb-10 drop-shadow-sm"
                   style={{ color: '#334155' }}>
                    Using Artificial Intelligence to assess risk factors early and ensure maternal and fetal health.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 transform hover:scale-105 transition duration-300 hover:shadow-2xl">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                             style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                            <span role="img" aria-label="stethoscope" className="text-white">🩺</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3" style={{ color: '#1d4ed8' }}>Manual Prediction</h2>
                        <p className="mb-6" style={{ color: '#64748b' }}>Enter clinical data manually for a single patient assessment.</p>
                        <Link to="/predict"
                              className="inline-block px-8 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                            Start Prediction
                        </Link>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/50 transform hover:scale-105 transition duration-300 hover:shadow-2xl">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                             style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
                            <span role="img" aria-label="upload" className="text-white">📊</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3" style={{ color: '#047857' }}>Batch Upload</h2>
                        <p className="mb-6" style={{ color: '#64748b' }}>Upload CSV files for bulk analysis of multiple patient records.</p>
                        <Link to="/upload"
                              className="inline-block px-8 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}>
                            Upload File
                        </Link>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/40">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: '#1e3a5f' }}>Why Early Prediction Matters?</h3>
                    <p style={{ color: '#475569' }}>
                        Gestational Diabetes (GDM) affects many pregnancies. Early detection allows for lifestyle interventions,
                        dietary changes, and better monitoring, significantly reducing risks for both mother and child.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
