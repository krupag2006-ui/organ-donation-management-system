import React from 'react';

function RecordModal({ id, title, fields, formData, onChange, onSubmit, submitLabel = 'Save', children }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby={`${id}Label`} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content border-0 shadow" onSubmit={onSubmit}>
          <div className="modal-header">
            <h2 className="modal-title fs-5 fw-bold" id={`${id}Label`}>{title}</h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              {fields.map((field) => (
                <div className={field.className || 'col-12'} key={field.name}>
                  <label className="form-label">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className="form-select"
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={onChange}
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => {
                        const value = typeof option === 'string' ? option : option.value;
                        const label = typeof option === 'string' ? option : option.label;
                        return <option key={value} value={value}>{label}</option>;
                      })}
                    </select>
                  ) : (
                    <input
                      className="form-control"
                      type={field.type || 'text'}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={onChange}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              {children}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" className="btn btn-primary">{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordModal;
