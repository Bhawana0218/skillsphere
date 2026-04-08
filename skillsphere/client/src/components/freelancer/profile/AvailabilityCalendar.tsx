import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import PremiumButton from '../shared/PremiumButton';

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
  readOnly?: boolean;
  onSave?: (slots: AvailabilitySlot[]) => Promise<void>;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  slots,
  onChange,
  readOnly = false,
  onSave
}) => {
  const [saving, setSaving] = useState(false);

  // Ensure slots is always an array
  const slotsArray = slots || [];

  const getSlotForDay = (day: string) =>
    slotsArray.find((slot) => slot.day === day) || {
      day,
      startTime: '09:00',
      endTime: '17:00',
      available: true,
    };

  const updateSlot = async (day: string, updates: Partial<AvailabilitySlot>) => {
    const existingIndex = slotsArray.findIndex((s) => s.day === day);
    let updated = [...slotsArray];

    if (existingIndex >= 0) {
      updated[existingIndex] = { ...updated[existingIndex], ...updates };
    } else {
      updated.push({ day, startTime: '09:00', endTime: '17:00', available: true, ...updates });
    }

    onChange(updated);

    if (onSave && !readOnly) {
      setSaving(true);
      try {
        await onSave(updated);
      } catch (error) {
        console.error('Error saving availability:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900">Weekly Availability</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Set your working hours and availability for each day. This helps clients know when to reach you.
        </p>

        <div className="space-y-3">
          {DAYS.map((day) => {
            const slot = getSlotForDay(day);
            return (
              <div key={day} className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-2">{day}</h4>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slot.available}
                        onChange={(e) => updateSlot(day, { available: e.target.checked })}
                        disabled={saving || readOnly}
                        className="w-4 h-4 accent-cyan-500 text-black rounded cursor-pointer"
                      />
                      <span className="text-sm text-slate-600">Available</span>
                    </label>
                  </div>
                </div>

                {slot.available && !readOnly && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(day, { startTime: e.target.value })}
                        disabled={saving}
                        className="px-2 py-1 border border-slate-300 rounded text-sm text-black focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <span className="text-slate-400">to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(day, { endTime: e.target.value })}
                      disabled={saving}
                      className="px-2 py-1 border border-slate-300 text-black rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                )}

                {slot.available && readOnly && (
                  <div className="text-sm text-slate-600">
                    {slot.startTime} - {slot.endTime}
                  </div>
                )}

                {!slot.available && (
                  <div className="text-sm text-slate-400 italic">Not available</div>
                )}
              </div>
            );
          })}
        </div>

        {!readOnly && (
          <div className="flex gap-2">
            <PremiumButton
              fullWidth
              variant="primary"
              disabled={saving}
              onClick={async () => {
                if (onSave) {
                  setSaving(true);
                  try {
                    await onSave(slotsArray);
                  } catch (error) {
                    console.error('Error saving:', error);
                  } finally {
                    setSaving(false);
                  }
                }
              }}
            >
              {saving ? 'Saving...' : 'Save availability'}
            </PremiumButton>
          </div>
        )}
      </div>
      </div>
    );
  };

export default AvailabilityCalendar;