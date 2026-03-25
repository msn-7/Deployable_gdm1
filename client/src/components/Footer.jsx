import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6 mt-10">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} GDM Early Prediction System. All rights reserved.</p>
                <p className="text-gray-400 text-sm mt-2">AI-assisted diagnosis tool.</p>
            </div>
        </footer>
    );
};

export default Footer;
