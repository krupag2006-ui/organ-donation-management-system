import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import ChartCard from '../../components/dashboard/ChartCard';
import StatCard from '../../components/dashboard/StatCard';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/tables/DataTable';
import { useAuth } from '../../context/AuthContext';
import { donorAPI, hospitalAPI, recipientAPI, transplantRequestAPI } from '../../services/api';
import { roleHomeCopy, normalizeRole } from '../../utils/roles';

const pieColors = ['#0d6efd', '#dc3545', '#20c997', '#ffc107', '#6f42c1', '#6c757d'];

function DashboardHome() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role) || 'donor';
  const copy = roleHomeCopy[role] || roleHomeCopy.donor;
  const [dashboardData, setDashboardData] = useState({
    donors: [],
    recipients: [],
    hospitals: [],
    requests: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setError('');
      try {
        const requestsResponse = await transplantRequestAPI.list();
        let donors = [];
        let recipients = [];
        let hospitals = [];

        if (['admin', 'hospital', 'recipient'].includes(role)) {
          const donorsResponse = await donorAPI.list();
          donors = donorsResponse.data.data || [];
        }
        if (['admin', 'hospital'].includes(role)) {
          const recipientsResponse = await recipientAPI.list();
          recipients = recipientsResponse.data.data || [];
        }
        if (['admin', 'hospital', 'recipient'].includes(role)) {
          const hospitalsResponse = await hospitalAPI.list();
          hospitals = hospitalsResponse.data.hospitals || [];
        }

        setDashboardData({
          requests: requestsResponse.data.data || [],
          donors,
          recipients,
          hospitals,
        });
      } catch (err) {
        setError(err.message || 'Unable to load dashboard metrics from MongoDB.');
      }
    };

    loadDashboardData();
  }, [role]);

  const metrics = useMemo(() => {
    const availableOrgans = dashboardData.donors.reduce((total, donor) => {
      return donor.availability ? total + (donor.organs?.length || 0) : total;
    }, 0);
    const successfulMatches = dashboardData.requests.filter((request) => request.status === 'Completed').length;
    const criticalRecipients = dashboardData.recipients.filter((recipient) => recipient.urgencyLevel === 'Critical').length;
    const activeRequests = dashboardData.requests.filter((request) => !['Completed', 'Cancelled', 'Rejected'].includes(request.status)).length;

    return {
      totalDonors: dashboardData.donors.length,
      totalRecipients: dashboardData.recipients.length,
      availableOrgans,
      successfulMatches,
      activeRequests,
      criticalRecipients,
      hospitalNetwork: dashboardData.hospitals.length,
      verifiedDonors: dashboardData.donors.filter((donor) => donor.status === 'Verified').length,
      potentialMatches: dashboardData.requests.filter((request) => ['Pending', 'Approved'].includes(request.status)).length,
    };
  }, [dashboardData]);

  const liveOrganDemandData = useMemo(() => {
    const counts = {};
    dashboardData.recipients.forEach((recipient) => {
      const organ = recipient.organNeeded || 'Unknown';
      counts[organ] = (counts[organ] || 0) + 1;
    });
    const data = Object.entries(counts).map(([organ, demand]) => ({ organ, demand }));
    return data;
  }, [dashboardData.recipients]);

  const liveBloodGroupData = useMemo(() => {
    const counts = {};
    [...dashboardData.donors, ...dashboardData.recipients].forEach((record) => {
      const group = record.bloodGroup || 'Unknown';
      counts[group] = (counts[group] || 0) + 1;
    });
    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return data;
  }, [dashboardData.donors, dashboardData.recipients]);

  const liveMonthlyTransplantsData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = {};
    dashboardData.requests
      .filter((request) => request.status === 'Completed')
      .forEach((request) => {
        const date = new Date(request.updatedAt || request.createdAt || request.requestDate);
        const month = monthNames[date.getMonth()];
        counts[month] = (counts[month] || 0) + 1;
      });
    return monthNames.map((month) => ({ month, transplants: counts[month] || 0 }));
  }, [dashboardData.requests]);

  const liveRecentActivity = useMemo(() => {
    const data = dashboardData.requests.slice(0, 5).map((request) => ({
      id: request._id,
      recipient: request.recipient?.name || 'Recipient',
      organ: request.organ,
      status: request.status,
      date: new Date(request.updatedAt || request.createdAt || request.requestDate).toISOString().slice(0, 10),
    }));
    return data;
  }, [dashboardData.requests]);

  const columns = [
    { key: 'recipient', label: 'Recipient' },
    { key: 'organ', label: 'Organ' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'date', label: 'Date' },
  ];

  const requestColumns = [
    { key: 'recipient', label: 'Recipient' },
    { key: 'organ', label: 'Organ' },
    { key: 'hospital', label: 'Hospital' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  if (role === 'donor') {
    return (
      <>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4"><StatCard title="Donation Status" value={user?.organ ? 'Profile Ready' : 'Profile Pending'} icon="bi-heart-pulse" accent="success" /></div>
          <div className="col-12 col-md-4"><StatCard title="Listed Organ" value={user?.organ || 'Not set'} icon="bi-prescription2" /></div>
          <div className="col-12 col-md-4"><StatCard title="My Requests" value={dashboardData.requests.length} icon="bi-clipboard2-pulse" accent="danger" /></div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5 fw-bold mb-3">My Donation Updates</h2>
            <DataTable columns={columns} data={liveRecentActivity} />
          </div>
        </div>
      </>
    );
  }

  if (role === 'recipient') {
    return (
      <>
        <PageHeader
          title={copy.title}
          subtitle={copy.subtitle}
          action={<Link className="btn btn-primary" to="/matching"><i className="bi bi-diagram-3 me-2"></i>Find Matches</Link>}
        />
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4"><StatCard title="Required Organ" value={user?.requiredOrgan || 'Not set'} icon="bi-prescription2" /></div>
          <div className="col-12 col-md-4"><StatCard title="Urgency Level" value={user?.urgency || 'Not set'} icon="bi-exclamation-triangle" accent="danger" /></div>
        <div className="col-12 col-md-4"><StatCard title="Potential Matches" value={metrics.potentialMatches} icon="bi-check2-circle" accent="success" /></div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5 fw-bold mb-3">My Request Timeline</h2>
            <DataTable columns={columns} data={liveRecentActivity} />
          </div>
        </div>
      </>
    );
  }

  if (role === 'hospital') {
    return (
      <>
        <PageHeader title={copy.title} subtitle={copy.subtitle} />
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Active Requests" value={metrics.activeRequests} icon="bi-clipboard2-pulse" /></div>
          <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Available Donors" value={dashboardData.donors.filter((donor) => donor.availability).length} icon="bi-heart-pulse" accent="success" /></div>
          <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Critical Recipients" value={metrics.criticalRecipients} icon="bi-person-vcard" accent="danger" /></div>
          <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Matches This Month" value={metrics.successfulMatches} icon="bi-check2-circle" accent="info" /></div>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-12 col-xl-6">
            <ChartCard title="Organ Demand">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveOrganDemandData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="organ" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="demand" fill="#0d6efd" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="col-12 col-xl-6">
            <ChartCard title="Monthly Transplants">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liveMonthlyTransplantsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="transplants" stroke="#dc3545" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5 fw-bold mb-3">Hospital Request Queue</h2>
            <DataTable columns={requestColumns} data={dashboardData.requests.map((request) => ({
              id: request._id,
              recipient: request.recipient?.name || 'Recipient',
              organ: request.organ,
              hospital: request.hospital?.name || 'Hospital',
              status: request.status,
            }))} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Total Donors" value={metrics.totalDonors} icon="bi-heart-pulse" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Total Recipients" value={metrics.totalRecipients} icon="bi-person-vcard" accent="danger" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Available Organs" value={metrics.availableOrgans} icon="bi-prescription2" accent="success" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Successful Matches" value={metrics.successfulMatches} icon="bi-check2-circle" accent="info" /></div>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-4">
          <ChartCard title="Organ Demand">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liveOrganDemandData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="organ" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="demand" fill="#0d6efd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-12 col-xl-4">
          <ChartCard title="Blood Group Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={liveBloodGroupData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {liveBloodGroupData.map((entry, index) => <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-12 col-xl-4">
          <ChartCard title="Monthly Transplants">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveMonthlyTransplantsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="transplants" stroke="#dc3545" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h5 fw-bold mb-3">Recent Transplant Activity</h2>
          <DataTable columns={columns} data={liveRecentActivity} />
        </div>
      </div>
    </>
  );
}

export default DashboardHome;
