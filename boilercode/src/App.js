import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Pages/Landing/LandingPage';
import ModuleSelection from './Pages/Selection/ModuleSelection';
import RoleSelection from './Pages/Selection/RoleSelection';
import MilkmanAuth from './Pages/Modules/Milkman/MilkmanAuth';
import NewspaperAuth from './Pages/Modules/Newspaper/NewspaperAuth';
import EMIAuth from './Pages/Modules/EMI/EMIAuth';
import SmallShopAuth from './Pages/Modules/SmallShop/SmallShopAuth';
import MilkmanDashboard from './Pages/Modules/Milkman/MilkmanDashboard';
import MilkmanCustomerPortal from './Pages/Modules/Milkman/Customer/CustomerPortal';
import NewspaperDashboard from './Pages/Modules/Newspaper/NewspaperDashboard';
import NewspaperBillingPortal from './Pages/Modules/Newspaper/BillingPortal';
import AgentDashboard from './Pages/Modules/EMI/AgentDashboard';
import CustomerPayment from './Pages/Modules/EMI/EmiCustomer/CustomerPayment';
import ShopDashboard from './Pages/Modules/SmallShop/ShopDashboard';

// Simple Dashboard Components to make it look "Real"
const Dashboard = ({ title, module }) => (
  <div className="selection-container" style={{ padding: '2rem' }}>
    <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '1000px', padding: '3rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Welcome to the {module} Management Portal.</p>

      <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--primary)' }}>124</h3>
          <p style={{ fontSize: '0.8rem' }}>Total Customers</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--secondary)' }}>$1,240</h3>
          <p style={{ fontSize: '0.8rem' }}>Daily Revenue</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--accent)' }}>98%</h3>
          <p style={{ fontSize: '0.8rem' }}>Delivery Rate</p>
        </div>
      </div>

      <button onClick={() => window.history.back()} className="btn-outline" style={{ marginTop: '3rem' }}>Log Out</button>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-module" element={<ModuleSelection />} />
        <Route path="/select-role/:moduleId" element={<RoleSelection />} />

        {/* Module Specific Auth Routes */}
        <Route path="/auth/milkman/:role" element={<MilkmanAuth />} />
        <Route path="/auth/distributor/:role" element={<NewspaperAuth />} />
        <Route path="/auth/agent/:role" element={<EMIAuth />} />
        <Route path="/auth/smallshop/:role" element={<SmallShopAuth />} />

        {/* Module Specific Routes */}
        <Route path="/milkman/admin" element={<MilkmanDashboard />} />
        <Route path="/milkman/customer" element={<MilkmanCustomerPortal />} />

        <Route path="/agent/admin" element={<AgentDashboard />} />
        <Route path="/agent/customer" element={<CustomerPayment />} />

        <Route path="/distributor/admin" element={<NewspaperDashboard />} />
        <Route path="/distributor/customer" element={<NewspaperBillingPortal />} />

        <Route path="/smallshop/admin" element={<ShopDashboard />} />
        <Route path="/smallshop/customer" element={<ShopDashboard />} /> {/* Using same for now */}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
