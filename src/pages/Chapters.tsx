import { useState, useEffect } from 'react';
import { useBook } from '../BookContext';
import type { Chapter, Scene, Entity, TimelineEvent } from '../types';
import {
  getChaptersByBook,
  saveChapter,
  deleteChapter,
  generateId,
  getEntitiesByBook,
  getTimelineEventsByBook,
} from '../db';
import { Plus, Trash2, BookOpen, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function Chapters() {
  const { currentBook } = useBook();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentBook) {
      loadChapters();
      loadEntities();
      loadTimelineEvents();
    }
  }, [currentBook]);

  async function loadChapters() {
    if (!currentBook) return;
    const data = await getChaptersByBook(currentBook.id);
    setChapters(data);
  }

  async function loadEntities() {
    if (!currentBook) return;
    const data = await getEntitiesByBook(currentBook.id);
    setEntities(data);
  }

  async function loadTimelineEvents() {
    if (!currentBook) return;
    const data = await getTimelineEventsByBook(currentBook.id);
    setTimelineEvents(data);
  }

  function handleCreateNew() {
    const nextChapterNumber = chapters.length > 0
      ? Math.max(...chapters.map(c => c.chapterNumber)) + 1
      : 1;

    const newChapter: Chapter = {
      id: generateId(),
      bookId: currentBook!.id,
      chapterNumber: nextChapterNumber,
      title: '',
      summary: '',
      scenes: [],
      timelineEventIds: [],
      entityIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSelectedChapter(newChapter);
  }

  async function handleSave() {
    if (!selectedChapter || !selectedChapter.title.trim()) return;

    selectedChapter.updatedAt = new Date();
    await saveChapter(selectedChapter);
    await loadChapters();
    setSelectedChapter(null);
  }

  async function handleDelete(chapterId: string) {
    if (confirm('Delete this chapter?')) {
      await deleteChapter(chapterId);
      await loadChapters();
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(null);
      }
    }
  }

  function handleAddScene() {
    if (!selectedChapter) return;

    const newScene: Scene = {
      id: generateId(),
      sceneNumber: selectedChapter.scenes.length + 1,
      title: '',
      description: '',
      characterIds: [],
      notes: '',
    };

    setSelectedChapter({
      ...selectedChapter,
      scenes: [...selectedChapter.scenes, newScene],
    });
  }

  function handleUpdateScene(sceneId: string, updates: Partial<Scene>) {
    if (!selectedChapter) return;

    setSelectedChapter({
      ...selectedChapter,
      scenes: selectedChapter.scenes.map(s =>
        s.id === sceneId ? { ...s, ...updates } : s
      ),
    });
  }

  function handleDeleteScene(sceneId: string) {
    if (!selectedChapter) return;

    setSelectedChapter({
      ...selectedChapter,
      scenes: selectedChapter.scenes
        .filter(s => s.id !== sceneId)
        .map((s, idx) => ({ ...s, sceneNumber: idx + 1 })),
    });
  }

  function toggleSceneExpanded(sceneId: string) {
    const newExpanded = new Set(expandedScenes);
    if (newExpanded.has(sceneId)) {
      newExpanded.delete(sceneId);
    } else {
      newExpanded.add(sceneId);
    }
    setExpandedScenes(newExpanded);
  }

  if (!currentBook) {
    return <div className="p-8">Please select a book first.</div>;
  }

  return (
    <div className="h-screen flex">
      {/* Chapter List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Chapters</h2>
            <button
              onClick={handleCreateNew}
              className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {chapters.map(chapter => (
            <div
              key={chapter.id}
              onClick={() => {
                setSelectedChapter(chapter);
              }}
              className={`p-3 rounded-md cursor-pointer border-2 transition-all ${
                selectedChapter?.id === chapter.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium text-purple-600 mr-2">
                      Ch. {chapter.chapterNumber}
                    </span>
                    <h3 className="font-semibold text-gray-800 truncate">{chapter.title}</h3>
                  </div>
                  {chapter.scenes.length > 0 && (
                    <p className="text-xs text-gray-500">{chapter.scenes.length} scenes</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chapter.id);
                  }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {chapters.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No chapters yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Editor */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {selectedChapter ? (
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chapter Number
                    </label>
                    <input
                      type="number"
                      value={selectedChapter.chapterNumber}
                      onChange={(e) => setSelectedChapter({
                        ...selectedChapter,
                        chapterNumber: parseInt(e.target.value) || 1,
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chapter Title
                    </label>
                    <input
                      type="text"
                      value={selectedChapter.title}
                      onChange={(e) => setSelectedChapter({
                        ...selectedChapter,
                        title: e.target.value,
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Chapter title"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                  <textarea
                    value={selectedChapter.summary}
                    onChange={(e) => setSelectedChapter({
                      ...selectedChapter,
                      summary: e.target.value,
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    placeholder="Brief chapter summary"
                  />
                </div>

                {/* Entities */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entities in Chapter
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedChapter.entityIds.map(entityId => {
                      const entity = entities.find(e => e.id === entityId);
                      if (!entity) return null;
                      return (
                        <span
                          key={entityId}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {entity.name}
                          <button
                            onClick={() => {
                              setSelectedChapter({
                                ...selectedChapter,
                                entityIds: selectedChapter.entityIds.filter(id => id !== entityId),
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
                      if (e.target.value && !selectedChapter.entityIds.includes(e.target.value)) {
                        setSelectedChapter({
                          ...selectedChapter,
                          entityIds: [...selectedChapter.entityIds, e.target.value],
                        });
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue=""
                  >
                    <option value="">Add entity...</option>
                    {entities
                      .filter(e => !selectedChapter.entityIds.includes(e.id))
                      .map(e => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.type})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Timeline Events */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Timeline Events
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedChapter.timelineEventIds.map(eventId => {
                      const event = timelineEvents.find(e => e.id === eventId);
                      if (!event) return null;
                      return (
                        <span
                          key={eventId}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {event.title}
                          <button
                            onClick={() => {
                              setSelectedChapter({
                                ...selectedChapter,
                                timelineEventIds: selectedChapter.timelineEventIds.filter(id => id !== eventId),
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
                      if (e.target.value && !selectedChapter.timelineEventIds.includes(e.target.value)) {
                        setSelectedChapter({
                          ...selectedChapter,
                          timelineEventIds: [...selectedChapter.timelineEventIds, e.target.value],
                        });
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    defaultValue=""
                  >
                    <option value="">Add timeline event...</option>
                    {timelineEvents
                      .filter(e => !selectedChapter.timelineEventIds.includes(e.id))
                      .map(e => (
                        <option key={e.id} value={e.id}>
                          {e.title} ({e.storyline})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Scenes */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Scenes</h3>
                  <button
                    onClick={handleAddScene}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Scene
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedChapter.scenes.map((scene) => {
                    const isExpanded = expandedScenes.has(scene.id);

                    return (
                      <div key={scene.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div
                          onClick={() => toggleSceneExpanded(scene.id)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-center flex-1">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-500 mr-2" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500 mr-2" />
                            )}
                            <span className="font-medium text-purple-600 mr-3">
                              Scene {scene.sceneNumber}
                            </span>
                            <span className="text-gray-800">
                              {scene.title || 'Untitled Scene'}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScene(scene.id);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Scene Title
                              </label>
                              <input
                                type="text"
                                value={scene.title}
                                onChange={(e) => handleUpdateScene(scene.id, { title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                placeholder="Scene title"
                              />
                            </div>

                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                value={scene.location || ''}
                                onChange={(e) => handleUpdateScene(scene.id, { location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                placeholder="Where does this scene take place?"
                              />
                            </div>

                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                value={scene.description}
                                onChange={(e) => handleUpdateScene(scene.id, { description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                                rows={3}
                                placeholder="What happens in this scene?"
                              />
                            </div>

                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Characters in Scene
                              </label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {scene.characterIds.map(charId => {
                                  const entity = entities.find(e => e.id === charId);
                                  if (!entity) return null;
                                  return (
                                    <span
                                      key={charId}
                                      className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                                    >
                                      {entity.name}
                                      <button
                                        onClick={() => {
                                          handleUpdateScene(scene.id, {
                                            characterIds: scene.characterIds.filter(id => id !== charId),
                                          });
                                        }}
                                        className="ml-1"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                              <select
                                onChange={(e) => {
                                  if (e.target.value && !scene.characterIds.includes(e.target.value)) {
                                    handleUpdateScene(scene.id, {
                                      characterIds: [...scene.characterIds, e.target.value],
                                    });
                                  }
                                  e.target.value = '';
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                defaultValue=""
                              >
                                <option value="">Add character...</option>
                                {entities
                                  .filter(e => !scene.characterIds.includes(e.id))
                                  .map(e => (
                                    <option key={e.id} value={e.id}>
                                      {e.name}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                              </label>
                              <textarea
                                value={scene.notes}
                                onChange={(e) => handleUpdateScene(scene.id, { notes: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                                rows={2}
                                placeholder="Additional notes for this scene"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {selectedChapter.scenes.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p>No scenes yet. Add your first scene!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedChapter(null);
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedChapter.title.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300"
                >
                  Save Chapter
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <BookOpen className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <p>Select a chapter or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
