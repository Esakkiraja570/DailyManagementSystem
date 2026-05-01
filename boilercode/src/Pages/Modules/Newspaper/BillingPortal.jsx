import React from 'react';
import DashboardLayout from '../../../Components/DashboardLayout';
import { FileText, CreditCard, CheckCircle } from 'lucide-react';

const BillingPortal = () => {
  return (
    <DashboardLayout title="My Newspaper Bills" moduleName="distributor" role="customer">
      <div className="row g-4 mb-5">
        <div className="col-lg-8">
          <div className="glass p-4">
            <h5 className="fw-bold mb-4">Unpaid Bills</h5>
            <div className="d-flex flex-column gap-3">
              <div className="glass p-3 border-start border-warning border-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="icon-box bg-warning bg-opacity-10 text-warning">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="fw-bold mb-0">April 2024 Bill</p>
                    <p className="extra-small text-muted mb-0">Due by May 05, 2024</p>
                  </div>
                </div>
                <div className="text-end">
                  <h4 className="fw-bold mb-1">$15.00</h4>
                  <button className="btn btn-primary btn-sm px-4">Pay Now</button>
                </div>
              </div>
            </div>

            <h5 className="fw-bold mt-5 mb-4">Payment History</h5>
            <div className="d-flex flex-column gap-2">
              {[
                { month: 'March 2024', amount: '$15.00', date: 'Mar 02, 2024' },
                { month: 'February 2024', amount: '$15.00', date: 'Feb 04, 2024' },
                { month: 'January 2024', amount: '$15.00', date: 'Jan 05, 2024' },
              ].map((item, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center p-3 rounded hover-glass">
                  <div className="d-flex align-items-center gap-3 text-muted">
                    <CheckCircle size={18} className="text-success" />
                    <span className="small fw-bold">{item.month}</span>
                  </div>
                  <div className="text-end">
                    <span className="small fw-bold">{item.amount}</span>
                    <p className="extra-small text-muted mb-0">Paid on {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass p-4 bg-primary bg-opacity-10 h-100">
            <h5 className="fw-bold mb-4">Subscription Details</h5>
            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Newspaper:</span>
                <span className="fw-bold">Daily Times</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Frequency:</span>
                <span className="fw-bold">Daily + Sunday</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Price:</span>
                <span className="fw-bold">$15.00 / month</span>
              </div>
            </div>
            <button className="btn btn-outline-light btn-sm w-100">Update Subscription</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BillingPortal;
