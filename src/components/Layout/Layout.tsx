import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-vh-100 bg-light d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: '280px' }}>
        <Header />
        <main className="p-4" style={{ paddingTop: '90px', minHeight: '100vh' }}>
          <div className="animate__animated animate__fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;