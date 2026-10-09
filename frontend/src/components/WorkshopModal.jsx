import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { workshopsApi } from '../api/services';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import CalendarModal from './CalendarModal';

export default function WorkshopModal({ workshop, isOpen, onClose, onSuccess }) {
  const isEditing = !!workshop;
  const toast = useToast();
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [calendarField, setCalendarField] = useState(null); // 'startDateTime' | 'endDateTime' | null

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    instructor: '',
    location: 'Centre A',
    startDateTime: '',
    endDateTime: '',
    capacity: 10,
    status: 'Scheduled',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Format Date for datetime-local input
  const formatDateTimeForInput = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (workshop) {
      setFormData({
        code: workshop.code || '',
        title: workshop.title || '',
        instructor: workshop.instructor || '',
        location: workshop.location || 'Centre A',
        startDateTime: formatDateTimeForInput(workshop.startDateTime),
        endDateTime: formatDateTimeForInput(workshop.endDateTime),
        capacity: workshop.capacity || 10,
        status: workshop.status || 'Scheduled',
      });
    } else {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const start = new Date(nextWeek.setHours(10, 0, 0, 0));
      const end = new Date(nextWeek.setHours(13, 0, 0, 0));

      setFormData({
        code: '',
        title: '',
        instructor: '',
        location: 'Centre A',
        startDateTime: formatDateTimeForInput(start.toISOString()),
        endDateTime: formatDateTimeForInput(end.toISOString()),
        capacity: 12,
        status: 'Scheduled',
      });
    }
    setError('');
  }, [workshop, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || '' : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      setError('End date & time must be after the start time.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please provide a workshop title.');
      return;
    }

    if (!isEditing && !formData.code.trim()) {
      setError('Please provide a workshop code.');
      return;
    }

    setShowSaveConfirm(true);
  };

  const executeSave = async () => {
    try {
      setSubmitting(true);
      setShowSaveConfirm(false);
      if (isEditing) {
        await workshopsApi.update(workshop.id, {
          title: formData.title,
          instructor: formData.instructor,
          location: formData.location,
          startDateTime: new Date(formData.startDateTime).toISOString(),
          endDateTime: new Date(formData.endDateTime).toISOString(),
          capacity: Number(formData.capacity),
          status: formData.status,
        });
        toast.success(`Workshop '${formData.title}' updated successfully!`);
      } else {
        await workshopsApi.create({
          code: formData.code.trim().toUpperCase(),
          title: formData.title,
          instructor: formData.instructor,
          location: formData.location,
          startDateTime: new Date(formData.startDateTime).toISOString(),
          endDateTime: new Date(formData.endDateTime).toISOString(),
          capacity: Number(formData.capacity),
          status: formData.status,
        });
        toast.success(`Workshop '${formData.title}' created successfully!`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save workshop.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={18} color="#2563eb" />
            <span className="modal-title">{isEditing ? 'Edit Workshop' : 'Create New Workshop'}</span>
          </div>
          <button type="button" className="toast-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: '#dc2626',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
              columnGap: '1.25rem', 
              rowGap: '1.15rem' 
            }}>
              {/* Row 1: Workshop Code & Title */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="code">Workshop Code *</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  className="form-input"
                  placeholder="e.g. WS101"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isEditing || submitting}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="title">Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  placeholder="Workshop Title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Row 2: Instructor & Location */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="instructor">Instructor *</label>
                <input
                  id="instructor"
                  name="instructor"
                  type="text"
                  className="form-input"
                  placeholder="Instructor Name"
                  value={formData.instructor}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="location">Location *</label>
                <select
                  id="location"
                  name="location"
                  className="form-select"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="Centre A">Centre A (Main Hall)</option>
                  <option value="Centre B">Centre B (Tech Hub)</option>
                  <option value="Centre C">Centre C (Studio)</option>
                </select>
              </div>

              {/* Row 3: Start Date & End Date */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="startDateTime">Start Date & Time *</label>
                <div 
                  className="filter-input-wrap" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCalendarField('startDateTime')}
                >
                  <Calendar className="filter-input-icon" size={16} />
                  <input
                    id="startDateTime"
                    type="text"
                    readOnly
                    className="filter-input filter-input-with-icon"
                    style={{ cursor: 'pointer', borderRadius: '5px' }}
                    placeholder="Select start date & time..."
                    value={formData.startDateTime ? new Date(formData.startDateTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="endDateTime">End Date & Time *</label>
                <div 
                  className="filter-input-wrap" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setCalendarField('endDateTime')}
                >
                  <Calendar className="filter-input-icon" size={16} />
                  <input
                    id="endDateTime"
                    type="text"
                    readOnly
                    className="filter-input filter-input-with-icon"
                    style={{ cursor: 'pointer', borderRadius: '5px' }}
                    placeholder="Select end date & time..."
                    value={formData.endDateTime ? new Date(formData.endDateTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    required
                  />
                </div>
              </div>

              {/* Row 4: Capacity & Status */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="capacity">Capacity (Seats) *</label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  max="500"
                  className="form-input"
                  value={formData.capacity}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ borderRadius: '5px' }}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: '5px' }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Workshop')}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal Before Saving Workshop */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSave}
        title={isEditing ? 'Confirm Workshop Update' : 'Confirm New Workshop'}
        message={`Are you sure you want to ${isEditing ? 'save changes to' : 'create'} workshop "${formData.title}" (${formData.code || workshop?.code}) with a capacity of ${formData.capacity} attendees?`}
        confirmText={isEditing ? 'Yes, Save Changes' : 'Yes, Create Workshop'}
        cancelText="Review Details"
        variant="primary"
        icon={<CheckCircle2 size={26} color="#2563eb" />}
        submitting={submitting}
      />

      {/* Calendar Date & Time Selector Modal */}
      <CalendarModal
        isOpen={!!calendarField}
        onClose={() => setCalendarField(null)}
        onSelect={(val) => {
          setFormData((prev) => ({ ...prev, [calendarField]: val }));
        }}
        initialValue={calendarField ? formData[calendarField] : ''}
        mode="datetime"
        title={calendarField === 'startDateTime' ? 'Select Workshop Start Time' : 'Select Workshop End Time'}
      />
    </div>
  );
}
