'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Filter,
  AlertCircle,
  Flag,
  User,
  Tag,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan, TimelinePhase, TimelineTask } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TimelineBoardProps {
  event: EventPlan;
  onUpdateTasks: (tasks: TimelineTask[]) => void;
}

export const TimelineBoard: React.FC<TimelineBoardProps> = ({
  event,
  onUpdateTasks,
}) => {
  const [activePhaseFilter, setActivePhaseFilter] = useState<string>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPhaseId, setTaskPhaseId] = useState<string>(event.phases[0]?.id || 't-6m');
  const [taskCategory, setTaskCategory] = useState('Production');
  const [taskPriority, setTaskPriority] = useState<TimelineTask['priority']>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskTimeSlot, setTaskTimeSlot] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  // Extract all unique task categories for filtering
  const categoriesList = Array.from(new Set(event.tasks.map((t) => t.category))).filter(Boolean);

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    const targetTask = event.tasks.find((t) => t.id === taskId);
    const willBeCompleted = targetTask ? !targetTask.completed : false;

    const updated = event.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: willBeCompleted };
      }
      return t;
    });

    onUpdateTasks(updated);

    // If task was completed, check if all tasks in that phase are complete and trigger celebratory confetti!
    if (willBeCompleted) {
      const remainingIncomplete = updated.filter((t) => !t.completed).length;
      if (remainingIncomplete === 0 && typeof window !== 'undefined') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1B3B36', '#C89047', '#575553'],
        });
      }
    }
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const updated = event.tasks.filter((t) => t.id !== taskId);
    onUpdateTasks(updated);
  };

  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      phaseId: taskPhaseId,
      category: taskCategory.trim() || 'General',
      priority: taskPriority,
      completed: false,
      dueDate: taskDueDate || undefined,
      timeSlot: taskTimeSlot.trim() || undefined,
      assignedTo: taskAssignedTo.trim() || undefined,
    };

    onUpdateTasks([...event.tasks, newTask]);

    // Reset form
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskTimeSlot('');
    setTaskAssignedTo('');
    setIsAddingTask(false);
  };

  // Priority color styling
  const renderPriorityBadge = (priority: TimelineTask['priority']) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider bg-rose-100 text-rose-800 rounded">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 rounded">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider bg-cream-300 text-charcoal-700 rounded">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider bg-cream-200 text-charcoal-500 rounded">
            Low
          </span>
        );
    }
  };

  // Filter tasks
  const filteredTasks = event.tasks.filter((task) => {
    const matchesPhase = activePhaseFilter === 'all' || task.phaseId === activePhaseFilter;
    const matchesCategory = activeCategoryFilter === 'all' || task.category === activeCategoryFilter;
    return matchesPhase && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-atelier-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-charcoal-400">
                Reverse-Engineered Production Cadence
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900 tracking-tight mt-1">
              Timeline & Run of Show
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl font-sans">
              From foundational milestone sign-offs at T-6 Months to the minute-by-minute execution on Day-Of.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-light text-cream-50 text-xs font-semibold rounded-md transition-colors shadow-atelier self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone Task</span>
          </button>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActivePhaseFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activePhaseFilter === 'all'
                  ? 'bg-charcoal-900 text-cream-50'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              All Phases ({event.tasks.length})
            </button>
            {event.phases.map((phase) => {
              const phaseTaskCount = event.tasks.filter((t) => t.phaseId === phase.id).length;
              const isSelected = activePhaseFilter === phase.id;

              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhaseFilter(phase.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-charcoal-900 text-cream-50'
                      : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                  }`}
                >
                  {phase.label} ({phaseTaskCount})
                </button>
              );
            })}
          </div>

          {/* Category Filter Dropdown */}
          {categoriesList.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-charcoal-400" />
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-atelier-border rounded bg-white text-charcoal-800 focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Drawer/Modal Inline Form */}
      {isAddingTask && (
        <form
          onSubmit={handleAddTask}
          className="bg-white border border-charcoal-300 rounded-lg p-6 shadow-atelier-md space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-atelier-border pb-3">
            <h3 className="font-serif text-lg font-medium text-charcoal-900">
              Create New Production Milestone
            </h3>
            <span className="text-xs text-charcoal-500">Scheduled reverse workflow</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Milestone Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Conduct Floral Arch Load-in Walkthrough"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Description & Detailed Scope
              </label>
              <textarea
                rows={2}
                placeholder="Add logistical details, required materials, or notes..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Timeline Phase
              </label>
              <select
                value={taskPhaseId}
                onChange={(e) => setTaskPhaseId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white text-charcoal-800 focus:outline-none"
              >
                {event.phases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — {p.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Discipline / Category
              </label>
              <input
                type="text"
                placeholder="Venue, Decor, Media, Logistics, Guest"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Priority Tier
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TimelineTask['priority'])}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white text-charcoal-800 focus:outline-none"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {taskPhaseId === 'day-of' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                  Day-Of Time Slot (e.g. 09:30 AM - 10:15 AM)
                </label>
                <input
                  type="text"
                  placeholder="09:30 AM - 10:15 AM"
                  value={taskTimeSlot}
                  onChange={(e) => setTaskTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                Assigned Team Lead or Partner
              </label>
              <input
                type="text"
                placeholder="e.g. Production Lead, Floral Stylist, Host"
                value={taskAssignedTo}
                onChange={(e) => setTaskAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-atelier-border">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 text-xs text-charcoal-600 hover:text-charcoal-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-forest text-cream-50 rounded hover:bg-forest-light transition-colors"
            >
              Add Milestone
            </button>
          </div>
        </form>
      )}

      {/* Chronological Phase Groups */}
      <div className="space-y-6">
        {event.phases
          .filter((phase) => activePhaseFilter === 'all' || phase.id === activePhaseFilter)
          .map((phase) => {
            const phaseTasks = filteredTasks.filter((t) => t.phaseId === phase.id);
            const completedCount = phaseTasks.filter((t) => t.completed).length;
            const progress = phaseTasks.length > 0 ? Math.round((completedCount / phaseTasks.length) * 100) : 0;

            return (
              <div
                key={phase.id}
                className="bg-white border border-atelier-border rounded-lg p-5 sm:p-6 shadow-atelier space-y-4"
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-atelier-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xl font-medium text-charcoal-900">
                        {phase.label}
                      </span>
                      <span className="text-xs text-charcoal-400 font-sans">
                        &bull; {phase.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-charcoal-500 font-sans">
                      {completedCount} of {phaseTasks.length} Completed
                    </span>
                    <div className="w-24 bg-cream-300 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-forest h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="divide-y divide-atelier-border/60">
                  {phaseTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`py-3.5 flex items-start justify-between gap-4 transition-colors group ${
                        task.completed ? 'opacity-60 bg-cream-50/50' : ''
                      }`}
                    >
                      {/* Checkbox & Task Content */}
                      <div className="flex items-start gap-3.5 flex-grow">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className="mt-0.5 text-charcoal-400 hover:text-forest transition-colors flex-shrink-0"
                          title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-forest" />
                          ) : (
                            <Circle className="w-5 h-5 text-charcoal-300 group-hover:text-charcoal-400" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                task.completed
                                  ? 'line-through text-charcoal-500'
                                  : 'text-charcoal-900'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-sans uppercase tracking-wider bg-cream-200 text-charcoal-700 rounded border border-atelier-border/70">
                              {task.category}
                            </span>
                            {renderPriorityBadge(task.priority)}
                          </div>

                          {task.description && (
                            <p className="text-xs text-charcoal-600 font-sans leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Metadata row: timeSlot, dueDate, assignedTo */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-charcoal-500 font-sans">
                            {task.timeSlot && (
                              <span className="flex items-center gap-1 font-semibold text-charcoal-800 bg-ochre/15 px-2 py-0.5 rounded text-[10px]">
                                <Clock className="w-3 h-3 text-ochre-dark" />
                                {task.timeSlot}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-charcoal-400" />
                                Due: {formatDate(task.dueDate)}
                              </span>
                            )}
                            {task.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-charcoal-400" />
                                {task.assignedTo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-charcoal-400 hover:text-red-700 p-1 transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {phaseTasks.length === 0 && (
                    <div className="py-6 text-center text-xs text-charcoal-400 italic">
                      No milestones registered under this phase yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
};
