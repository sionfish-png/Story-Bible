import pdfMake from 'pdfmake/build/pdfmake';
import type { TDocumentDefinitions, Content, ContentText, ContentStack, ContentColumns } from 'pdfmake/interfaces';
import type { Book, Entity, Relationship, TimelineEvent, Chapter } from '../types';

// Initialize pdfMake with fonts
// @ts-ignore - vfs_fonts doesn't have proper types
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// @ts-ignore
pdfMake.vfs = pdfFonts.default?.vfs || pdfFonts.pdfMake?.vfs;

interface ExportData {
  book: Book;
  entities: Entity[];
  relationships: Relationship[];
  timelineEvents: TimelineEvent[];
  chapters: Chapter[];
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const { book, entities, relationships, timelineEvents, chapters } = data;

  // Group entities by type
  const entitiesByType = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) {
      acc[entity.type] = [];
    }
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, Entity[]>);

  // Group timeline events by storyline
  const eventsByStoryline = timelineEvents.reduce((acc, event) => {
    if (!acc[event.storyline]) {
      acc[event.storyline] = [];
    }
    acc[event.storyline].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const content: Content[] = [];

  // Cover Page
  content.push(
    { text: book.name, style: 'title', id: 'cover' } as ContentText,
    { text: 'Story Bible', style: 'subtitle', margin: [0, 0, 0, 20] as [number, number, number, number] } as ContentText
  );

  if (book.description) {
    content.push({ text: book.description, style: 'description', margin: [0, 0, 0, 40] as [number, number, number, number] } as ContentText);
  }

  content.push(
    { text: `Created: ${new Date(book.createdAt).toLocaleDateString()}`, style: 'metadata' } as ContentText,
    { text: `Last Updated: ${new Date(book.updatedAt).toLocaleDateString()}`, style: 'metadata', margin: [0, 0, 0, 20] as [number, number, number, number] } as ContentText,
    { text: '', pageBreak: 'after' } as ContentText
  );

  // Table of Contents
  const tocItems: ContentText[] = [
    { text: 'Overview', link: 'overview', style: 'tocItem' } as ContentText,
    { text: 'Entities', link: 'entities', style: 'tocItem' } as ContentText,
  ];

  Object.keys(entitiesByType).forEach(type => {
    tocItems.push({
      text: `  • ${type.charAt(0).toUpperCase() + type.slice(1)}s`,
      link: `entities-${type}`,
      style: 'tocSubItem'
    } as ContentText);
  });

  tocItems.push({ text: 'Relationships', link: 'relationships', style: 'tocItem' } as ContentText);
  tocItems.push({ text: 'Timeline', link: 'timeline', style: 'tocItem' } as ContentText);

  Object.keys(eventsByStoryline).forEach(storyline => {
    tocItems.push({
      text: `  • ${storyline}`,
      link: `timeline-${storyline.replace(/\s+/g, '-').toLowerCase()}`,
      style: 'tocSubItem'
    } as ContentText);
  });

  tocItems.push({ text: 'Chapters', link: 'chapters', style: 'tocItem' } as ContentText);

  chapters.forEach(chapter => {
    tocItems.push({
      text: `  • Chapter ${chapter.chapterNumber}: ${chapter.title}`,
      link: `chapter-${chapter.id}`,
      style: 'tocSubItem'
    } as ContentText);
  });

  content.push(
    { text: 'Table of Contents', style: 'header1', id: 'toc', pageBreak: 'before' } as ContentText,
    { ul: tocItems, margin: [0, 0, 0, 20] as [number, number, number, number] },
    { text: '', pageBreak: 'after' } as ContentText
  );

  // Overview
  const statsStack: ContentText[] = [
    { text: 'Statistics', style: 'header3', margin: [0, 0, 0, 10] as [number, number, number, number] } as ContentText,
    { text: `Total Entities: ${entities.length}`, margin: [0, 0, 0, 5] as [number, number, number, number] } as ContentText,
    { text: `Total Chapters: ${chapters.length}`, margin: [0, 0, 0, 5] as [number, number, number, number] } as ContentText,
    { text: `Timeline Events: ${timelineEvents.length}`, margin: [0, 0, 0, 5] as [number, number, number, number] } as ContentText,
    { text: `Relationships: ${relationships.length}`, margin: [0, 0, 0, 5] as [number, number, number, number] } as ContentText,
  ];

  const breakdownStack: ContentText[] = [
    { text: 'Entity Breakdown', style: 'header3', margin: [0, 0, 0, 10] as [number, number, number, number] } as ContentText,
  ];

  Object.entries(entitiesByType).forEach(([type, ents]) => {
    breakdownStack.push({
      text: `${type.charAt(0).toUpperCase() + type.slice(1)}s: ${ents.length}`,
      margin: [0, 0, 0, 5] as [number, number, number, number]
    } as ContentText);
  });

  content.push(
    { text: 'Overview', style: 'header1', id: 'overview', pageBreak: 'before' } as ContentText,
    {
      columns: [
        { width: '50%', stack: statsStack },
        { width: '50%', stack: breakdownStack }
      ],
      margin: [0, 0, 0, 20] as [number, number, number, number]
    } as ContentColumns,
    { text: '', pageBreak: 'after' } as ContentText
  );

  // Entities Section
  content.push({ text: 'Entities', style: 'header1', id: 'entities', pageBreak: 'before' } as ContentText);

  for (const [type, typeEntities] of Object.entries(entitiesByType)) {
    content.push({
      text: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
      style: 'header2',
      id: `entities-${type}`,
      margin: [0, 20, 0, 10] as [number, number, number, number]
    } as ContentText);

    for (const entity of typeEntities) {
      const entityRelationships = relationships.filter(
        r => r.fromEntityId === entity.id || r.toEntityId === entity.id
      );

      const entityStack: Content[] = [
        { text: entity.name, style: 'header3', margin: [0, 10, 0, 5] as [number, number, number, number] } as ContentText,
      ];

      if (entity.description) {
        entityStack.push({ text: entity.description, style: 'description', margin: [0, 0, 0, 5] as [number, number, number, number] } as ContentText);
      }

      if (entity.notes) {
        entityStack.push(
          { text: 'Notes:', style: 'label', margin: [0, 5, 0, 2] as [number, number, number, number] } as ContentText,
          { text: entity.notes, margin: [10, 0, 0, 5] as [number, number, number, number] } as ContentText
        );
      }

      if (entityRelationships.length > 0) {
        const relList = entityRelationships.map(rel => {
          const otherEntity = entities.find(e =>
            e.id === (rel.fromEntityId === entity.id ? rel.toEntityId : rel.fromEntityId)
          );
          const isFrom = rel.fromEntityId === entity.id;
          return isFrom
            ? `${rel.relationshipType} ${otherEntity?.name || 'Unknown'}`
            : `${otherEntity?.name || 'Unknown'} ${rel.relationshipType} this`;
        });

        entityStack.push(
          { text: 'Relationships:', style: 'label', margin: [0, 5, 0, 2] as [number, number, number, number] } as ContentText,
          { ul: relList, margin: [10, 0, 0, 5] as [number, number, number, number] }
        );
      }

      content.push({
        stack: entityStack,
        margin: [0, 0, 0, 15] as [number, number, number, number]
      } as ContentStack);
    }
  }

  // Relationships Section
  if (relationships.length > 0) {
    content.push({
      text: 'Relationships',
      style: 'header1',
      id: 'relationships',
      pageBreak: 'before',
      margin: [0, 0, 0, 10] as [number, number, number, number]
    } as ContentText);

    const relationshipList = relationships.map(rel => {
      const fromEntity = entities.find(e => e.id === rel.fromEntityId);
      const toEntity = entities.find(e => e.id === rel.toEntityId);
      return `${fromEntity?.name || 'Unknown'} ${rel.relationshipType} ${toEntity?.name || 'Unknown'}`;
    });

    content.push({
      ul: relationshipList,
      margin: [0, 0, 0, 20] as [number, number, number, number]
    });
  }

  // Timeline Section
  content.push({ text: 'Timeline', style: 'header1', id: 'timeline', pageBreak: 'before' } as ContentText);

  for (const [storyline, events] of Object.entries(eventsByStoryline)) {
    content.push({
      text: storyline,
      style: 'header2',
      id: `timeline-${storyline.replace(/\s+/g, '-').toLowerCase()}`,
      margin: [0, 20, 0, 10] as [number, number, number, number]
    } as ContentText);

    const sortedEvents = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    for (const event of sortedEvents) {
      const eventEntities = entities.filter(e => event.entityIds.includes(e.id));
      const eventStack: Content[] = [
        {
          columns: [
            { text: event.timestamp || 'N/A', width: 100, style: 'timestamp' } as ContentText,
            { text: event.title, width: '*', style: 'header3' } as ContentText
          ],
          margin: [0, 10, 0, 5] as [number, number, number, number]
        } as ContentColumns,
      ];

      if (event.description) {
        eventStack.push({ text: event.description, margin: [100, 0, 0, 5] as [number, number, number, number] } as ContentText);
      }

      if (eventEntities.length > 0) {
        eventStack.push(
          { text: 'Involved:', style: 'label', margin: [100, 5, 0, 2] as [number, number, number, number] } as ContentText,
          { text: eventEntities.map(e => e.name).join(', '), margin: [100, 0, 0, 5] as [number, number, number, number] } as ContentText
        );
      }

      content.push({
        stack: eventStack,
        margin: [0, 0, 0, 15] as [number, number, number, number]
      } as ContentStack);
    }
  }

  // Chapters Section
  if (chapters.length > 0) {
    content.push({ text: 'Chapters', style: 'header1', id: 'chapters', pageBreak: 'before' } as ContentText);

    for (const chapter of chapters) {
      const chapterEntities = entities.filter(e => chapter.entityIds.includes(e.id));
      const chapterEvents = timelineEvents.filter(e => chapter.timelineEventIds.includes(e.id));

      const chapterStack: Content[] = [
        {
          text: `Chapter ${chapter.chapterNumber}: ${chapter.title}`,
          style: 'header2',
          id: `chapter-${chapter.id}`,
          margin: [0, 20, 0, 10] as [number, number, number, number]
        } as ContentText,
      ];

      if (chapter.summary) {
        chapterStack.push(
          { text: 'Summary:', style: 'label', margin: [0, 0, 0, 2] as [number, number, number, number] } as ContentText,
          { text: chapter.summary, margin: [0, 0, 0, 10] as [number, number, number, number] } as ContentText
        );
      }

      if (chapterEntities.length > 0) {
        chapterStack.push(
          { text: 'Characters/Entities:', style: 'label', margin: [0, 5, 0, 2] as [number, number, number, number] } as ContentText,
          { text: chapterEntities.map(e => e.name).join(', '), margin: [0, 0, 0, 10] as [number, number, number, number] } as ContentText
        );
      }

      if (chapterEvents.length > 0) {
        const eventsList = chapterEvents.map(e => `${e.timestamp}: ${e.title}`);
        chapterStack.push(
          { text: 'Timeline Events:', style: 'label', margin: [0, 5, 0, 2] as [number, number, number, number] } as ContentText,
          { ul: eventsList, margin: [0, 0, 0, 10] as [number, number, number, number] }
        );
      }

      if (chapter.scenes.length > 0) {
        const scenesContent: Content[] = [
          { text: 'Scenes:', style: 'label', margin: [0, 10, 0, 5] as [number, number, number, number] } as ContentText,
        ];

        chapter.scenes.forEach(scene => {
          const sceneCharacters = entities.filter(e => scene.characterIds.includes(e.id));
          const sceneStack: ContentText[] = [
            {
              text: `Scene ${scene.sceneNumber}: ${scene.title || 'Untitled'}`,
              style: 'sceneTitle',
              margin: [10, 5, 0, 3] as [number, number, number, number]
            } as ContentText,
          ];

          if (scene.location) {
            sceneStack.push({
              text: `Location: ${scene.location}`,
              margin: [10, 0, 0, 3] as [number, number, number, number],
              italics: true
            } as ContentText);
          }

          if (scene.description) {
            sceneStack.push({
              text: scene.description,
              margin: [10, 0, 0, 3] as [number, number, number, number]
            } as ContentText);
          }

          if (sceneCharacters.length > 0) {
            sceneStack.push({
              text: `Characters: ${sceneCharacters.map(e => e.name).join(', ')}`,
              margin: [10, 0, 0, 3] as [number, number, number, number],
              fontSize: 9
            } as ContentText);
          }

          if (scene.notes) {
            sceneStack.push({
              text: `Notes: ${scene.notes}`,
              margin: [10, 0, 0, 5] as [number, number, number, number],
              fontSize: 9,
              italics: true
            } as ContentText);
          }

          scenesContent.push({
            stack: sceneStack,
            margin: [0, 0, 0, 10] as [number, number, number, number]
          } as ContentStack);
        });

        chapterStack.push(...scenesContent);
      }

      content.push({
        stack: chapterStack,
        margin: [0, 0, 0, 20] as [number, number, number, number]
      } as ContentStack);
    }
  }

  // Define document with styles
  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      title: {
        fontSize: 32,
        bold: true,
        alignment: 'center',
        margin: [0, 100, 0, 20] as [number, number, number, number]
      },
      subtitle: {
        fontSize: 20,
        alignment: 'center',
        color: '#666666'
      },
      description: {
        fontSize: 12,
        alignment: 'center',
        color: '#888888'
      },
      metadata: {
        fontSize: 10,
        alignment: 'center',
        color: '#999999'
      },
      header1: {
        fontSize: 24,
        bold: true,
        margin: [0, 20, 0, 10] as [number, number, number, number]
      },
      header2: {
        fontSize: 18,
        bold: true,
        margin: [0, 15, 0, 8] as [number, number, number, number]
      },
      header3: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5] as [number, number, number, number]
      },
      label: {
        fontSize: 11,
        bold: true,
        color: '#666666'
      },
      tocItem: {
        fontSize: 14,
        margin: [0, 5, 0, 5] as [number, number, number, number],
        color: '#0066cc'
      },
      tocSubItem: {
        fontSize: 12,
        margin: [20, 3, 0, 3] as [number, number, number, number],
        color: '#0066cc'
      },
      timestamp: {
        fontSize: 11,
        bold: true,
        color: '#8B5CF6'
      },
      sceneTitle: {
        fontSize: 12,
        bold: true,
        color: '#444444'
      }
    },
    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.3
    },
    pageMargins: [60, 60, 60, 60] as [number, number, number, number]
  };

  // Generate and download PDF
  const fileName = `${book.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_story_bible.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
}
