import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            EKO Dry Cleaning
          </h1>
          {title && <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-xl p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
