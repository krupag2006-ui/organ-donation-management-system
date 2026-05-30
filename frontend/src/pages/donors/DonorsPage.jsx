import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import RecordModal from '../../components/forms/RecordModal';
import DataTable from '../../components/tables/DataTable';
import { useAuth } from '../../context/AuthContext';
import { donorAPI } from '../../services/api';
import { bloodGroups } from '../../utils/constants';
import { canPerform } from '../../utils/roles';

const donorOrgans = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];
const emptyDonor = {
  name: '',
  age: '',
  gender: '',
  bloodGroup: '',
  organ: '',
  location: '',
  phone: '',
  email: '',
  diabetes: 'No',
  hypertension: 'No',
  heartDisease: 'No',
  medicalOther: '',
  availability: 'Available',
  status: 'Pending',
};

function formatMedicalHistory(history = {}) {
  const conditions = [];
  if (history.diabetes) conditions.push('Diabetes');
  if (history.hypertension) conditions.push('Hypertension');
  if (history.heartDisease) conditions.push('Heart disease');
  if (history.other) conditions.push(history.other);
  return conditions.length ? conditions.join(', ') : 'None reported';
}

function normalizeDonor(donor) {
  return {
    id: donor._id || donor.id,
    name: donor.name,
    age: donor.age || '',
    gender: donor.gender || '',
    bloodGroup: donor.bloodGroup,
    organ: donor.organs?.[0] || donor.organ || '',
    location: donor.location,
    phone: donor.phone || '',
    email: donor.email || '',
    diabetes: donor.medicalHistory?.diabetes ? 'Yes' : 'No',
    hypertension: donor.medicalHistory?.hypertension ? 'Yes' : 'No',
    heartDisease: donor.medicalHistory?.heartDisease ? 'Yes' : 'No',
    medicalOther: donor.medicalHistory?.other || '',
    medicalHistorySummary: formatMedicalHistory(donor.medicalHistory),
    availability: donor.availability === false ? 'Unavailable' : donor.availability || 'Available',
    status: donor.status || 'Pending',
  };
}

function toDonorPayload(formData) {
  return {
    name: formData.name,
    age: Number(formData.age),
    gender: formData.gender,
    bloodGroup: formData.bloodGroup,
    organs: [formData.organ],
    location: formData.location,
    phone: formData.phone,
    email: formData.email,
    medicalHistory: {
      diabetes: formData.diabetes === 'Yes',
      hypertension: formData.hypertension === 'Yes',
      heartDisease: formData.heartDisease === 'Yes',
      other: formData.medicalOther || '',
    },
    availability: formData.availability === 'Available',
    status: formData.status,
  };
}

function DonorsPage() {
  const { user } = useAuth();
  const canManage = canPerform(user?.role, 'manageDonors');
  const canDelete = canPerform(user?.role, 'deleteDonors');
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(emptyDonor);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDonors = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await donorAPI.list();
        setRecords((data.data || []).map(normalizeDonor));
      } catch (err) {
        setError(err.message || 'Unable to load donors from MongoDB.');
      } finally {
        setLoading(false);
      }
    };

    loadDonors();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((donor) => {
      const matchesSearch = donor.name.toLowerCase().includes(search.toLowerCase()) || donor.location.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = bloodGroup ? donor.bloodGroup === bloodGroup : true;
      return matchesSearch && matchesGroup;
    });
  }, [records, search, bloodGroup]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyDonor);
  };

  const openEdit = (donor) => {
    setEditingId(donor.id);
    setFormData(donor);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = toDonorPayload(formData);
      if (editingId) {
        const { data } = await donorAPI.update(editingId, payload);
        setRecords((current) => current.map((item) => (item.id === editingId ? normalizeDonor(data.data) : item)));
      } else {
        const { data } = await donorAPI.create(payload);
        setRecords((current) => [normalizeDonor(data.data), ...current]);
      }
    } catch (err) {
      setError(err.message || 'Unable to save donor. Please check all required fields.');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await donorAPI.remove(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete donor.');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'organ', label: 'Organ' },
    { key: 'location', label: 'Location' },
    { key: 'medicalHistorySummary', label: 'Medical History' },
    { key: 'availability', label: 'Availability', render: (row) => <StatusBadge status={row.availability} /> },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'age', label: 'Age', type: 'number', required: true, className: 'col-md-6' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true, className: 'col-md-6' },
    { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: bloodGroups, required: true, className: 'col-md-6' },
    { name: 'organ', label: 'Organ', type: 'select', options: donorOrgans, required: true, className: 'col-md-6' },
    { name: 'location', label: 'Location', required: true },
    { name: 'phone', label: 'Phone', required: true, className: 'col-md-6' },
    { name: 'email', label: 'Email', type: 'email', className: 'col-md-6' },
    { name: 'diabetes', label: 'Diabetes', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-4' },
    { name: 'hypertension', label: 'Hypertension', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-4' },
    { name: 'heartDisease', label: 'Heart Disease', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-4' },
    { name: 'medicalOther', label: 'Other Medical Notes' },
    { name: 'availability', label: 'Availability', type: 'select', options: ['Available', 'Unavailable'], required: true, className: 'col-md-6' },
    { name: 'status', label: 'Verification Status', type: 'select', options: ['Pending', 'Verified', 'Rejected'], required: true, className: 'col-md-6' },
  ];

  return (
    <>
      <PageHeader
        title="Donor Management"
        subtitle={canDelete ? 'Search, filter, add, edit, and manage registered organ donors.' : 'Search, filter, add, and update donor records assigned to your hospital.'}
        action={canManage && <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#donorModal" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>Add Donor</button>}
      />
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-warning">{error}</div>}
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <input className="form-control" placeholder="Search donor by name or location" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="col-md-4">
              <select className="form-select" value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}>
                <option value="">All blood groups</option>
                {bloodGroups.map((group) => <option key={group}>{group}</option>)}
              </select>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredRecords}
            actions={canManage ? (row) => (
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#donorModal" onClick={() => openEdit(row)}><i className="bi bi-pencil"></i></button>
                {canDelete && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>}
              </div>
            ) : null}
          />
          {loading && <p className="text-secondary small mt-3 mb-0">Loading donors from MongoDB...</p>}
        </div>
      </div>
      {canManage && <RecordModal id="donorModal" title={editingId ? 'Edit Donor' : 'Add Donor'} fields={fields} formData={formData} onChange={handleChange} onSubmit={handleSubmit} submitLabel={editingId ? 'Update Donor' : 'Add Donor'} />}
    </>
  );
}

export default DonorsPage;
