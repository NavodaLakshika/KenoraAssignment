import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  RotateCcw 
} from 'lucide-react';

export default function CalendarModal({
  isOpen,
  onClose,
  onSelect,
  initialValue = '',
  mode = 'datetime', // 'date' | 'datetime'
  title = 'Select Date & Time',
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Time states
  const [hours, setHours] = useState('10');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState('AM');

  useEffect(() => {
    if (isOpen) {
      if (initialValue) {
        const d = new Date(initialValue);
        if (!isNaN(d.getTime())) {
          setSelectedDate(d);
          setViewDate(d);
          
          let h = d.getHours();
          const p = h >= 12 ? 'PM' : 'AM';
          h = h % 12;
          h = h ? h : 12; // '0' becomes '12'
          setHours(String(h).padStart(2, '0'));
          setMinutes(String(d.getMinutes()).padStart(2, '0'));
          setPeriod(p);
          return;
        }
      }
      
      const now = new Date();
      setSelectedDate(now);
      setViewDate(now);
      setHours('10');
      setMinutes('00');
      setPeriod('AM');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateClick = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  const handleQuickPreset = (type) => {
    const now = new Date();
    let target = new Date();

    if (type === 'today') {
      target = now;
    } else if (type === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (type === 'nextWeek') {
      target.setDate(now.getDate() + 7);
    }

    setSelectedDate(target);
    setViewDate(target);
  };

  const handleApply = () => {
    if (!selectedDate) {
      onClose();
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');

    if (mode === 'date') {
      const dateString = `${year}-${month}-${day}`;
      onSelect(dateString);
      onClose();
      return;
    }

    // mode === 'datetime'
    let h = parseInt(hours, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const finalHours = String(h).padStart(2, '0');
    const finalMinutes = String(minutes).padStart(2, '0');

    // format: YYYY-MM-DDTHH:mm
    const dateTimeString = `${year}-${month}-${day}T${finalHours}:${finalMinutes}`;
    onSelect(dateTimeString);
    onClose();
  };

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  // Build calendar matrix
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const days = [];

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
    });
  }

  // Next month padding to reach 35 or 42
  const totalSlots = days.length > 35 ? 42 : 35;
  const remaining = totalSlots - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
    });
  }

  const isToday = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day, isCurrentMonth) => {
    if (!isCurrentMonth || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.15rem 1.35rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={18} color="#2563eb" />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {title}
            </span>
          </div>
          <button 
            type="button" 
            className="toast-close" 
            onClick={onClose}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.35rem' }}>
          {/* Month / Year Navigator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              {monthNames[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Preset Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickPreset('today')}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '9999px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('tomorrow')}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '9999px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('nextWeek')}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '9999px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              +1 Week
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            marginBottom: '0.4rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#64748b',
          }}>
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '3px',
            textAlign: 'center',
          }}>
            {days.map((item, index) => {
              const selected = isSelected(item.day, item.isCurrentMonth);
              const today = isToday(item.day, item.isCurrentMonth);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(item.day, item.isCurrentMonth)}
                  disabled={!item.isCurrentMonth}
                  style={{
                    height: '36px',
                    borderRadius: '8px',
                    border: today ? '1px solid #2563eb' : 'none',
                    backgroundColor: selected 
                      ? '#2563eb' 
                      : (today ? '#eff6ff' : 'transparent'),
                    color: selected 
                      ? '#ffffff' 
                      : (!item.isCurrentMonth ? '#cbd5e1' : '#0f172a'),
                    fontWeight: selected || today ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: item.isCurrentMonth ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Time Picker Controls (when mode === 'datetime') */}
          {mode === 'datetime' && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                <Clock size={15} color="#2563eb" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Select Time
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {/* Hours */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                    Hour
                  </label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="form-select"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', height: '36px' }}
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <span style={{ fontWeight: 800, color: '#94a3b8', marginTop: '1rem' }}>:</span>

                {/* Minutes */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                    Minute
                  </label>
                  <select
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="form-select"
                    style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', height: '36px' }}
                  >
                    {['00', '15', '30', '45'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* AM / PM Toggle */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginBottom: '0.2rem' }}>
                    Period
                  </label>
                  <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', height: '36px' }}>
                    <button
                      type="button"
                      onClick={() => setPeriod('AM')}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: period === 'AM' ? '#2563eb' : '#ffffff',
                        color: period === 'AM' ? '#ffffff' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriod('PM')}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: period === 'PM' ? '#2563eb' : '#ffffff',
                        color: period === 'PM' ? '#ffffff' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Selection Preview */}
          <div style={{
            marginTop: '1rem',
            padding: '0.6rem 0.85rem',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>
              <strong>Selected:</strong>{' '}
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'None'}
              {mode === 'datetime' ? ` at ${hours}:${minutes} ${period}` : ''}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.35rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleApply}
            >
              <Check size={14} />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
