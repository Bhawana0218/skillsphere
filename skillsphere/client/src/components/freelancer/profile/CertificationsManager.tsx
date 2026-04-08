import React, { useState } from 'react';
import { Plus, X, Award, ExternalLink } from 'lucide-react';
import PremiumButton from '../shared/PremiumButton';

interface Certification {
  id?: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  credentialId?: string;
  verified?: boolean;
}

interface CertificationsManagerProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
  readOnly?: boolean;
  onSave?: (certifications: Certification[]) => Promise<void>;
}

const CertificationsManager: React.FC<CertificationsManagerProps> = ({
  certifications,
  onChange,
  readOnly = false,
  onSave
}) => {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Certification>({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    credentialId: '',
    verified: false,
  });

  const addCertification = async () => {
    if (formData.title && formData.issuer && formData.issueDate) {
      const updatedCertifications = [
        ...certifications,
        {
          ...formData,
          id: Date.now().toString(),
        },
      ];
      onChange(updatedCertifications);
      
      if (onSave) {
        setSaving(true);
        try {
          await onSave(updatedCertifications);
        } catch (error) {
          console.error('Error saving certification:', error);
        } finally {
          setSaving(false);
        }
      }
      
      setFormData({
        title: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialUrl: '',
        credentialId: '',
        verified: false,
      });
      setShowForm(false);
    }
  };

  const removeCertification = async (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    onChange(updatedCertifications);
    
    if (onSave) {
      setSaving(true);
      try {
        await onSave(updatedCertifications);
      } catch (error) {
        console.error('Error removing certification:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {certifications.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No certifications added yet</p>
        ) : (
          certifications.map((cert, idx) => (
            <div key={cert.id || idx} className="bg-white rounded-lg p-4 border border-slate-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Award size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{cert.title}</h4>
                    {cert.verified && (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{cert.issuer}</p>
                  <p className="text-xs text-slate-500">
                    Issued: {cert.issueDate}
                    {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                  </p>
                  {cert.credentialId && (
                    <p className="text-xs text-slate-500">
                      Credential ID: {cert.credentialId}
                    </p>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium mt-1"
                    >
                      View credential <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {!readOnly && (
                <button
                  onClick={() => removeCertification(idx)}
                  disabled={saving}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {!readOnly && (
        <div>
          {!showForm ? (
            <PremiumButton onClick={() => setShowForm(true)} variant="outline" fullWidth disabled={saving}>
              <Plus size={18} /> Add certification
            </PremiumButton>
          ) : (
            <div className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200 space-y-3">
              <input
                type="text"
                placeholder="Certification title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={saving}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder:text-gray-700 text-black focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="Issuing organization"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                disabled={saving}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none placeholder:text-gray-700 text-black focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none placeholder:text-gray-700 text-black focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                />
                <input
                  type="date"
                  placeholder="Expiry date (optional)"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg placeholder:text-gray-700 text-black text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                />
              </div>
              <input
                type="text"
                placeholder="Credential ID (optional)"
                value={formData.credentialId || ''}
                onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                disabled={saving}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none placeholder:text-gray-700 text-black focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <input
                type="text"
                placeholder="Credential URL (optional)"
                value={formData.credentialUrl || ''}
                onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                disabled={saving}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none placeholder:text-gray-700 text-black focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.verified || false}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  disabled={saving}
                  className="w-4 h-4 accent-cyan-500 placeholder:text-gray-700 text-black rounded cursor-pointer"
                />
                <span className="text-sm text-slate-700">This certification is verified</span>
              </label>
              <div className="flex gap-2">
                <PremiumButton onClick={addCertification} variant="primary" fullWidth disabled={saving}>
                  {saving ? 'Saving...' : 'Add certification'}
                </PremiumButton>
                <PremiumButton onClick={() => setShowForm(false)} variant="ghost" fullWidth disabled={saving}>
                  Cancel
                </PremiumButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificationsManager;