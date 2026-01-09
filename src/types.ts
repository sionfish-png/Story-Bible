// Data models for the Story Bible app

export interface Book {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EntityType = 'character' | 'place' | 'item' | 'concept' | 'other';

export interface Entity {
  id: string;
  bookId: string;
  type: EntityType;
  name: string;
  description: string;
  notes: string;
  images: string[]; // base64 encoded images
  customFields: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id: string;
  bookId: string;
  fromEntityId: string;
  toEntityId: string;
  relationshipType: string; // e.g., "lives in", "owns", "knows", "enemy of"
  description?: string;
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  bookId: string;
  storyline: string; // e.g., "Main Plot", "Character A Arc"
  title: string;
  description: string;
  timestamp: string; // flexible string for dates/times
  entityIds: string[]; // entities involved in this event
  chapterIds: string[]; // chapters this event relates to
  color?: string;
  createdAt: Date;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  summary: string;
  scenes: Scene[];
  timelineEventIds: string[];
  entityIds: string[]; // entities appearing in this chapter
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  description: string;
  location?: string; // could be linked to a Place entity
  characterIds: string[];
  notes: string;
}

export interface BrainstormNode {
  id: string;
  bookId: string;
  type: 'note' | 'image' | 'link';
  content: string; // text content or image data
  position: { x: number; y: number };
  size?: { width: number; height: number };
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrainstormConnection {
  id: string;
  bookId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
}
