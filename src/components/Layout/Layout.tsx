import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: '256px' }}>
        <Header />
        <main className="p-4" style={{ paddingTop: '80px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;