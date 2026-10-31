'use client';

import React, { useState } from 'react';
import {
  Users,
  Heart,
  Cake,
  Leaf,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Music,
  Gift,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  ThumbsUp,
  MapPin,
  Calendar,
  Layers,
  Check,
  Copy,
} from 'lucide-react';
import {
  EventPlan,
  WeddingDetails,
  BirthdayDetails,
  CommunityDetails,
  SeatingTable,
  BridalPartyMilestone,
  RsvpGuest,
  PartyItineraryItem,
  MusicVibeTrack,
  WishlistItem,
  PermitItem,
  VolunteerShift,
  EmergencyRiskMatrixItem,
  TimelineTask,
} from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface PersonaFeaturesProps {
  event: EventPlan;
  onUpdateEvent: (updater: (prev: EventPlan) => EventPlan) => void;
  onAddTimelineTask?: (task: TimelineTask) => void;
}

export const PersonaFeatures: React.FC<PersonaFeaturesProps> = ({
  event,
  onUpdateEvent,
  onAddTimelineTask,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>('module-1');
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for Wedding
  const [newTableName, setNewTableName] = useState('');
  const [newTableShape, setNewTableShape] = useState<SeatingTable['shape']>('round');
  const [newTableCapacity, setNewTableCapacity] = useState('10');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestDietary, setNewGuestDietary] = useState<RsvpGuest['dietary']>('None');
  const [newGuestTableId, setNewGuestTableId] = useState('');

  // Form states for Birthday
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Vinyl House');
  const [newTrackBpm, setNewTrackBpm] = useState('120');
  const [newWishlistTitle, setNewWishlistTitle] = useState('');
  const [newWishlistCategory, setNewWishlistCategory] = useState('Barware');
  const [newWishlistPrice, setNewWishlistPrice] = useState('100');

  // Form states for Community
  const [newPermitName, setNewPermitName] = useState('');
  const [newPermitAuthority, setNewPermitAuthority] = useState('');
  const [newPermitDeadline, setNewPermitDeadline] = useState('');

  // --------------------------------------------------------------------------
  // WEDDING HANDLERS
  // --------------------------------------------------------------------------
  const wedding = event.weddingDetails;

  const handleToggleBridalMilestone = (milestoneId: string) => {
    onUpdateEvent((prev) => {
      if (!prev.weddingDetails) return prev;
      return {
        ...prev,
        weddingDetails: {
          ...prev.weddingDetails,
          bridalParty: prev.weddingDetails.bridalParty.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          ),
        },
      };
    });
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const newTbl: SeatingTable = {
      id: `tbl-${Date.now()}`,
      name: newTableName.trim(),
      shape: newTableShape,
      capacity: parseInt(newTableCapacity, 10) || 10,
      assignedGuests: [],
    };

    onUpdateEvent((prev) => ({
      ...prev,
      weddingDetails: {
        tables: [...(prev.weddingDetails?.tables || []), newTbl],
        bridalParty: prev.weddingDetails?.bridalParty || [],
        rsvps: prev.weddingDetails?.rsvps || [],
      },
    }));

    setNewTableName('');
  };

  const handleAddRsvpGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest: RsvpGuest = {
      id: `g-${Date.now()}`,
      name: newGuestName.trim(),
      status: 'confirmed',
      dietary: newGuestDietary,
      tableId: newGuestTableId || undefined,
      plusOne: false,
    };

    onUpdateEvent((prev) => {
      const existingTables = prev.weddingDetails?.tables || [];
      const updatedTables = newGuestTableId
        ? existingTables.map((t) =>
            t.id === newGuestTableId
              ? { ...t, assignedGuests: [...t.assignedGuests, newGuest.name] }
              : t
          )
        : existingTables;

      return {
        ...prev,
        weddingDetails: {
          tables: updatedTables,
          bridalParty: prev.weddingDetails?.bridalParty || [],
          rsvps: [...(prev.weddingDetails?.rsvps || []), newGuest],
        },
      };
    });

    setNewGuestName('');
  };

  // --------------------------------------------------------------------------
  // BIRTHDAY HANDLERS
  // --------------------------------------------------------------------------
  const birthday = event.birthdayDetails;

  const handleToggleItineraryItem = (itemId: string) => {
    onUpdateEvent((prev) => {
      if (!prev.birthdayDetails) return prev;
      return {
        ...prev,
        birthdayDetails: {
          ...prev.birthdayDetails,
          itinerary: prev.birthdayDetails.itinerary.map((it) =>
            it.id === itemId ? { ...it, completed: !it.completed } : it
          ),
        },
      };
    });
  };

  const handleUpvoteTrack = (trackId: string) => {
    onUpdateEvent((prev) => {
      if (!prev.birthdayDetails) return prev;
      return {
        ...prev,
        birthdayDetails: {
          ...prev.birthdayDetails,
          tracks: prev.birthdayDetails.tracks.map((tr) =>
            tr.id === trackId ? { ...tr, upvotes: tr.upvotes + 1 } : tr
          ),
        },
      };
    });
  };

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim() || !newTrackArtist.trim()) return;

    const newTr: MusicVibeTrack = {
      id: `tr-${Date.now()}`,
      title: newTrackTitle.trim(),
      artist: newTrackArtist.trim(),
      genre: newTrackGenre.trim() || 'Vinyl',
      bpm: parseInt(newTrackBpm, 10) || 120,
      energy: 'medium',
      upvotes: 1,
    };

    onUpdateEvent((prev) => ({
      ...prev,
      birthdayDetails: {
        itinerary: prev.birthdayDetails?.itinerary || [],
        tracks: [newTr, ...(prev.birthdayDetails?.tracks || [])],
        wishlist: prev.birthdayDetails?.wishlist || [],
      },
    }));

    setNewTrackTitle('');
    setNewTrackArtist('');
  };

  const handleToggleWishlistClaimed = (wishlistId: string) => {
    onUpdateEvent((prev) => {
      if (!prev.birthdayDetails) return prev;
      return {
        ...prev,
        birthdayDetails: {
          ...prev.birthdayDetails,
          wishlist: prev.birthdayDetails.wishlist.map((w) =>
            w.id === wishlistId ? { ...w, claimed: !w.claimed } : w
          ),
        },
      };
    });
  };

  const handleAddWishlistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishlistTitle.trim()) return;

    const newItem: WishlistItem = {
      id: `wl-${Date.now()}`,
      title: newWishlistTitle.trim(),
      category: newWishlistCategory,
      priceEstimate: parseFloat(newWishlistPrice) || 50,
      claimed: false,
    };

    onUpdateEvent((prev) => ({
      ...prev,
      birthdayDetails: {
        itinerary: prev.birthdayDetails?.itinerary || [],
        tracks: prev.birthdayDetails?.tracks || [],
        wishlist: [...(prev.birthdayDetails?.wishlist || []), newItem],
      },
    }));

    setNewWishlistTitle('');
  };

  // --------------------------------------------------------------------------
  // COMMUNITY HANDLERS
  // --------------------------------------------------------------------------
  const community = event.communityDetails;

  const handleUpdatePermitStatus = (permitId: string, status: PermitItem['status']) => {
    onUpdateEvent((prev) => {
      if (!prev.communityDetails) return prev;
      return {
        ...prev,
        communityDetails: {
          ...prev.communityDetails,
          permits: prev.communityDetails.permits.map((p) =>
            p.id === permitId ? { ...p, status } : p
          ),
        },
      };
    });
  };

  const handleIncrementShiftVolunteer = (shiftId: string) => {
    onUpdateEvent((prev) => {
      if (!prev.communityDetails) return prev;
      return {
        ...prev,
        communityDetails: {
          ...prev.communityDetails,
          shifts: prev.communityDetails.shifts.map((s) =>
            s.id === shiftId ? { ...s, filled: Math.min(s.capacity, s.filled + 1) } : s
          ),
        },
      };
    });
  };

  const handleConvertHazardToTask = (hazard: EmergencyRiskMatrixItem) => {
    if (onAddTimelineTask) {
      const newTask: TimelineTask = {
        id: `task-hazard-${Date.now()}`,
        title: `Protocol: ${hazard.hazard}`,
        description: `${hazard.mitigationProtocol} — Emergency Action: ${hazard.emergencyActionStep}`,
        phaseId: 't-1w',
        category: 'Safety & Ops',
        completed: false,
        priority: hazard.impact === 'Severe' || hazard.impact === 'High' ? 'critical' : 'high',
        assignedTo: 'Lead Safety Marshall',
      };
      onAddTimelineTask(newTask);
    }
  };

  // ==========================================================================
  // RENDER: WEDDINGS
  // ==========================================================================
  if (event.eventType === 'wedding') {
    const totalRsvps = wedding?.rsvps.length || 0;
    const confirmedCount = wedding?.rsvps.filter((r) => r.status === 'confirmed').length || 0;
    const veganCount = wedding?.rsvps.filter((r) => r.dietary === 'Vegan').length || 0;
    const celiacCount = wedding?.rsvps.filter((r) => r.dietary === 'Gluten-Free').length || 0;
    const vegetarianCount = wedding?.rsvps.filter((r) => r.dietary === 'Vegetarian').length || 0;
    const allergyCount = wedding?.rsvps.filter((r) => r.dietary === 'Nut Allergy').length || 0;

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Banner */}
        <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-atelier-border pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-sans font-semibold text-rose-800 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-700" />
                  Wedding Atelier Suite
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-forest" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900 tracking-tight mt-1">
                Seating Visualizer, Bridal Milestones & Diet Tracker
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl font-sans">
                Curate banquet table layouts, coordinate bridal party call times, and monitor dietary allergen profiles in real-time.
              </p>
            </div>

            {/* Sub-tab navigation */}
            <div className="flex items-center gap-2 bg-cream-100 p-1.5 rounded-lg border border-atelier-border self-start md:self-auto">
              {[
                { id: 'module-1', label: 'Seating Chart' },
                { id: 'module-2', label: 'Bridal Milestones' },
                { id: 'module-3', label: 'Diet & RSVPs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeSubTab === tab.id
                      ? 'bg-forest text-cream-50 shadow-atelier'
                      : 'text-charcoal-700 hover:text-charcoal-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUB-TAB 1: Seating Chart Visualizer */}
        {activeSubTab === 'module-1' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {wedding?.tables.map((table) => {
                const filledCount = table.assignedGuests.length;
                const capacityPct = Math.min(100, Math.round((filledCount / table.capacity) * 100));

                return (
                  <div
                    key={table.id}
                    className="bg-white border border-atelier-border rounded-lg p-5 shadow-atelier flex flex-col justify-between hover:border-charcoal-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-atelier-border pb-3">
                        <span className="font-serif text-base font-semibold text-charcoal-900">
                          {table.name}
                        </span>
                        <span className="text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded bg-cream-200 text-charcoal-700">
                          {table.shape}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-charcoal-500">
                        <span>Capacity:</span>
                        <span className="font-semibold text-charcoal-800">
                          {filledCount} of {table.capacity} Seats Filled
                        </span>
                      </div>

                      {/* Capacity bar */}
                      <div className="w-full bg-cream-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            capacityPct >= 100 ? 'bg-amber-600' : 'bg-forest'
                          }`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>

                      {/* Guest list tags */}
                      <div className="mt-4 space-y-1.5">
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-400 block">
                          Seated Guests:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                          {table.assignedGuests.map((guest, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded bg-cream-100 border border-atelier-border text-charcoal-800 flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-ochre" />
                              <span>{guest}</span>
                            </span>
                          ))}
                          {table.assignedGuests.length === 0 && (
                            <span className="text-xs text-charcoal-400 italic">No guests assigned yet.</span>
                          )}
                        </div>
                      </div>

                      {table.notes && (
                        <p className="mt-3 text-[11px] text-charcoal-500 italic bg-cream-50 p-2 rounded border border-atelier-border/60">
                          &ldquo;{table.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Table Inline Form */}
            <form
              onSubmit={handleAddTable}
              className="bg-white border border-atelier-border rounded-lg p-5 shadow-atelier space-y-3"
            >
              <h3 className="font-serif text-base font-medium text-charcoal-900">
                Add Table to Floorplan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Table Name (e.g. Table 5 — Terracotta Courtyard)"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                />
                <select
                  value={newTableShape}
                  onChange={(e) => setNewTableShape(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-atelier-border rounded bg-cream-50 text-charcoal-800 focus:outline-none"
                >
                  <option value="round">Round Banquet</option>
                  <option value="rectangular">Rectangular Long-Table</option>
                  <option value="head">Head Table</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="2"
                    max="30"
                    placeholder="Cap (10)"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="w-20 px-3 py-2 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                  />
                  <button
                    type="submit"
                    className="flex-grow px-3 py-2 text-xs font-semibold rounded bg-forest text-cream-50 hover:bg-forest-light transition-colors"
                  >
                    Add Table
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* SUB-TAB 2: Bridal Party Milestones */}
        {activeSubTab === 'module-2' && (
          <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-5">
            <div className="flex items-center justify-between border-b border-atelier-border pb-4">
              <h3 className="font-serif text-xl font-medium text-charcoal-900">
                Bridal Party Run-of-Show Milestones
              </h3>
              <span className="text-xs text-charcoal-500">
                {wedding?.bridalParty.filter((b) => b.completed).length} of {wedding?.bridalParty.length} Completed
              </span>
            </div>

            <div className="divide-y divide-atelier-border/70">
              {wedding?.bridalParty.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`py-4 flex items-start justify-between gap-4 transition-colors ${
                    milestone.completed ? 'opacity-60 bg-cream-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleBridalMilestone(milestone.id)}
                      className="mt-0.5 text-charcoal-400 hover:text-forest transition-colors"
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-forest" />
                      ) : (
                        <Circle className="w-5 h-5 text-charcoal-300" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            milestone.completed ? 'line-through text-charcoal-500' : 'text-charcoal-900'
                          }`}
                        >
                          {milestone.milestone}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-sans uppercase font-semibold bg-forest/10 text-forest rounded">
                          {milestone.role}
                        </span>
                      </div>
                      {milestone.location && (
                        <p className="text-xs text-charcoal-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-charcoal-400" />
                          {milestone.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-charcoal-700 bg-cream-100 px-2.5 py-1 rounded flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-ochre" />
                    {milestone.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: Diet & RSVP Tracker */}
        {activeSubTab === 'module-3' && (
          <div className="space-y-6">
            {/* Dietary Matrix Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-atelier-border p-4 rounded-lg shadow-atelier">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block font-sans">
                  Total Confirmed
                </span>
                <span className="font-serif text-2xl font-bold text-forest mt-1 block">
                  {confirmedCount} Guests
                </span>
                <span className="text-[11px] text-charcoal-400 mt-1 block">
                  {Math.round((confirmedCount / (event.guestCount || 1)) * 100)}% attendance rate
                </span>
              </div>
              <div className="bg-white border border-atelier-border p-4 rounded-lg shadow-atelier">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block font-sans">
                  Vegan & Plant-Based
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal-900 mt-1 block">
                  {veganCount} Guests
                </span>
                <span className="text-[11px] text-charcoal-400 mt-1 block">
                  Separate catering plating
                </span>
              </div>
              <div className="bg-white border border-atelier-border p-4 rounded-lg shadow-atelier">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block font-sans">
                  Celiac / Gluten-Free
                </span>
                <span className="font-serif text-2xl font-bold text-charcoal-900 mt-1 block">
                  {celiacCount} Guests
                </span>
                <span className="text-[11px] text-charcoal-400 mt-1 block">
                  Dedicated allergen prep
                </span>
              </div>
              <div className="bg-white border border-atelier-border p-4 rounded-lg shadow-atelier">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block font-sans">
                  Nut & Dairy Allergies
                </span>
                <span className="font-serif text-2xl font-bold text-amber-800 mt-1 block">
                  {allergyCount} Guests
                </span>
                <span className="text-[11px] text-charcoal-400 mt-1 block">
                  Flagged to kitchen guild
                </span>
              </div>
            </div>

            {/* Guest Directory Table */}
            <div className="bg-white border border-atelier-border rounded-lg p-5 sm:p-6 shadow-atelier space-y-4">
              <div className="flex items-center justify-between border-b border-atelier-border pb-3">
                <h3 className="font-serif text-lg font-medium text-charcoal-900">
                  Guest Directory & Table Placements
                </h3>
                <span className="text-xs text-charcoal-500">{totalRsvps} Records</span>
              </div>

              <div className="divide-y divide-atelier-border/60 max-h-80 overflow-y-auto">
                {wedding?.rsvps.map((guest) => {
                  const assignedTable = wedding?.tables.find((t) => t.id === guest.tableId);

                  return (
                    <div key={guest.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-forest" />
                        <span className="font-medium text-charcoal-900">{guest.name}</span>
                        {guest.plusOne && (
                          <span className="text-[10px] bg-cream-200 text-charcoal-600 px-1.5 py-0.2 rounded">
                            +1
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {guest.dietary !== 'None' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                            {guest.dietary}
                          </span>
                        ) : (
                          <span className="text-charcoal-400 text-[10px]">Standard Menu</span>
                        )}

                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cream-100 text-charcoal-700">
                          {assignedTable?.name || 'Unassigned Table'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Guest Form */}
              <form onSubmit={handleAddRsvpGuest} className="pt-3 border-t border-atelier-border flex flex-wrap gap-2">
                <input
                  type="text"
                  required
                  placeholder="Guest Full Name"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="flex-grow px-3 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                />
                <select
                  value={newGuestDietary}
                  onChange={(e) => setNewGuestDietary(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 text-charcoal-800 focus:outline-none"
                >
                  <option value="None">No Dietary Restrictions</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Gluten-Free">Gluten-Free / Celiac</option>
                  <option value="Nut Allergy">Nut Allergy</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                </select>
                <select
                  value={newGuestTableId}
                  onChange={(e) => setNewGuestTableId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 text-charcoal-800 focus:outline-none"
                >
                  <option value="">Select Table...</option>
                  {wedding?.tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-forest text-cream-50 hover:bg-forest-light transition-colors"
                >
                  Add Guest
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================================================
  // RENDER: BIRTHDAYS & SOIRÉES
  // ==========================================================================
  if (event.eventType === 'birthday') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Banner */}
        <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-atelier-border pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-sans font-semibold text-ochre-dark flex items-center gap-1.5">
                  <Cake className="w-4 h-4 text-ochre" />
                  Soirée Lounge Suite
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-ochre" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900 tracking-tight mt-1">
                Hourly Itinerary, Spotify Curator & Wishlist Generator
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl font-sans">
                Curate minute-by-minute party energy, manage live track requests and BPM progressions, and manage a bespoke gift registry.
              </p>
            </div>

            {/* Sub-tab navigation */}
            <div className="flex items-center gap-2 bg-cream-100 p-1.5 rounded-lg border border-atelier-border self-start md:self-auto">
              {[
                { id: 'module-1', label: 'Hourly Itinerary' },
                { id: 'module-2', label: 'Spotify Vibe Curator' },
                { id: 'module-3', label: 'Wishlist & RSVP' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeSubTab === tab.id
                      ? 'bg-charcoal-900 text-cream-50 shadow-atelier'
                      : 'text-charcoal-700 hover:text-charcoal-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUB-TAB 1: Hourly Party Itinerary */}
        {activeSubTab === 'module-1' && (
          <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
            <div className="flex items-center justify-between border-b border-atelier-border pb-4">
              <h3 className="font-serif text-xl font-medium text-charcoal-900">
                Hourly Celebration Run-of-Show
              </h3>
              <span className="text-xs text-charcoal-500 font-sans">
                {birthday?.itinerary.length} Curated Cadence Cues
              </span>
            </div>

            <div className="space-y-4">
              {birthday?.itinerary.map((cue) => {
                const isWarm = cue.vibeTag === 'Warm Mellow';
                const isPeak = cue.vibeTag === 'Golden Peak';
                const isHigh = cue.vibeTag === 'High Voltage';

                return (
                  <div
                    key={cue.id}
                    className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      cue.completed ? 'opacity-60 bg-cream-50' : 'bg-white hover:border-charcoal-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleItineraryItem(cue.id)}
                        className="mt-0.5 text-charcoal-400 hover:text-forest transition-colors"
                      >
                        {cue.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-forest" />
                        ) : (
                          <Circle className="w-5 h-5 text-charcoal-300" />
                        )}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif text-base font-semibold text-charcoal-900">
                            {cue.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider rounded ${
                              isHigh
                                ? 'bg-rose-100 text-rose-800'
                                : isPeak
                                ? 'bg-ochre/20 text-ochre-dark'
                                : 'bg-cream-200 text-charcoal-700'
                            }`}
                          >
                            {cue.vibeTag}
                          </span>
                        </div>
                        {cue.description && (
                          <p className="text-xs text-charcoal-600 font-sans mt-0.5">
                            {cue.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-800 bg-cream-100 px-3 py-1.5 rounded self-start sm:self-auto flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-ochre" />
                      <span>{cue.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: Spotify & Music Vibe Curator */}
        {activeSubTab === 'module-2' && (
          <div className="space-y-6">
            <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atelier-border pb-4">
                <div>
                  <h3 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
                    <Music className="w-5 h-5 text-forest" />
                    Spotify Tracklist & BPM Progression Queue
                  </h3>
                  <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                    Curated playlist with real-time upvotes and BPM tempo mapping.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal-600 font-sans font-medium">BPM Range:</span>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-cream-100 text-forest rounded border border-atelier-border">
                    88 — 126 BPM
                  </span>
                </div>
              </div>

              {/* Tracks List */}
              <div className="divide-y divide-atelier-border/60">
                {birthday?.tracks.map((track) => (
                  <div
                    key={track.id}
                    className="py-3.5 flex items-center justify-between gap-4 group hover:bg-cream-50/50 transition-colors px-2 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-charcoal-900 text-cream-50 flex items-center justify-center font-serif text-xs font-bold">
                        {track.bpm || '120'}
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-charcoal-900">
                          {track.title}
                        </h4>
                        <p className="text-xs text-charcoal-500 font-sans">
                          {track.artist} &bull; {track.genre}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-charcoal-400 font-mono hidden sm:inline">
                        {track.duration || '3:45'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleUpvoteTrack(track.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-cream-100 hover:bg-forest hover:text-cream-50 border border-atelier-border text-charcoal-700 transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{track.upvotes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Track Form */}
              <form onSubmit={handleAddTrack} className="pt-4 border-t border-atelier-border flex flex-wrap gap-2">
                <input
                  type="text"
                  required
                  placeholder="Song Title"
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  className="flex-grow px-3 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                />
                <input
                  type="text"
                  required
                  placeholder="Artist"
                  value={newTrackArtist}
                  onChange={(e) => setNewTrackArtist(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                />
                <input
                  type="text"
                  placeholder="Genre (e.g. French Disco)"
                  value={newTrackGenre}
                  onChange={(e) => setNewTrackGenre(e.target.value)}
                  className="w-32 px-3 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-forest text-cream-50 hover:bg-forest-light transition-colors"
                >
                  Add Track
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: RSVP & Gift Wishlist Generator */}
        {activeSubTab === 'module-3' && (
          <div className="space-y-6">
            <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atelier-border pb-4">
                <div>
                  <h3 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-ochre" />
                    Curated Gift Wishlist Registry
                  </h3>
                  <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                    Shareable wishlist for invited guests with claimed statuses and store links.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-cream-100 hover:bg-cream-200 border border-atelier-border text-charcoal-800 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-charcoal-500" />}
                  <span>{copiedLink ? 'Registry Link Copied!' : 'Copy Registry URL'}</span>
                </button>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {birthday?.wishlist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                      item.claimed ? 'bg-cream-50/80 border-atelier-border' : 'bg-white hover:border-charcoal-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-400">
                          {item.category}
                        </span>
                        <span className="font-serif text-sm font-bold text-charcoal-900">
                          {formatCurrency(item.priceEstimate)}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-charcoal-900">
                        {item.title}
                      </h4>
                      {item.claimed && item.claimedBy && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Claimed by {item.claimedBy}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-atelier-border/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleWishlistClaimed(item.id)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                          item.claimed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                        }`}
                      >
                        {item.claimed ? 'Claimed' : 'Mark as Claimed'}
                      </button>

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-charcoal-400 hover:text-forest transition-colors p-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Wishlist Form */}
              <form onSubmit={handleAddWishlistItem} className="pt-4 border-t border-atelier-border flex flex-wrap gap-2">
                <input
                  type="text"
                  required
                  placeholder="Wishlist Item Title (e.g. Hasami Porcelain Teapot)"
                  value={newWishlistTitle}
                  onChange={(e) => setNewWishlistTitle(e.target.value)}
                  className="flex-grow px-3 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                />
                <select
                  value={newWishlistCategory}
                  onChange={(e) => setNewWishlistCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 text-charcoal-800 focus:outline-none"
                >
                  <option value="Barware">Barware</option>
                  <option value="Ceramics">Ceramics</option>
                  <option value="Audio & Music">Audio & Music</option>
                  <option value="Experience">Experience</option>
                  <option value="Books">Books</option>
                </select>
                <input
                  type="number"
                  placeholder="Price ($)"
                  value={newWishlistPrice}
                  onChange={(e) => setNewWishlistPrice(e.target.value)}
                  className="w-24 px-3 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 focus:outline-none focus:border-forest"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-forest text-cream-50 hover:bg-forest-light transition-colors"
                >
                  Add Item
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================================================
  // RENDER: COMMUNITY DRIVES & CIVIC EVENTS
  // ==========================================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-atelier-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-emerald-800 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-700" />
                Civic Operations Hub
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900 tracking-tight mt-1">
              Permit Compliance, Volunteer Scheduler & Emergency Matrix
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl font-sans">
              Municipal safety authorizations, multi-shift volunteer rosters, and emergency operational protocols.
            </p>
          </div>

          {/* Sub-tab navigation */}
          <div className="flex items-center gap-2 bg-cream-100 p-1.5 rounded-lg border border-atelier-border self-start md:self-auto">
            {[
              { id: 'module-1', label: 'Permit Compliance' },
              { id: 'module-2', label: 'Volunteer Shifts' },
              { id: 'module-3', label: 'Risk Matrix' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-forest text-cream-50 shadow-atelier'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: Permit Compliance Checklist */}
      {activeSubTab === 'module-1' && (
        <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
          <div className="flex items-center justify-between border-b border-atelier-border pb-4">
            <h3 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest" />
              Municipal Permit Compliance & Authorizations
            </h3>
            <span className="text-xs text-charcoal-500 font-sans">
              {community?.permits.filter((p) => p.status === 'approved').length} of {community?.permits.length} Approved
            </span>
          </div>

          <div className="space-y-4">
            {community?.permits.map((permit) => (
              <div
                key={permit.id}
                className="p-4 rounded-lg border border-atelier-border hover:border-charcoal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif text-base font-semibold text-charcoal-900">
                      {permit.permitName}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider rounded ${
                        permit.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : permit.status === 'in_review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-cream-200 text-charcoal-700'
                      }`}
                    >
                      {permit.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                    Authority: {permit.authority} &bull; Ref: {permit.permitNumber || 'Pending'}
                  </p>
                  {permit.notes && (
                    <p className="text-[11px] text-charcoal-600 mt-1 italic">
                      {permit.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={permit.status}
                    onChange={(e) => handleUpdatePermitStatus(permit.id, e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs border border-atelier-border rounded bg-cream-50 text-charcoal-800 focus:outline-none"
                  >
                    <option value="approved">Approved & Filed</option>
                    <option value="in_review">In Review</option>
                    <option value="pending">Pending Application</option>
                    <option value="exempt">Exempt</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Volunteer Shift Scheduler */}
      {activeSubTab === 'module-2' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {community?.shifts.map((shift) => {
              const fillPct = Math.min(100, Math.round((shift.filled / shift.capacity) * 100));

              return (
                <div
                  key={shift.id}
                  className="bg-white border border-atelier-border rounded-lg p-5 shadow-atelier flex flex-col justify-between hover:border-charcoal-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-atelier-border pb-3">
                      <span className="font-serif text-base font-semibold text-charcoal-900">
                        {shift.shiftName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-700 bg-cream-100 px-2.5 py-1 rounded">
                      <Clock className="w-3.5 h-3.5 text-forest" />
                      <span>{shift.timeWindow}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-charcoal-600 pt-1">
                      <span>Volunteers Roster:</span>
                      <span className="font-semibold text-charcoal-900">
                        {shift.filled} / {shift.capacity} Filled
                      </span>
                    </div>

                    <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-forest h-full rounded-full transition-all duration-300"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>

                    <p className="text-xs text-charcoal-600 font-sans pt-1">
                      <strong className="text-charcoal-800">Lead:</strong> {shift.leadName}
                    </p>
                    <p className="text-[11px] text-charcoal-500 font-sans leading-relaxed">
                      {shift.tasksSummary}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-atelier-border flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleIncrementShiftVolunteer(shift.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-forest text-cream-50 hover:bg-forest-light transition-colors"
                    >
                      +1 Volunteer Sign-Up
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Weather & Emergency Risk Matrix */}
      {activeSubTab === 'module-3' && (
        <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
          <div className="flex items-center justify-between border-b border-atelier-border pb-4">
            <div>
              <h3 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Operational & Weather Emergency Matrix
              </h3>
              <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                Severity assessments, mitigation protocols, and actionable emergency escalation steps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {community?.emergencyMatrix.map((hazard) => (
              <div
                key={hazard.id}
                className="p-5 rounded-lg border border-atelier-border hover:border-charcoal-300 bg-cream-50/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-semibold text-charcoal-900">
                      {hazard.hazard}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider rounded ${
                        hazard.impact === 'Severe'
                          ? 'bg-rose-100 text-rose-800'
                          : hazard.impact === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-cream-200 text-charcoal-700'
                      }`}
                    >
                      {hazard.impact} Impact
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded border border-atelier-border/70 text-xs text-charcoal-700 space-y-1.5">
                    <p>
                      <strong className="text-forest uppercase tracking-wider text-[10px] block">
                        Mitigation Protocol:
                      </strong>
                      {hazard.mitigationProtocol}
                    </p>
                    <p className="pt-1 border-t border-atelier-border/60">
                      <strong className="text-rose-800 uppercase tracking-wider text-[10px] block">
                        Emergency Action Step:
                      </strong>
                      {hazard.emergencyActionStep}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-atelier-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleConvertHazardToTask(hazard)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-white hover:bg-forest hover:text-cream-50 border border-atelier-border text-forest transition-colors shadow-atelier"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Master Timeline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
