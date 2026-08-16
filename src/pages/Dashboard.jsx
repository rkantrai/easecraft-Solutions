import React from "react";
import {
  BriefcaseBusiness,
  UsersRound,
  Receipt,
  ClipboardList,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Summary Cards */}
      <div className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Projects</span>

            <div className="stat-icon">
              <BriefcaseBusiness size={18} />
            </div>
          </div>

          <div className="stat-value">0</div>
          <div className="stat-note">All projects</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active Projects</span>

            <div className="stat-icon">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="stat-value">0</div>
          <div className="stat-note">Currently running</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Manpower</span>

            <div className="stat-icon">
              <UsersRound size={18} />
            </div>
          </div>

          <div className="stat-value">0</div>
          <div className="stat-note">Workers in database</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Expenses</span>

            <div className="stat-icon">
              <Receipt size={18} />
            </div>
          </div>

          <div className="stat-value">₹0</div>
          <div className="stat-note">All recorded expenses</div>
        </div>

      </div>


      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">

        {/* Active Projects */}
        <section className="dashboard-card">

          <div className="dashboard-card-header">
            <div>
              <h2>Active Projects</h2>
              <p>Overview of currently running projects</p>
            </div>

            <button className="dashboard-link">
              View All
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="empty-dashboard-state">
            <div className="empty-dashboard-icon">
              <BriefcaseBusiness size={21} />
            </div>

            <strong>No active projects</strong>

            <span>
              Create a project to start tracking manpower,
              work and expenses.
            </span>
          </div>

        </section>


        {/* Recent Work */}
        <section className="dashboard-card">

          <div className="dashboard-card-header">
            <div>
              <h2>Recent Work Done</h2>
              <p>Latest recorded work</p>
            </div>

            <button className="dashboard-link">
              View All
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="empty-dashboard-state">
            <div className="empty-dashboard-icon">
              <ClipboardList size={21} />
            </div>

            <strong>No work recorded</strong>

            <span>
              Completed work will appear here.
            </span>
          </div>

        </section>

      </div>


      {/* Bottom Section */}
      <section className="dashboard-card dashboard-full-card">

        <div className="dashboard-card-header">
          <div>
            <h2>Recent Expenses</h2>
            <p>Latest project expenses</p>
          </div>

          <button className="dashboard-link">
            View All
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="empty-dashboard-state">
          <div className="empty-dashboard-icon">
            <Receipt size={21} />
          </div>

          <strong>No expenses recorded</strong>

          <span>
            Project expenses will appear here once added.
          </span>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;