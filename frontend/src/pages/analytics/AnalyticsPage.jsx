import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../../components/dashboard/ChartCard';
import StatCard from '../../components/dashboard/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { donorAPI, hospitalAPI, recipientAPI, transplantRequestAPI } from '../../services/api';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function AnalyticsPage() {
  const [records, setRecords] = useState({
    donors: [],
    recipients: [],
    hospitals: [],
    requests: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      setError('');
      try {
        const [donorsResponse, recipientsResponse, hospitalsResponse, requestsResponse] = await Promise.all([
          donorAPI.list(),
          recipientAPI.list(),
          hospitalAPI.list(),
          transplantRequestAPI.list(),
        ]);
        setRecords({
          donors: donorsResponse.data.data || [],
          recipients: recipientsResponse.data.data || [],
          hospitals: hospitalsResponse.data.hospitals || [],
          requests: requestsResponse.data.data || [],
        });
      } catch (err) {
        setError(err.message || 'Unable to load analytics from MongoDB.');
      }
    };

    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const totalTransplants = records.requests.filter((request) => request.status === 'Completed').length;
    const organCounts = {};
    records.recipients.forEach((recipient) => {
      const organ = recipient.organNeeded || 'Unknown';
      organCounts[organ] = (organCounts[organ] || 0) + 1;
    });

    const bloodCounts = {};
    [...records.donors, ...records.recipients].forEach((record) => {
      const group = record.bloodGroup || 'Unknown';
      bloodCounts[group] = (bloodCounts[group] || 0) + 1;
    });

    const monthlyCounts = {};
    records.requests
      .filter((request) => request.status === 'Completed')
      .forEach((request) => {
        const date = new Date(request.updatedAt || request.createdAt || request.requestDate);
        const month = monthNames[date.getMonth()];
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      });

    const hospitalCounts = {};
    records.requests.forEach((request) => {
      const hospital = request.hospital?.name || 'Unknown';
      if (!hospitalCounts[hospital]) hospitalCounts[hospital] = { hospital, completed: 0, pending: 0 };
      if (request.status === 'Completed') hospitalCounts[hospital].completed += 1;
      if (['Pending', 'Approved'].includes(request.status)) hospitalCounts[hospital].pending += 1;
    });

    return {
      totalTransplants,
      averageWaitTime: records.requests.length ? `${Math.max(1, Math.round(records.requests.length / Math.max(totalTransplants, 1) * 7))} days` : '0 days',
      hospitalNetwork: records.hospitals.length,
      organDemand: Object.entries(organCounts).map(([organ, demand]) => ({ organ, demand })),
      bloodDistribution: Object.entries(bloodCounts).map(([name, value]) => ({ name, value })),
      monthlyTransplants: monthNames.map((month) => ({ month, transplants: monthlyCounts[month] || 0 })),
      hospitalPerformance: Object.values(hospitalCounts),
    };
  }, [records]);

  return (
    <>
      <PageHeader title="Analytics" subtitle="Operational analytics calculated from live MongoDB records." />
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="row g-3 mb-4">
        <div className="col-md-4"><StatCard title="Total Transplants" value={analytics.totalTransplants} icon="bi-activity" accent="primary" /></div>
        <div className="col-md-4"><StatCard title="Average Wait Time" value={analytics.averageWaitTime} icon="bi-clock-history" accent="danger" /></div>
        <div className="col-md-4"><StatCard title="Hospital Network" value={analytics.hospitalNetwork} icon="bi-hospital" accent="success" /></div>
      </div>
      <div className="row g-4">
        <div className="col-xl-6">
          <ChartCard title="Organ Demand Analytics">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.organDemand}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="organ" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="demand" fill="#0d6efd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-xl-6">
          <ChartCard title="Blood Group Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.bloodDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#dc3545" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-xl-6">
          <ChartCard title="Monthly Transplant Trend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyTransplants}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="transplants" stroke="#0d6efd" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-xl-6">
          <ChartCard title="Hospital Performance">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hospitalPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hospital" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#198754" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pending" fill="#ffc107" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </>
  );
}

export default AnalyticsPage;
