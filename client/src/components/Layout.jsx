import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
            <Navbar />
            <main className="flex-grow container mx-auto px-6 py-8">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
