import React, { useEffect, useMemo, useState } from 'react';
import MatchingDonorCard from '../../components/dashboard/MatchingDonorCard';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { donorAPI, recipientAPI } from '../../services/api';
import { bloodGroups } from '../../utils/constants';
import { normalizeRole } from '../../utils/roles';

const organOptions = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];

function normalizeDonor(donor) {
  return {
    id: donor._id,
    name: donor.name,
    bloodGroup: donor.bloodGroup,
    organ: donor.organs?.[0] || '',
    organs: donor.organs || [],
    location: donor.location,
    availability: donor.availability ? 'Available' : 'Unavailable',
  };
}

function normalizeRecipient(recipient) {
  return {
    id: recipient._id,
    name: recipient.name,
    requiredOrgan: recipient.organNeeded,
    bloodGroup: recipient.bloodGroup,
    urgency: recipient.urgencyLevel,
  };
}

function MatchingSystemPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const [donors, setDonors] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [filters, setFilters] = useState({
    recipient: '',
    organ: user?.requiredOrgan || '',
    bloodGroup: user?.bloodGroup || '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setError('');
      try {
        const donorsResponse = await donorAPI.list();
        setDonors((donorsResponse.data.data || []).map(normalizeDonor));

        if (['admin', 'hospital'].includes(role)) {
          const recipientsResponse = await recipientAPI.list();
          const liveRecipients = (recipientsResponse.data.data || []).map(normalizeRecipient);
          setRecipients(liveRecipients);
          if (liveRecipients.length) {
            setFilters((current) => ({
              ...current,
              recipient: liveRecipients[0].id,
              organ: current.organ || liveRecipients[0].requiredOrgan,
              bloodGroup: current.bloodGroup || liveRecipients[0].bloodGroup,
            }));
          }
        }
      } catch (err) {
        setError(err.message || 'Unable to load matching data from MongoDB.');
      }
    };

    loadData();
  }, [role]);

  const selectedRecipient = recipients.find((recipient) => recipient.id === filters.recipient);

  const matchingDonors = useMemo(() => {
    const targetOrgan = filters.organ || selectedRecipient?.requiredOrgan || user?.requiredOrgan;
    const targetBloodGroup = filters.bloodGroup || selectedRecipient?.bloodGroup || user?.bloodGroup;

    return donors
      .map((donor) => {
        let score = 30;
        if (donor.organs.includes(targetOrgan)) score += 40;
        if (donor.bloodGroup === targetBloodGroup) score += 25;
        if (donor.availability === 'Available') score += 5;
        return { donor, score: Math.min(score, 100) };
      })
      .filter(({ score }) => score >= 60)
      .sort((a, b) => b.score - a.score);
  }, [donors, filters, selectedRecipient, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => {
      const next = { ...current, [name]: value };
      if (name === 'recipient') {
        const recipient = recipients.find((item) => item.id === value);
        if (recipient) {
          next.organ = recipient.requiredOrgan;
          next.bloodGroup = recipient.bloodGroup;
        }
      }
      return next;
    });
  };

  return (
    <>
      <PageHeader title="Matching System" subtitle="Compare live recipient needs against available MongoDB donor records." />
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          {error && <div className="alert alert-warning">{error}</div>}
          <div className="row g-3">
            {['admin', 'hospital'].includes(role) && (
              <div className="col-md-4">
                <label className="form-label">Select Recipient</label>
                <select className="form-select" name="recipient" value={filters.recipient} onChange={handleChange}>
                  {recipients.map((recipient) => <option key={recipient.id} value={recipient.id}>{recipient.name}</option>)}
                </select>
              </div>
            )}
            <div className="col-md-4">
              <label className="form-label">Select Organ</label>
              <select className="form-select" name="organ" value={filters.organ} onChange={handleChange}>
                <option value="">Select organ</option>
                {organOptions.map((organ) => <option key={organ}>{organ}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Select Blood Group</label>
              <select className="form-select" name="bloodGroup" value={filters.bloodGroup} onChange={handleChange}>
                <option value="">Select blood group</option>
                {bloodGroups.map((group) => <option key={group}>{group}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-4">
        {matchingDonors.length ? (
          matchingDonors.map(({ donor, score }) => (
            <div className="col-md-6 col-xl-4" key={donor.id}>
              <MatchingDonorCard donor={donor} percentage={score} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <EmptyState icon="bi-diagram-3" title="No matching donors" text="No live donor record matches the selected organ and blood group yet." />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MatchingSystemPage;
