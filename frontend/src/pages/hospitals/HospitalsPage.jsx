import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import RecordModal from '../../components/forms/RecordModal';
import DataTable from '../../components/tables/DataTable';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import { canPerform } from '../../utils/roles';

const hospitalOrgans = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas', 'Cornea'];
const emptyHospital = {
  name: '',
  city: '',
  address: '',
  contact: '',
  email: '',
  availableOrgans: '',
  capacity: '',
  emergencyAvailable: 'No',
};

function normalizeHospital(hospital) {
  return {
    id: hospital._id || hospital.id,
    name: hospital.name,
    city: hospital.city,
    address: hospital.address || '',
    contact: hospital.contact,
    email: hospital.email || '',
    availableOrgans: Array.isArray(hospital.availableOrgans) ? hospital.availableOrgans.join(', ') : hospital.availableOrgans,
    capacity: hospital.capacity ?? '',
    emergencyAvailable: hospital.emergencyAvailable ? 'Yes' : 'No',
  };
}

function toHospitalPayload(formData) {
  return {
    name: formData.name,
    city: formData.city,
    address: formData.address,
    contact: formData.contact,
    email: formData.email,
    availableOrgans: formData.availableOrgans ? [formData.availableOrgans] : [],
    capacity: Number(formData.capacity || 0),
    emergencyAvailable: formData.emergencyAvailable === 'Yes',
  };
}

function HospitalsPage() {
  const { user } = useAuth();
  const canManage = canPerform(user?.role, 'manageHospitals');
  const canDelete = canPerform(user?.role, 'deleteHospitals');
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(emptyHospital);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHospitals = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await hospitalAPI.list();
        setRecords((data.hospitals || []).map(normalizeHospital));
      } catch (err) {
        setError(err.message || 'Unable to load hospitals from MongoDB.');
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, []);

  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyHospital);
  };
  const openEdit = (hospital) => {
    setEditingId(hospital.id);
    setFormData({ ...hospital, availableOrgans: hospital.availableOrgans?.split(', ')[0] || '' });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const payload = toHospitalPayload(formData);
      if (editingId) {
        const { data } = await hospitalAPI.update(editingId, payload);
        setRecords((current) => current.map((item) => (item.id === editingId ? normalizeHospital(data.hospital) : item)));
      } else {
        const { data } = await hospitalAPI.create(payload);
        setRecords((current) => [normalizeHospital(data.hospital), ...current]);
      }
    } catch (err) {
      setError(err.message || 'Unable to save hospital. Please check all required fields.');
    }
  };
  const handleDelete = async (id) => {
    setError('');
    try {
      await hospitalAPI.remove(id);
      setRecords((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || 'Unable to delete hospital.');
    }
  };

  const columns = [
    { key: 'name', label: 'Hospital Name' },
    { key: 'city', label: 'City' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'availableOrgans', label: 'Available Organs' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'emergencyAvailable', label: 'Emergency' },
  ];

  const fields = [
    { name: 'name', label: 'Hospital Name', required: true },
    { name: 'city', label: 'City', required: true, className: 'col-md-6' },
    { name: 'contact', label: 'Contact', required: true, className: 'col-md-6' },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'address', label: 'Address', required: true },
    { name: 'availableOrgans', label: 'Available Organs', type: 'select', options: hospitalOrgans, required: true, className: 'col-md-6' },
    { name: 'capacity', label: 'Capacity', type: 'number', className: 'col-md-6' },
    { name: 'emergencyAvailable', label: 'Emergency Available', type: 'select', options: ['Yes', 'No'], required: true },
  ];

  return (
    <>
      <PageHeader
        title="Hospital Management"
        subtitle="Maintain hospital network details and organ availability across cities."
        action={canManage && <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#hospitalModal" onClick={openCreate}><i className="bi bi-plus-lg me-2"></i>Add Hospital</button>}
      />
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-warning">{error}</div>}
          <DataTable
            columns={columns}
            data={records}
            actions={canManage ? (row) => (
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#hospitalModal" onClick={() => openEdit(row)}><i className="bi bi-pencil"></i></button>
                {canDelete && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>}
              </div>
            ) : null}
          />
          {loading && <p className="text-secondary small mt-3 mb-0">Loading hospitals from MongoDB...</p>}
        </div>
      </div>
      {canManage && <RecordModal id="hospitalModal" title={editingId ? 'Edit Hospital' : 'Add Hospital'} fields={fields} formData={formData} onChange={handleChange} onSubmit={handleSubmit} submitLabel={editingId ? 'Update Hospital' : 'Add Hospital'} />}
    </>
  );
}

export default HospitalsPage;
