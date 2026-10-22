'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Star,
  Plus,
  Trash2,
  X,
  Send,
  Building,
  DollarSign,
  Filter,
  Sparkles,
  FileText,
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

  // New vendor form state
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorRole, setNewVendorRole] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState('Venue & Grounds');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEstCost, setNewVendorEstCost] = useState('');
  const [newVendorNotes, setNewVendorNotes] = useState('');

  // Open inquiry drawer
  const handleOpenEmailDrawer = (vendor: Vendor) => {
    setSelectedVendorForEmail(vendor);
    setEmailSubject(vendor.inquiryTemplate.subject);
    setEmailBody(vendor.inquiryTemplate.body);
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

  // AI Rephrase helper
  const handleAiRephrase = (tone: 'cordial' | 'budget_firm' | 'urgent') => {
    if (!selectedVendorForEmail) return;

    if (tone === 'budget_firm') {
      setEmailBody(
        `Dear ${selectedVendorForEmail.contactName || 'Team'},\n\n` +
          `Thank you for reviewing Julian & Elena's event vision for "${event.title}". ` +
          `We love your work and want to make this partnership feasible. \n\n` +
          `Our strict allocation ceiling for this discipline is ${formatCurrency(
            selectedVendorForEmail.estimatedCost
          )} inclusive of all service fees and taxes. ` +
          `Could you adjust your package scope or suggest alternate material formulations to meet this target?\n\n` +
          `Warm regards,\nAethel Event Atelier`
      );
    } else if (tone === 'urgent') {
      setEmailBody(
        `Dear ${selectedVendorForEmail.contactName || 'Team'},\n\n` +
          `Following up regarding our date hold for "${event.title}" on ${event.date}. ` +
          `We are finalizing our vendor roster this week and require your contract and deposit terms by Friday 5:00 PM to secure the spot.\n\n` +
          `Best regards,\nAethel Event Atelier`
      );
    } else {
      // Cordial
      setEmailBody(
        `Dear ${selectedVendorForEmail.contactName || 'Team'},\n\n` +
          `We are delighted to invite you to participate in curating "${event.title}". ` +
          `The aesthetic tone is ${event.themeVibe}.\n\n` +
          `Please find our initial scope outline attached. We look forward to scheduling a quick 15-minute consultation to walk through details.\n\n` +
          `Warmest regards,\nAethel Event Atelier`
      );
    }
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
        subject: `Partnership Inquiry: ${newVendorRole || 'Services'} — ${event.title}`,
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
              Vendor Directory & Smart Inquiries
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl font-sans">
              Curate vetted floral stylists, farm-to-table caterers, analog photographers, and transport fleets. Dispatch pre-drafted AI inquiry emails in seconds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingVendor(!isAddingVendor)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-light text-cream-50 text-xs font-semibold rounded-md transition-colors shadow-atelier self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Artisan Vendor</span>
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

                {/* Open Inquiry Drawer */}
                <button
                  type="button"
                  onClick={() => handleOpenEmailDrawer(vendor)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-forest text-cream-50 hover:bg-forest-light transition-colors shadow-atelier"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Draft Email</span>
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

      {/* Slide-Over Side Drawer for Smart AI Email Inquiry */}
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
                      Smart Vendor Inquiry
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

              {/* AI Rephraser Tone Chips */}
              <div className="mt-4 p-3 bg-cream-50 border border-atelier-border rounded-md space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-700">
                  <Sparkles className="w-3.5 h-3.5 text-ochre" />
                  <span>AI Tone Tailor</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAiRephrase('cordial')}
                    className="px-2.5 py-1 text-xs rounded bg-white border border-atelier-border hover:border-charcoal-400 text-charcoal-700 transition-colors"
                  >
                    Curatorial & Warm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiRephrase('budget_firm')}
                    className="px-2.5 py-1 text-xs rounded bg-white border border-atelier-border hover:border-charcoal-400 text-charcoal-700 transition-colors"
                  >
                    Budget Negotiation Ceiling
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAiRephrase('urgent')}
                    className="px-2.5 py-1 text-xs rounded bg-white border border-atelier-border hover:border-charcoal-400 text-charcoal-700 transition-colors"
                  >
                    Friday Contract Hold
                  </button>
                </div>
              </div>

              {/* Editable Subject & Body */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                    Subject Line
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
                    Email Correspondence Body
                  </label>
                  <textarea
                    rows={12}
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
