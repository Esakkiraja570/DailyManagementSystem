import React from 'react';
import DashboardLayout from '../../../Components/DashboardLayout';
import { Newspaper, DollarSign, Users, TrendingUp } from 'lucide-react';

const NewspaperDashboard = () => {
  const stats = [
    { label: 'Total Circulation', value: '1,250', icon: <Newspaper className="text-primary" />, trend: '+3%' },
    { label: 'Active Readers', value: '1,120', icon: <Users className="text-info" />, trend: '+12' },
    { label: 'Monthly Revenue', value: '$8,450', icon: <DollarSign className="text-success" />, trend: '+15%' },
    { label: 'Outstanding Payments', value: '$1,200', icon: <TrendingUp className="text-warning" />, trend: '12% total' },
  ];

  return (
    <DashboardLayout title="Newspaper Distribution" moduleName="distributor" role="admin">
      <div className="row g-4 mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className="glass p-4 h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="icon-box" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {stat.icon}
                </div>
                <span className="small fw-bold text-success">{stat.trend}</span>
              </div>
              <h3 className="fw-bold mb-1">{stat.value}</h3>
              <p className="text-muted small mb-0">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-4 mb-5">
        <h5 className="fw-bold mb-4">Regional Distribution</h5>
        <div className="d-flex flex-column gap-4">
          {[
            { region: 'Downtown Area', count: 450, percentage: 85 },
            { region: 'Suburban North', count: 320, percentage: 65 },
            { region: 'East Riverside', count: 280, percentage: 45 },
            { region: 'West Park', count: 200, percentage: 30 },
          ].map((item, i) => (
            <div key={i}>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="fw-bold">{item.region}</span>
                <span className="text-muted">{item.count} papers</span>
              </div>
              <div className="progress bg-dark" style={{ height: '8px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: `${item.percentage}%`, borderRadius: '4px' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewspaperDashboard;
