import { useState, useEffect } from 'react';
import { useBook } from '../BookContext';
import type { TimelineEvent, Entity } from '../types';
import {
  getTimelineEventsByBook,
  saveTimelineEvent,
  deleteTimelineEvent,
  generateId,
  getEntitiesByBook,
} from '../db';
import { Plus, Trash2, Clock, X } from 'lucide-react';

export default function Timeline() {
  const { currentBook } = useBook();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [storylines, setStorylines] = useState<string[]>([]);
  const [selectedStoryline, setSelectedStoryline] = useState<string>('all');
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  useEffect(() => {
    if (currentBook) {
      loadEvents();
      loadEntities();
    }
  }, [currentBook]);

  useEffect(() => {
    // Extract unique storylines from events
    const unique = Array.from(new Set(events.map(e => e.storyline)));
    setStorylines(unique);
  }, [events]);

  async function loadEvents() {
    if (!currentBook) return;
    const data = await getTimelineEventsByBook(currentBook.id);
    setEvents(data.sort((a, b) => a.timestamp.localeCompare(b.timestamp)));
  }

  async function loadEntities() {
    if (!currentBook) return;
    const data = await getEntitiesByBook(currentBook.id);
    setEntities(data);
  }

  function handleCreateNew() {
    const newEvent: TimelineEvent = {
      id: generateId(),
      bookId: currentBook!.id,
      storyline: 'Main Plot',
      title: '',
      description: '',
      timestamp: '',
      entityIds: [],
      chapterIds: [],
      color: colors[0],
      createdAt: new Date(),
    };
    setEditingEvent(newEvent);
    setIsCreating(true);
  }

  async function handleSave() {
    if (!editingEvent || !editingEvent.title.trim()) return;

    await saveTimelineEvent(editingEvent);
    await loadEvents();
    setEditingEvent(null);
    setIsCreating(false);
  }

  async function handleDelete(eventId: string) {
    if (confirm('Delete this event?')) {
      await deleteTimelineEvent(eventId);
      await loadEvents();
    }
  }

  const filteredEvents = selectedStoryline === 'all'
    ? events
    : events.filter(e => e.storyline === selectedStoryline);

  // Group events by storyline for visualization
  const eventsByStoryline = storylines.reduce((acc, storyline) => {
    acc[storyline] = events.filter(e => e.storyline === storyline);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  if (!currentBook) {
    return <div className="p-8">Please select a book first.</div>;
  }

  return (
    <div className="h-screen flex">
      {/* Event List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Timeline</h2>
            <button
              onClick={handleCreateNew}
              className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <select
            value={selectedStoryline}
            onChange={(e) => setSelectedStoryline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Storylines</option>
            {storylines.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => {
                setEditingEvent(event);
                setIsCreating(false);
              }}
              className={`p-3 rounded-md cursor-pointer border-2 transition-all ${
                editingEvent?.id === event.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <h3 className="font-semibold text-gray-800 truncate">{event.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{event.storyline}</p>
                  {event.timestamp && (
                    <p className="text-xs text-gray-600 mt-1">{event.timestamp}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(event.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No events yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Visualization & Editor */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {editingEvent ? (
          // Event Editor
          <div className="p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {isCreating ? 'Create Event' : 'Edit Event'}
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Event title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Storyline</label>
                <input
                  type="text"
                  value={editingEvent.storyline}
                  onChange={(e) => setEditingEvent({ ...editingEvent, storyline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Main Plot, Character Arc, Subplot"
                  list="storylines"
                />
                <datalist id="storylines">
                  {storylines.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timestamp (flexible format)
                </label>
                <input
                  type="text"
                  value={editingEvent.timestamp}
                  onChange={(e) => setEditingEvent({ ...editingEvent, timestamp: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Day 1, Chapter 5, Year 1985, etc."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  placeholder="What happens in this event?"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingEvent({ ...editingEvent, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingEvent.color === color ? 'border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Entities
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingEvent.entityIds.map(entityId => {
                    const entity = entities.find(e => e.id === entityId);
                    if (!entity) return null;
                    return (
                      <span
                        key={entityId}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {entity.name}
                        <button
                          onClick={() => {
                            setEditingEvent({
                              ...editingEvent,
                              entityIds: editingEvent.entityIds.filter(id => id !== entityId),
                            });
                          }}
                          className="ml-2"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value && !editingEvent.entityIds.includes(e.target.value)) {
                      setEditingEvent({
                        ...editingEvent,
                        entityIds: [...editingEvent.entityIds, e.target.value],
                      });
                    }
                    e.target.value = '';
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue=""
                >
                  <option value="">Add entity...</option>
                  {entities
                    .filter(e => !editingEvent.entityIds.includes(e.id))
                    .map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.type})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setIsCreating(false);
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editingEvent.title.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Timeline Visualization
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Timeline View</h2>

            {storylines.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <Clock className="w-24 h-24 mx-auto mb-4 opacity-20" />
                  <p>No events yet. Create your first timeline event!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(eventsByStoryline).map(([storyline, storylineEvents]) => (
                  <div key={storyline}>
                    <h3 className="text-xl font-bold text-gray-700 mb-4">{storyline}</h3>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />

                      {/* Events */}
                      <div className="space-y-4">
                        {storylineEvents.map((event) => (
                          <div key={event.id} className="relative pl-12">
                            {/* Dot */}
                            <div
                              className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-white"
                              style={{ backgroundColor: event.color }}
                            />

                            {/* Event Card */}
                            <div
                              onClick={() => setEditingEvent(event)}
                              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition-shadow border-l-4"
                              style={{ borderLeftColor: event.color }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    {event.timestamp && (
                                      <span className="text-sm font-medium text-gray-500 mr-3">
                                        {event.timestamp}
                                      </span>
                                    )}
                                    <h4 className="text-lg font-bold text-gray-800">{event.title}</h4>
                                  </div>
                                  {event.description && (
                                    <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                                  )}
                                  {event.entityIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {event.entityIds.map(entityId => {
                                        const entity = entities.find(e => e.id === entityId);
                                        return entity ? (
                                          <span
                                            key={entityId}
                                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                                          >
                                            {entity.name}
                                          </span>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
