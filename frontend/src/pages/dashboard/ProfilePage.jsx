import React, { useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { formatRole, normalizeRole } from '../../utils/roles';
import { bloodGroups, organs } from '../../utils/constants';

function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const role = normalizeRole(user?.role);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bloodGroup: user?.bloodGroup || '',
    organ: user?.organ || '',
    requiredOrgan: user?.requiredOrgan || '',
    urgency: user?.urgency || 'Medium',
    hospitalName: user?.hospitalName || '',
    licenseId: user?.licenseId || '',
  }));

  const roleFields = useMemo(() => {
    if (role === 'donor') {
      return [
        { name: 'phone', label: 'Phone' },
        { name: 'city', label: 'City' },
        { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: bloodGroups },
        { name: 'organ', label: 'Organ Available For Donation', type: 'select', options: organs },
      ];
    }

    if (role === 'recipient') {
      return [
        { name: 'phone', label: 'Phone' },
        { name: 'city', label: 'City' },
        { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: bloodGroups },
        { name: 'requiredOrgan', label: 'Required Organ', type: 'select', options: organs },
        { name: 'urgency', label: 'Urgency Level', type: 'select', options: ['Critical', 'High', 'Medium'] },
      ];
    }

    if (role === 'hospital') {
      return [
        { name: 'hospitalName', label: 'Hospital Name' },
        { name: 'licenseId', label: 'Registration / License ID' },
        { name: 'phone', label: 'Contact Number' },
        { name: 'city', label: 'City' },
      ];
    }

    return [
      { name: 'phone', label: 'Contact Number' },
      { name: 'city', label: 'City' },
    ];
  }, [role]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await updateUserProfile(formData);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Unable to save profile details.');
    }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage only your own account, contact, and role-specific details." />
      <div className="card border-0 shadow-sm profile-card">
        <form className="card-body p-4" onSubmit={handleSubmit}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="avatar avatar-lg">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
            <div>
              <h2 className="h4 fw-bold mb-1">{user?.name || 'Admin User'}</h2>
              <p className="text-secondary mb-0">{formatRole(user?.role)}</p>
            </div>
          </div>
          {saved && <div className="alert alert-success">Profile details saved.</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={formData.email || 'admin@example.com'} readOnly />
            </div>
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <input className="form-control" value={formatRole(user?.role)} readOnly />
            </div>
            {roleFields.map((field) => (
              <div className="col-md-6" key={field.name}>
                <label className="form-label">{field.label}</label>
                {field.type === 'select' ? (
                  <select className="form-select" name={field.name} value={formData[field.name]} onChange={handleChange}>
                    <option value="">Select {field.label}</option>
                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <input className="form-control" name={field.name} value={formData[field.name]} onChange={handleChange} />
                )}
              </div>
            ))}
            <div className="col-12">
              <button className="btn btn-primary" type="submit"><i className="bi bi-save me-2"></i>Save My Details</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default ProfilePage;
