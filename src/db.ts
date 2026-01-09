import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type {
  Book,
  Entity,
  Relationship,
  TimelineEvent,
  Chapter,
  BrainstormNode,
  BrainstormConnection,
} from './types';

interface StoryBibleDB extends DBSchema {
  books: {
    key: string;
    value: Book;
  };
  entities: {
    key: string;
    value: Entity;
    indexes: { 'by-book': string };
  };
  relationships: {
    key: string;
    value: Relationship;
    indexes: { 'by-book': string };
  };
  timelineEvents: {
    key: string;
    value: TimelineEvent;
    indexes: { 'by-book': string; 'by-storyline': string };
  };
  chapters: {
    key: string;
    value: Chapter;
    indexes: { 'by-book': string };
  };
  brainstormNodes: {
    key: string;
    value: BrainstormNode;
    indexes: { 'by-book': string };
  };
  brainstormConnections: {
    key: string;
    value: BrainstormConnection;
    indexes: { 'by-book': string };
  };
}

const DB_NAME = 'story-bible-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<StoryBibleDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<StoryBibleDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<StoryBibleDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create Books store
      if (!db.objectStoreNames.contains('books')) {
        db.createObjectStore('books', { keyPath: 'id' });
      }

      // Create Entities store
      if (!db.objectStoreNames.contains('entities')) {
        const entityStore = db.createObjectStore('entities', { keyPath: 'id' });
        entityStore.createIndex('by-book', 'bookId');
      }

      // Create Relationships store
      if (!db.objectStoreNames.contains('relationships')) {
        const relStore = db.createObjectStore('relationships', { keyPath: 'id' });
        relStore.createIndex('by-book', 'bookId');
      }

      // Create Timeline Events store
      if (!db.objectStoreNames.contains('timelineEvents')) {
        const timelineStore = db.createObjectStore('timelineEvents', { keyPath: 'id' });
        timelineStore.createIndex('by-book', 'bookId');
        timelineStore.createIndex('by-storyline', 'storyline');
      }

      // Create Chapters store
      if (!db.objectStoreNames.contains('chapters')) {
        const chapterStore = db.createObjectStore('chapters', { keyPath: 'id' });
        chapterStore.createIndex('by-book', 'bookId');
      }

      // Create Brainstorm Nodes store
      if (!db.objectStoreNames.contains('brainstormNodes')) {
        const nodeStore = db.createObjectStore('brainstormNodes', { keyPath: 'id' });
        nodeStore.createIndex('by-book', 'bookId');
      }

      // Create Brainstorm Connections store
      if (!db.objectStoreNames.contains('brainstormConnections')) {
        const connStore = db.createObjectStore('brainstormConnections', { keyPath: 'id' });
        connStore.createIndex('by-book', 'bookId');
      }
    },
  });

  return dbInstance;
}

// Helper function to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Book operations
export async function getAllBooks(): Promise<Book[]> {
  const db = await getDB();
  return db.getAll('books');
}

export async function getBook(id: string): Promise<Book | undefined> {
  const db = await getDB();
  return db.get('books', id);
}

export async function saveBook(book: Book): Promise<void> {
  const db = await getDB();
  await db.put('books', book);
}

export async function deleteBook(id: string): Promise<void> {
  const db = await getDB();
  // Delete the book and all related data
  await db.delete('books', id);

  // Delete all entities for this book
  const entities = await db.getAllFromIndex('entities', 'by-book', id);
  for (const entity of entities) {
    await db.delete('entities', entity.id);
  }

  // Delete all relationships
  const relationships = await db.getAllFromIndex('relationships', 'by-book', id);
  for (const rel of relationships) {
    await db.delete('relationships', rel.id);
  }

  // Delete all timeline events
  const events = await db.getAllFromIndex('timelineEvents', 'by-book', id);
  for (const event of events) {
    await db.delete('timelineEvents', event.id);
  }

  // Delete all chapters
  const chapters = await db.getAllFromIndex('chapters', 'by-book', id);
  for (const chapter of chapters) {
    await db.delete('chapters', chapter.id);
  }

  // Delete all brainstorm nodes
  const nodes = await db.getAllFromIndex('brainstormNodes', 'by-book', id);
  for (const node of nodes) {
    await db.delete('brainstormNodes', node.id);
  }

  // Delete all brainstorm connections
  const connections = await db.getAllFromIndex('brainstormConnections', 'by-book', id);
  for (const conn of connections) {
    await db.delete('brainstormConnections', conn.id);
  }
}

// Entity operations
export async function getEntitiesByBook(bookId: string): Promise<Entity[]> {
  const db = await getDB();
  return db.getAllFromIndex('entities', 'by-book', bookId);
}

export async function getEntity(id: string): Promise<Entity | undefined> {
  const db = await getDB();
  return db.get('entities', id);
}

export async function saveEntity(entity: Entity): Promise<void> {
  const db = await getDB();
  await db.put('entities', entity);
}

export async function deleteEntity(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('entities', id);
}

// Relationship operations
export async function getRelationshipsByBook(bookId: string): Promise<Relationship[]> {
  const db = await getDB();
  return db.getAllFromIndex('relationships', 'by-book', bookId);
}

export async function saveRelationship(relationship: Relationship): Promise<void> {
  const db = await getDB();
  await db.put('relationships', relationship);
}

export async function deleteRelationship(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('relationships', id);
}

// Timeline operations
export async function getTimelineEventsByBook(bookId: string): Promise<TimelineEvent[]> {
  const db = await getDB();
  return db.getAllFromIndex('timelineEvents', 'by-book', bookId);
}

export async function saveTimelineEvent(event: TimelineEvent): Promise<void> {
  const db = await getDB();
  await db.put('timelineEvents', event);
}

export async function deleteTimelineEvent(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('timelineEvents', id);
}

// Chapter operations
export async function getChaptersByBook(bookId: string): Promise<Chapter[]> {
  const db = await getDB();
  const chapters = await db.getAllFromIndex('chapters', 'by-book', bookId);
  return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
}

export async function getChapter(id: string): Promise<Chapter | undefined> {
  const db = await getDB();
  return db.get('chapters', id);
}

export async function saveChapter(chapter: Chapter): Promise<void> {
  const db = await getDB();
  await db.put('chapters', chapter);
}

export async function deleteChapter(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('chapters', id);
}

// Brainstorm operations
export async function getBrainstormNodesByBook(bookId: string): Promise<BrainstormNode[]> {
  const db = await getDB();
  return db.getAllFromIndex('brainstormNodes', 'by-book', bookId);
}

export async function saveBrainstormNode(node: BrainstormNode): Promise<void> {
  const db = await getDB();
  await db.put('brainstormNodes', node);
}

export async function deleteBrainstormNode(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('brainstormNodes', id);
}

export async function getBrainstormConnectionsByBook(bookId: string): Promise<BrainstormConnection[]> {
  const db = await getDB();
  return db.getAllFromIndex('brainstormConnections', 'by-book', bookId);
}

export async function saveBrainstormConnection(connection: BrainstormConnection): Promise<void> {
  const db = await getDB();
  await db.put('brainstormConnections', connection);
}

export async function deleteBrainstormConnection(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('brainstormConnections', id);
}
