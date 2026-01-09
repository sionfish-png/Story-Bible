import { useState, useEffect } from 'react';
import { useBook } from '../BookContext';
import type { Entity, EntityType, Relationship } from '../types';
import {
  getEntitiesByBook,
  saveEntity,
  deleteEntity,
  generateId,
  getRelationshipsByBook,
  saveRelationship,
  deleteRelationship,
} from '../db';
import { Plus, Trash2, Users, MapPin, Package, Star, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';

export default function Entities() {
  const { currentBook } = useBook();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<EntityType | 'all'>('all');
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    fromEntityId: '',
    toEntityId: '',
    type: '',
  });

  useEffect(() => {
    if (currentBook) {
      loadEntities();
      loadRelationships();
    }
  }, [currentBook]);

  async function loadEntities() {
    if (!currentBook) return;
    const data = await getEntitiesByBook(currentBook.id);
    setEntities(data);
  }

  async function loadRelationships() {
    if (!currentBook) return;
    const data = await getRelationshipsByBook(currentBook.id);
    setRelationships(data);
  }

  function handleCreateNew(type: EntityType) {
    const newEntity: Entity = {
      id: generateId(),
      bookId: currentBook!.id,
      type,
      name: '',
      description: '',
      notes: '',
      images: [],
      customFields: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSelectedEntity(newEntity);
    setIsCreating(true);
  }

  async function handleSave() {
    if (!selectedEntity || !selectedEntity.name.trim()) return;

    selectedEntity.updatedAt = new Date();
    await saveEntity(selectedEntity);
    await loadEntities();
    setSelectedEntity(null);
    setIsCreating(false);
  }

  async function handleDelete(entity: Entity, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(`Delete ${entity.name}?`)) {
      await deleteEntity(entity.id);
      await loadEntities();
      if (selectedEntity?.id === entity.id) {
        setSelectedEntity(null);
      }
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !selectedEntity) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedEntity({
        ...selectedEntity,
        images: [...selectedEntity.images, base64],
      });
    };

    reader.readAsDataURL(file);
  }

  async function handleCreateRelationship() {
    if (!currentBook || !newRelationship.fromEntityId || !newRelationship.toEntityId || !newRelationship.type) return;

    const relationship: Relationship = {
      id: generateId(),
      bookId: currentBook.id,
      fromEntityId: newRelationship.fromEntityId,
      toEntityId: newRelationship.toEntityId,
      relationshipType: newRelationship.type,
      createdAt: new Date(),
    };

    await saveRelationship(relationship);
    await loadRelationships();
    setShowRelationshipModal(false);
    setNewRelationship({ fromEntityId: '', toEntityId: '', type: '' });
  }

  const filteredEntities = filter === 'all'
    ? entities
    : entities.filter(e => e.type === filter);

  const entityTypes: { type: EntityType; icon: any; label: string; color: string }[] = [
    { type: 'character', icon: Users, label: 'Character', color: 'bg-blue-500' },
    { type: 'place', icon: MapPin, label: 'Place', color: 'bg-green-500' },
    { type: 'item', icon: Package, label: 'Item', color: 'bg-yellow-500' },
    { type: 'concept', icon: Star, label: 'Concept', color: 'bg-purple-500' },
    { type: 'other', icon: Star, label: 'Other', color: 'bg-gray-500' },
  ];

  function getEntityIcon(type: EntityType) {
    return entityTypes.find(t => t.type === type)?.icon || Star;
  }

  function getEntityColor(type: EntityType) {
    return entityTypes.find(t => t.type === type)?.color || 'bg-gray-500';
  }

  function getRelatedEntities(entityId: string) {
    return relationships
      .filter(r => r.fromEntityId === entityId || r.toEntityId === entityId)
      .map(r => {
        const otherEntityId = r.fromEntityId === entityId ? r.toEntityId : r.fromEntityId;
        const otherEntity = entities.find(e => e.id === otherEntityId);
        return { relationship: r, entity: otherEntity };
      })
      .filter(r => r.entity);
  }

  if (!currentBook) {
    return <div className="p-8">Please select a book first.</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Entity List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Entities</h2>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as EntityType | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="all">All Types</option>
            {entityTypes.map(t => (
              <option key={t.type} value={t.type}>{t.label}s</option>
            ))}
          </select>

          {/* Create Buttons */}
          <div className="flex flex-wrap gap-2">
            {entityTypes.map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => handleCreateNew(type)}
                className={`flex items-center px-3 py-2 ${color} text-white rounded-md hover:opacity-90 text-sm`}
              >
                <Plus className="w-4 h-4 mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Entity List */}
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {filteredEntities.map(entity => {
            const Icon = getEntityIcon(entity.type);
            const color = getEntityColor(entity.type);

            return (
              <div
                key={entity.id}
                onClick={() => {
                  setSelectedEntity(entity);
                  setIsCreating(false);
                }}
                className={`p-3 rounded-md cursor-pointer border-2 transition-all ${
                  selectedEntity?.id === entity.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 min-w-0">
                    <div className={`${color} p-2 rounded-md mr-3 flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 truncate">{entity.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{entity.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(entity, e)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredEntities.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>No entities yet.</p>
              <p className="text-sm">Create one above!</p>
            </div>
          )}
        </div>
      </div>

      {/* Entity Detail */}
      <div className="flex-1 overflow-auto">
        {selectedEntity ? (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={selectedEntity.name}
                  onChange={(e) => setSelectedEntity({ ...selectedEntity, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Entity name"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedEntity.type}
                  onChange={(e) => setSelectedEntity({ ...selectedEntity, type: e.target.value as EntityType })}
                  className="px-4 py-2 border border-gray-300 rounded-md capitalize focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {entityTypes.map(t => (
                    <option key={t.type} value={t.type}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={selectedEntity.description}
                  onChange={(e) => setSelectedEntity({ ...selectedEntity, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="Brief description"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={selectedEntity.notes}
                  onChange={(e) => setSelectedEntity({ ...selectedEntity, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={10}
                  placeholder="Detailed notes, backstory, characteristics, etc."
                />
              </div>

              {/* Images */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Images</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {selectedEntity.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="Reference" className="w-full h-40 object-cover rounded-md" />
                      <button
                        onClick={() => {
                          setSelectedEntity({
                            ...selectedEntity,
                            images: selectedEntity.images.filter((_, i) => i !== idx),
                          });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Relationships */}
              {!isCreating && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Relationships</label>
                    <button
                      onClick={() => {
                        setNewRelationship({ ...newRelationship, fromEntityId: selectedEntity.id });
                        setShowRelationshipModal(true);
                      }}
                      className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Add Link
                    </button>
                  </div>

                  <div className="space-y-2">
                    {getRelatedEntities(selectedEntity.id).map(({ relationship, entity }) => {
                      if (!entity) return null;
                      const Icon = getEntityIcon(entity.type);
                      const isFrom = relationship.fromEntityId === selectedEntity.id;

                      return (
                        <div key={relationship.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2 text-gray-600" />
                            <span className="text-sm">
                              {isFrom ? (
                                <>
                                  <span className="font-medium">{relationship.relationshipType}</span> {entity.name}
                                </>
                              ) : (
                                <>
                                  {entity.name} <span className="font-medium">{relationship.relationshipType}</span> this
                                </>
                              )}
                            </span>
                          </div>
                          <button
                            onClick={async () => {
                              await deleteRelationship(relationship.id);
                              await loadRelationships();
                            }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {getRelatedEntities(selectedEntity.id).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No relationships yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedEntity(null);
                    setIsCreating(false);
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Users className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <p>Select an entity or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Relationship Modal */}
      {showRelationshipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Relationship</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">To Entity</label>
              <select
                value={newRelationship.toEntityId}
                onChange={(e) => setNewRelationship({ ...newRelationship, toEntityId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select entity</option>
                {entities
                  .filter(e => e.id !== newRelationship.fromEntityId)
                  .map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                  ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Type</label>
              <input
                type="text"
                value={newRelationship.type}
                onChange={(e) => setNewRelationship({ ...newRelationship, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 'lives in', 'owns', 'knows'"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRelationshipModal(false);
                  setNewRelationship({ fromEntityId: '', toEntityId: '', type: '' });
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRelationship}
                disabled={!newRelationship.toEntityId || !newRelationship.type}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
