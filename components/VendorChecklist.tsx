'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Copy,
  Check,
  Plus,
  Trash2,
  X,
  Send,
  Building,
  DollarSign,
  Filter,
  Sparkles,
  FileText,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { EventPlan, Vendor, VendorStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface VendorChecklistProps {
  event: EventPlan;
  onUpdateVendors: (vendors: Vendor[]) => void;
}

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  event,
  onUpdateVendors,
}) => {
  const [selectedVendorForEmail, setSelectedVendorForEmail] = useState<Vendor | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [activeTone, setActiveTone] = useState<'Curatorial' | 'Budget Cap Negotiation' | 'Contract Deadline'>('Curatorial');

  // New vendor form state
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorRole, setNewVendorRole] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('Venue & Grounds');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEstCost, setNewVendorEstCost] = useState('');
  const [newVendorNotes, setNewVendorNotes] = useState('');

  // Generate Tone Templates
  const generateEmailDraft = (vendor: Vendor, tone: 'Curatorial' | 'Budget Cap Negotiation' | 'Contract Deadline') => {
    const contact = vendor.contactName || 'Team';
    const costFormatted = formatCurrency(vendor.estimatedCost);

    if (tone === 'Budget Cap Negotiation') {
      return {
        subject: `Scope Alignment & Fiscal Allocation Ceiling — ${event.title}`,
        body: `Dear ${contact},\n\n` +
          `Thank you for reviewing the creative brief for "${event.title}" (${event.guestCount} guests at ${event.location}). We have immense respect for your work and would love to collaborate.\n\n` +
          `Our strict fiscal ceiling for ${vendor.role || vendor.category} is capped at ${costFormatted}, fully inclusive of all production setup fees, staffing, travel, and taxes.\n\n` +
          `Could you review this cap and suggest potential scope adjustments or package rebalancing to accommodate this figure?\n\n` +
          `Warm regards,\nAethel Event Atelier\nCuratorial Operations`,
      };
    }

    if (tone === 'Contract Deadline') {
      return {
        subject: `URGENT: Contract Execution & Date Hold Expiration — ${event.title} (${event.date})`,
        body: `Dear ${contact},\n\n` +
          `We are following up regarding our preliminary reservation hold for "${event.title}" on ${event.date}.\n\n` +
          `We are executing final vendor commitments and issuing retainers this week. To secure your participation, please provide your finalized agreement and payment schedule by this Friday at 5:00 PM EST.\n\n` +
          `If we do not hear back by this deadline, we will need to release the date hold and proceed with our secondary partner on standby.\n\n` +
          `Best regards,\nAethel Event Atelier\nProduction Lead`,
      };
    }

    // Default: Curatorial
    return {
      subject: `Curatorial Partnership Inquiry: ${vendor.role || vendor.category} — ${event.title}`,
      body: `Dear ${contact},\n\n` +
        `We are curating an architectural event titled "${event.title}" on ${event.date} at ${event.location} for ${event.guestCount} guests.\n\n` +
        `The aesthetic vision is grounded in: "${event.themeVibe}". We admire your tactile craftsmanship and would love to discuss your availability for our date.\n\n` +
        `Please share your seasonal catalog, booking requirements, and preliminary portfolio at your earliest convenience.\n\n` +
        `Warmest regards,\nAethel Event Atelier`,
    };
  };

  // Open inquiry drawer
  const handleOpenEmailDrawer = (vendor: Vendor) => {
    setSelectedVendorForEmail(vendor);
    setActiveTone('Curatorial');
    const draft = generateEmailDraft(vendor, 'Curatorial');
    setEmailSubject(draft.subject);
    setEmailBody(draft.body);
  };

  // Switch tone
  const handleSwitchTone = (tone: 'Curatorial' | 'Budget Cap Negotiation' | 'Contract Deadline') => {
    if (!selectedVendorForEmail) return;
    setActiveTone(tone);
    const draft = generateEmailDraft(selectedVendorForEmail, tone);
    setEmailSubject(draft.subject);
    setEmailBody(draft.body);
  };

  // Close inquiry drawer
  const handleCloseEmailDrawer = () => {
    setSelectedVendorForEmail(null);
  };

  // Copy email to clipboard
  const handleCopyEmail = () => {
    const fullText = `Subject: ${emailSubject}\n\n${emailBody}`;
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(fullText);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2200);
    }
  };

  // Status badge styling
  const renderStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'booked':
        return (
          <span className="px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            Booked & Confirmed
          </span>
        );
      case 'quoted':
        return (
          <span className="px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full border border-amber-200">
            Quote Received
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 rounded-full border border-blue-200">
            Initial Outreach
          </span>
        );
      case 'declined':
        return (
          <span className="px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-600 rounded-full">
            Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider bg-cream-200 text-charcoal-700 rounded-full border border-atelier-border">
            To Source
          </span>
        );
    }
  };

  // Change vendor status
  const handleStatusChange = (vendorId: string, newStatus: VendorStatus) => {
    const updated = event.vendors.map((v) => {
      if (v.id === vendorId) {
        return { ...v, status: newStatus };
      }
      return v;
    });
    onUpdateVendors(updated);
  };

  // Delete vendor
  const handleDeleteVendor = (vendorId: string) => {
    const updated = event.vendors.filter((v) => v.id !== vendorId);
    onUpdateVendors(updated);
  };

  // Add new vendor submit
  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const est = parseFloat(newVendorEstCost) || 0;

    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      name: newVendorName.trim(),
      role: newVendorRole.trim() || 'Service Specialist',
      category: newVendorCategory,
      contactName: newVendorContact.trim() || 'Partner Lead',
      email: newVendorEmail.trim() || 'contact@partner.com',
      phone: newVendorPhone.trim() || '',
      status: 'to_source',
      estimatedCost: est,
      actualCost: 0,
      rating: 5.0,
      notes: newVendorNotes.trim() || undefined,
      inquiryTemplate: {
        subject: `Curatorial Partnership Inquiry: ${newVendorRole || 'Services'} — ${event.title}`,
        body: `Dear ${newVendorContact.trim() || 'Team'},\n\nWe are curating "${event.title}" on ${event.date} in ${event.location}.\n\nWe admire your artisanal craftsmanship and would love to review your availability and preliminary portfolio.\n\nWarm regards,\nAethel Event Atelier`,
      },
    };

    onUpdateVendors([...event.vendors, newVendor]);

    // Reset
    setNewVendorName('');
    setNewVendorRole('');
    setNewVendorContact('');
    setNewVendorEmail('');
    setNewVendorPhone('');
    setNewVendorEstCost('');
    setNewVendorNotes('');
    setIsAddingVendor(false);
  };

  // Filter vendors
  const filteredVendors = event.vendors.filter((v) => {
    if (activeStatusFilter === 'all') return true;
    return v.status === activeStatusFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Top Banner */}
      <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-atelier-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-charcoal-400">
                Artisan Collaboration Network
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900 tracking-tight mt-1">
              Vendor Directory & Smart Outreach Generator
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl font-sans">
              Curate vetted floral stylists, farm-to-table caterers, audio tech, and transport fleets. Generate tailored negotiation drafts with 3 quick-select tone presets.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingVendor(!isAddingVendor)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-light text-cream-50 text-xs font-semibold rounded-md transition-colors shadow-atelier self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Artisan Partner</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-2">
          {['all', 'booked', 'quoted', 'contacted', 'to_source'].map((statusKey) => {
            const count =
              statusKey === 'all'
                ? event.vendors.length
                : event.vendors.filter((v) => v.status === statusKey).length;
            const isSelected = activeStatusFilter === statusKey;

            return (
              <button
                key={statusKey}
                onClick={() => setActiveStatusFilter(statusKey)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  isSelected
                    ? 'bg-charcoal-900 text-cream-50'
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                {statusKey === 'to_source' ? 'To Source' : statusKey} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Vendor Inline Form */}
      {isAddingVendor && (
        <form
          onSubmit={handleAddVendorSubmit}
          className="bg-white border border-charcoal-300 rounded-lg p-6 shadow-atelier-md space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-atelier-border pb-3">
            <h3 className="font-serif text-lg font-medium text-charcoal-900">
              Register New Artisan Partner
            </h3>
            <span className="text-xs text-charcoal-500">Collaborator Directory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Vendor Studio Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Studio Botanica"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Role / Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Architectural Floral Installations"
                value={newVendorRole}
                onChange={(e) => setNewVendorRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Category
              </label>
              <select
                value={newVendorCategory}
                onChange={(e) => setNewVendorCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white text-charcoal-800 focus:outline-none"
              >
                <option value="Venue & Grounds">Venue & Grounds</option>
                <option value="Catering & Spirits">Catering & Spirits</option>
                <option value="Decor & Florals">Decor & Florals</option>
                <option value="Media & Documentation">Media & Documentation</option>
                <option value="Music & Acoustics">Music & Acoustics</option>
                <option value="Logistics & Shuttles">Logistics & Shuttles</option>
                <option value="Paper & Calligraphy">Paper & Calligraphy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Estimated Investment ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 2500"
                value={newVendorEstCost}
                onChange={(e) => setNewVendorEstCost(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Primary Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Claire Dubois"
                value={newVendorContact}
                onChange={(e) => setNewVendorContact(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                placeholder="hello@studio.com"
                value={newVendorEmail}
                onChange={(e) => setNewVendorEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Notes & Scope Requirements
              </label>
              <textarea
                rows={2}
                placeholder="Certificates needed, load-in specifications..."
                value={newVendorNotes}
                onChange={(e) => setNewVendorNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-atelier-border">
            <button
              type="button"
              onClick={() => setIsAddingVendor(false)}
              className="px-4 py-2 text-xs text-charcoal-600 hover:text-charcoal-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-forest text-cream-50 rounded hover:bg-forest-light transition-colors"
            >
              Save Partner
            </button>
          </div>
        </form>
      )}

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white border border-atelier-border rounded-lg p-5 sm:p-6 shadow-atelier hover:border-charcoal-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Top Row: Category & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal-500">
                  {vendor.category}
                </span>
                {renderStatusBadge(vendor.status)}
              </div>

              {/* Vendor Studio Title */}
              <div>
                <h3 className="font-serif text-xl font-medium text-charcoal-900 tracking-tight">
                  {vendor.name}
                </h3>
                <p className="text-xs text-charcoal-600 font-sans mt-0.5">
                  {vendor.role}
                </p>
              </div>

              {/* Contact Info Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-600 font-sans pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-ochre" />
                  <span>{vendor.contactName}</span>
                </div>
                <div className="flex items-center gap-1 text-charcoal-500">
                  <Mail className="w-3.5 h-3.5 text-charcoal-400" />
                  <span className="truncate max-w-[170px]">{vendor.email}</span>
                </div>
                {vendor.phone && (
                  <div className="flex items-center gap-1 text-charcoal-500">
                    <Phone className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {vendor.notes && (
                <p className="text-xs text-charcoal-500 italic bg-cream-50 p-2.5 rounded border border-atelier-border/60">
                  &ldquo;{vendor.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Bottom Row: Financials & Action Buttons */}
            <div className="mt-5 pt-4 border-t border-atelier-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-charcoal-400 block">
                  Estimated Investment
                </span>
                <span className="font-serif text-base font-semibold text-charcoal-900">
                  {formatCurrency(vendor.estimatedCost)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Status selector */}
                <select
                  value={vendor.status}
                  onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                  className="px-2.5 py-1 text-xs border border-atelier-border rounded bg-cream-50 text-charcoal-800 focus:outline-none"
                >
                  <option value="to_source">To Source</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="booked">Booked</option>
                  <option value="declined">Declined</option>
                </select>

                {/* Open Outreach Drawer */}
                <button
                  type="button"
                  onClick={() => handleOpenEmailDrawer(vendor)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-forest text-cream-50 hover:bg-forest-light transition-colors shadow-atelier"
                >
                  <Sparkles className="w-3.5 h-3.5 text-ochre-light" />
                  <span>Outreach Generator</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="opacity-0 group-hover:opacity-100 text-charcoal-400 hover:text-red-700 p-1.5 transition-all"
                  title="Remove vendor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredVendors.length === 0 && (
          <div className="col-span-2 py-12 text-center bg-white border border-atelier-border rounded-lg text-charcoal-400 italic">
            No vendors match the selected filter.
          </div>
        )}
      </div>

      {/* Slide-Over Side Drawer for Smart AI Email Outreach Generator */}
      {selectedVendorForEmail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white h-full shadow-atelier-lg border-l border-atelier-border flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-atelier-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-cream-100 text-forest">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-medium text-charcoal-900">
                      Smart Vendor Outreach Generator
                    </h3>
                    <p className="text-xs text-charcoal-500 font-sans">
                      Target: {selectedVendorForEmail.name} &bull; {selectedVendorForEmail.contactName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseEmailDrawer}
                  className="p-2 rounded-full hover:bg-cream-100 text-charcoal-400 hover:text-charcoal-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Quick-Select Tone Presets */}
              <div className="mt-4 p-3.5 bg-cream-50 border border-atelier-border rounded-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ochre" />
                    <span>Quick-Select Tone Preset</span>
                  </span>
                  <span className="text-[10px] text-charcoal-500 font-sans uppercase">
                    3 Curated Modes
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Curatorial', label: 'Curatorial', desc: 'Artisanal partnership' },
                    { id: 'Budget Cap Negotiation', label: 'Budget Cap Negotiation', desc: 'Strict allocation ceiling' },
                    { id: 'Contract Deadline', label: 'Contract Deadline', desc: 'Friday hold deadline' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSwitchTone(preset.id as any)}
                      className={`px-2.5 py-2 text-xs rounded text-left transition-all border ${
                        activeTone === preset.id
                          ? 'bg-forest text-cream-50 border-forest font-semibold shadow-atelier'
                          : 'bg-white text-charcoal-700 border-atelier-border hover:bg-cream-100'
                      }`}
                    >
                      <p className="font-medium text-[11px] truncate">{preset.label}</p>
                      <p className={`text-[9px] truncate ${activeTone === preset.id ? 'text-cream-200' : 'text-charcoal-400'}`}>
                        {preset.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Subject & Body */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                    Generated Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                    Outreach Correspondence Body
                  </label>
                  <textarea
                    rows={11}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3.5 py-3 text-xs border border-atelier-border rounded bg-white leading-relaxed text-charcoal-800 font-sans focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-atelier-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded bg-cream-100 hover:bg-cream-200 text-charcoal-800 border border-atelier-border transition-colors"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span className="text-emerald-800 font-medium">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-charcoal-600" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${selectedVendorForEmail.email}?subject=${encodeURIComponent(
                  emailSubject
                )}&body=${encodeURIComponent(emailBody)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded bg-forest hover:bg-forest-light text-cream-50 transition-colors shadow-atelier"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Mail App</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
