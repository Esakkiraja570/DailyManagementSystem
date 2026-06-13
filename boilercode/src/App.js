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
import EmiAgentDashboard from './MainComponents/EmiAgent/EmiMain/EmiAgentDashboard';
import EmiCustomerDashboard from './MainComponents/EmiAgent/EmiMain/EmiCustomerDashboard';
import ShopDashboard from './Pages/Modules/SmallShop/ShopDashboard';
import ShopCustomerDashboard from './Pages/Modules/SmallShop/ShopCustomerDashboard';


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

        <Route path="/agent/admin" element={<EmiAgentDashboard />} />
        <Route path="/agent/customer" element={<EmiCustomerDashboard />} />

        <Route path="/distributor/admin" element={<NewspaperDashboard />} />
        <Route path="/distributor/customer" element={<NewspaperBillingPortal />} />

        <Route path="/smallshop/admin" element={<ShopDashboard />} />
        <Route path="/smallshop/customer" element={<ShopCustomerDashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
