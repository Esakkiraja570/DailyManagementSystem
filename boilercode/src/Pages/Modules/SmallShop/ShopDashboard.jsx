import React from 'react';
import DashboardLayout from '../../../Components/DashboardLayout';
import { ShoppingBag, Package, Users, BarChart } from 'lucide-react';

const ShopDashboard = () => {
  const stats = [
    { label: "Today's Sales", value: '$1,420', icon: <ShoppingBag className="text-primary" />, trend: '+8%' },
    { label: 'Low Stock Items', value: '12', icon: <Package className="text-warning" />, trend: 'Reorder now' },
    { label: 'Footfall', value: '85', icon: <Users className="text-info" />, trend: 'Avg 70' },
    { label: 'Profit Margin', value: '24%', icon: <BarChart className="text-success" />, trend: 'Target 25%' },
  ];

  return (
    <DashboardLayout title="Shop Management" moduleName="smallshop" role="admin">
      <div className="row g-4 mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className="glass p-4 h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="icon-box" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {stat.icon}
                </div>
                <span className="small fw-bold text-muted">{stat.trend}</span>
              </div>
              <h3 className="fw-bold mb-1">{stat.value}</h3>
              <p className="text-muted small mb-0">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass p-4">
            <h5 className="fw-bold mb-4">Inventory Alerts</h5>
            <div className="d-flex flex-column gap-3">
              {[
                { item: 'Milk Packets', stock: '5 left', status: 'Critical' },
                { item: 'Bread Loaves', stock: '12 left', status: 'Low' },
                { item: 'Eggs (Doz)', stock: '8 left', status: 'Low' },
              ].map((item, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center p-3 rounded hover-glass border-start border-3 border-danger">
                  <div>
                    <p className="small fw-bold mb-0">{item.item}</p>
                    <p className="extra-small text-muted mb-0">{item.stock}</p>
                  </div>
                  <span className="badge bg-danger bg-opacity-20 text-danger">{item.status}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-outline-primary btn-sm w-100 mt-4">Inventory Manager</button>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass p-4">
            <h5 className="fw-bold mb-4">Top Selling Products</h5>
            <div className="d-flex flex-column gap-3">
              {[
                { name: 'Fresh Milk 1L', sales: '145 units', revenue: '$362' },
                { name: 'Brown Bread', sales: '88 units', revenue: '$176' },
                { name: 'Greek Yogurt', sales: '52 units', revenue: '$104' },
              ].map((item, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center p-2">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar small" style={{ borderRadius: '8px' }}>#{(i+1)}</div>
                    <div>
                      <p className="small fw-bold mb-0">{item.name}</p>
                      <p className="extra-small text-muted mb-0">{item.sales}</p>
                    </div>
                  </div>
                  <h6 className="fw-bold mb-0">{item.revenue}</h6>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShopDashboard;
