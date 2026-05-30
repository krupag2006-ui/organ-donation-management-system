import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import RecordModal from '../../components/forms/RecordModal';
import DataTable from '../../components/tables/DataTable';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI, recipientAPI } from '../../services/api';
import { bloodGroups } from '../../utils/constants';
import { canPerform } from '../../utils/roles';

const recipientOrgans = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];
const emptyRecipient = {
  name: '',
  age: '',
  gender: '',
  requiredOrgan: '',
  bloodGroup: '',
  urgency: 'Medium',
  location: '',
  phone: '',
  email: '',
  hospital: '',
  diagnosis: '',
  diabetes: 'No',
  hypertension: 'No',
  heartDisease: 'No',
  kidneyDisease: 'No',
  liverDisease: 'No',
  medicalOther: '',
  status: 'Waiting',
};

function formatMedicalHistory(history = {}) {
  const conditions = [];
  if (history.diabetes) conditions.push('Diabetes');
  if (history.hypertension) conditions.push('Hypertension');
  if (history.heartDisease) conditions.push('Heart disease');
  if (history.kidneyDisease) conditions.push('Kidney disease');
  if (history.liverDisease) conditions.push('Liver disease');
  if (history.other) conditions.push(history.other);
  return conditions.length ? conditions.join(', ') : 'None reported';
}

function normalizeRecipient(recipient) {
  return {
    id: recipient._id || recipient.id,
    name: recipient.name,
    age: recipient.age || '',
    gender: recipient.gender || '',
    requiredOrgan: recipient.organNeeded || recipient.requiredOrgan || '',
    bloodGroup: recipient.bloodGroup,
    urgency: recipient.urgencyLevel || recipient.urgency || 'Medium',
    location: recipient.location || '',
    phone: recipient.phone || '',
    email: recipient.email || '',
    hospitalId: recipient.hospital?._id || recipient.hospital || '',
    hospital: recipient.hospital?.name || recipient.hospital || '',
    diagnosis: recipient.diagnosis || '',
    diabetes: recipient.medicalHistory?.diabetes ? 'Yes' : 'No',
    hypertension: recipient.medicalHistory?.hypertension ? 'Yes' : 'No',
    heartDisease: recipient.medicalHistory?.heartDisease ? 'Yes' : 'No',
    kidneyDisease: recipient.medicalHistory?.kidneyDisease ? 'Yes' : 'No',
    liverDisease: recipient.medicalHistory?.liverDisease ? 'Yes' : 'No',
    medicalOther: recipient.medicalHistory?.other || '',
    medicalHistorySummary: formatMedicalHistory(recipient.medicalHistory),
    status: recipient.status || 'Waiting',
  };
}

function normalizeHospital(hospital) {
  return {
    id: hospital._id || hospital.id,
    name: hospital.name,
    city: hospital.city || '',
  };
}

function toRecipientPayload(formData) {
  return {
    name: formData.name,
    age: Number(formData.age),
    gender: formData.gender,
    bloodGroup: formData.bloodGroup,
    organNeeded: formData.requiredOrgan,
    urgencyLevel: formData.urgency,
    location: formData.location,
    phone: formData.phone,
    email: formData.email,
    hospital: formData.hospital || undefined,
    diagnosis: formData.diagnosis,
    medicalHistory: {
      diabetes: formData.diabetes === 'Yes',
      hypertension: formData.hypertension === 'Yes',
      heartDisease: formData.heartDisease === 'Yes',
      kidneyDisease: formData.kidneyDisease === 'Yes',
      liverDisease: formData.liverDisease === 'Yes',
      other: formData.medicalOther || '',
    },
    status: formData.status,
  };
}

