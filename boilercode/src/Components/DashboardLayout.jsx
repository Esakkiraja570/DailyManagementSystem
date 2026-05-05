import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Truck,
  Newspaper,
  Briefcase,
  ShoppingBag,
  FileText,
  Droplets,
  TrendingUp
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = ({ children, title, moduleName, role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic Navigation based on Module and Role
  const getNavItems = () => {
    const baseItems = [
      { icon: <LayoutDashboard size={20} />, label: 'Overview', path: `/${moduleName}/${role}` },
    ];

    const moduleSpecific = {
      milkman: {
        admin: [
          { icon: <Truck size={20} />, label: 'Logistics', path: '/milkman/admin' },
          { icon: <Users size={20} />, label: 'Customers', path: '/milkman/admin' },
          { icon: <ShoppingBag size={20} />, label: 'Storefront', path: '/milkman/admin' },
        ],
        customer: [
          { icon: <Droplets size={20} />, label: 'Daily Log', path: '/milkman/customer' },
          { icon: <ShoppingBag size={20} />, label: 'Order Store', path: '/milkman/customer' },
          { icon: <CreditCard size={20} />, label: 'Payments', path: '/milkman/customer' },
        ]
      },
      distributor: {
        admin: [
          { icon: <Newspaper size={20} />, label: 'Circulation', path: '#circulation' },
          { icon: <FileText size={20} />, label: 'Invoices', path: '#invoices' },
        ],
        customer: [
          { icon: <FileText size={20} />, label: 'My Bills', path: '#bills' },
        ]
      },
      agent: {
        admin: [
          { icon: <Briefcase size={20} />, label: 'Collections', path: '#collections' },
          { icon: <Users size={20} />, label: 'Borrowers', path: '#borrowers' },
        ],
        customer: [
          { icon: <CreditCard size={20} />, label: 'EMI Status', path: '#emi' },
        ]
      },
      smallshop: {
        admin: [
          { icon: <ShoppingBag size={20} />, label: 'Inventory', path: '#inventory' },
          { icon: <TrendingUp size={20} />, label: 'Sales Report', path: '#sales' },
        ]
      }
    };

    const extraItems = moduleSpecific[moduleName]?.[role] || [];
    return [...baseItems, ...extraItems, { icon: <Settings size={20} />, label: 'Settings', path: '#settings' }];
  };

  const navItems = getNavItems();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="avatar" style={{ background: '#000', color: '#fff' }}>
            {moduleName ? moduleName.charAt(0).toUpperCase() : 'D'}
          </div>
          <span>{moduleName ? moduleName.toUpperCase() : 'DMS'}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <a 
              key={index}
              href={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link w-100 border-0 bg-transparent text-start" onClick={() => navigate('/')}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div>
            <h1 className="h3 fw-bold mb-1">{title}</h1>
            <p className="text-muted small">
               <span className="badge bg-black text-white me-2">{role.toUpperCase()}</span>
               Workspace
            </p>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="search-box glass px-3 py-2 d-none d-md-flex align-items-center gap-2" style={{ background: '#f4f4f5', border: '1px solid #e4e4e7' }}>
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-0 text-black" 
                style={{ outline: 'none' }}
              />
            </div>
            
            <button className="p-2 position-relative border-0 bg-transparent text-black">
              <Bell size={20} />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
            </button>

            <div className="user-profile">
              <div className="text-end d-none d-sm-block">
                <p className="small fw-bold mb-0">Admin User</p>
                <p className="extra-small text-muted mb-0">{role}</p>
              </div>
              <div className="avatar" style={{ background: '#000', color: '#fff' }}>A</div>
            </div>
          </div>
        </header>

        {/* Content Rendered Here */}
        <section className="animate-fade-in">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