function RecipientsPage() {
  const { user } = useAuth();
  const canManage = canPerform(user?.role, 'manageRecipients');
  const canDelete = canPerform(user?.role, 'deleteRecipients');
  const [records, setRecords] = useState([]);
  const [hospitalOptions, setHospitalOptions] = useState([]);
  const [formData, setFormData] = useState(emptyRecipient);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const [recipientsResponse, hospitalsResponse] = await Promise.all([
          recipientAPI.list(),
          hospitalAPI.list(),
        ]);
        setRecords((recipientsResponse.data.data || []).map(normalizeRecipient));
        setHospitalOptions((hospitalsResponse.data.hospitals || []).map(normalizeHospital));
      } catch (err) {
        setError(err.message || 'Unable to load recipients from MongoDB.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cityOptions = [...new Set(hospitalOptions.map((hospital) => hospital.city).filter(Boolean))].sort();
  const filteredHospitalOptions = formData.location
    ? hospitalOptions.filter((hospital) => hospital.city === formData.location)
    : hospitalOptions;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      if (name !== 'location') {
        return { ...current, [name]: value };
      }

      const selectedHospital = hospitalOptions.find((hospital) => hospital.id === current.hospital);
      const hospitalStillMatchesCity = selectedHospital?.city === value;

      return {
        ...current,
        location: value,
        hospital: hospitalStillMatchesCity ? current.hospital : '',
      };
    });
  };
  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyRecipient);
  };
  const openEdit = (recipient) => {
    setEditingId(recipient.id);
    setFormData({ ...recipient, hospital: recipient.hospitalId });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = toRecipientPayload(formData);
      if (editingId) {
        const { data } = await recipientAPI.update(editingId, payload);
        setRecords((current) => current.map((item) => (item.id === editingId ? normalizeRecipient(data.data) : item)));
      } else {
        const { data } = await recipientAPI.create(payload);
        setRecords((current) => [normalizeRecipient(data.data), ...current]);
      }
    } catch (err) {
      setError(err.message || 'Unable to save recipient. Please check all required fields.');
    }
  };
  const handleDelete = async (id) => {
    setError('');
    try {
      await recipientAPI.remove(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete recipient.');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'requiredOrgan', label: 'Required Organ' },
    { key: 'bloodGroup', label: 'Blood Group' },
    { key: 'urgency', label: 'Urgency Level', render: (row) => <StatusBadge status={row.urgency} /> },
    { key: 'hospital', label: 'Hospital' },
    { key: 'medicalHistorySummary', label: 'Medical History' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  const fields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'age', label: 'Age', type: 'number', required: true, className: 'col-md-6' },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true, className: 'col-md-6' },
    { name: 'requiredOrgan', label: 'Required Organ', type: 'select', options: recipientOrgans, required: true, className: 'col-md-6' },
    { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: bloodGroups, required: true, className: 'col-md-6' },
    { name: 'urgency', label: 'Urgency Level', type: 'select', options: ['Critical', 'High', 'Medium'], required: true },
    { name: 'location', label: 'City', type: 'select', options: cityOptions, required: true },
    { name: 'phone', label: 'Phone', required: true, className: 'col-md-6' },
    { name: 'email', label: 'Email', type: 'email', className: 'col-md-6' },
    { name: 'hospital', label: 'Hospital', type: 'select', options: filteredHospitalOptions.map((hospital) => ({ value: hospital.id, label: hospital.name })), required: true },
    { name: 'diagnosis', label: 'Diagnosis', required: true },
    { name: 'diabetes', label: 'Diabetes', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-4' },
    { name: 'hypertension', label: 'Hypertension', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-4' },
    { name: 'heartDisease', label: 'Heart Disease', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-4' },
    { name: 'kidneyDisease', label: 'Kidney Disease', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-6' },
    { name: 'liverDisease', label: 'Liver Disease', type: 'select', options: ['No', 'Yes'], required: true, className: 'col-md-6' },
    { name: 'medicalOther', label: 'Other Medical Notes' },
    { name: 'status', label: 'Status', type: 'select', options: ['Waiting', 'Matched', 'Transplanted', 'Inactive'], required: true },
  ];

  return (
    <>
      <PageHeader
        title="Recipient Management"
        subtitle={canDelete ? 'Track recipient needs, urgency levels, blood groups, and hospital assignment.' : 'Add and update recipient records coordinated by your hospital.'}
        action={canManage && <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#recipientModal" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>Add Recipient</button>}
      />
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-warning">{error}</div>}
          <DataTable
            columns={columns}
            data={records}
            actions={canManage ? (row) => (
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#recipientModal" onClick={() => openEdit(row)}><i className="bi bi-pencil"></i></button>
                {canDelete && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>}
              </div>
            ) : null}
          />
          {loading && <p className="text-secondary small mt-3 mb-0">Loading recipients from MongoDB...</p>}
        </div>
      </div>
      {canManage && <RecordModal id="recipientModal" title={editingId ? 'Edit Recipient' : 'Add Recipient'} fields={fields} formData={formData} onChange={handleChange} onSubmit={handleSubmit} submitLabel={editingId ? 'Update Recipient' : 'Add Recipient'} />}
    </>
  );
}

export default RecipientsPage;
