# Story Bible

A comprehensive novel planning application built with React, TypeScript, and Vite. Story Bible helps writers organize their ideas, characters, plots, and timelines in one powerful tool.

## Features

### 1. Book Management
- Create and manage multiple novel projects (books)
- Switch between different projects seamlessly
- Each book maintains its own independent data

### 2. Entity System
- Create and organize different types of entities:
  - **Characters**: Track character details, backstories, and traits
  - **Places**: Document locations and settings
  - **Items**: Catalog important objects
  - **Concepts**: Define abstract ideas and themes
  - **Other**: Custom entity types
- Add detailed notes and descriptions
- Upload and attach reference images
- Create relationships between entities (e.g., "Character A lives in Place B")
- View all entities organized by type

### 3. Timeline
- Create multiple storylines (Main Plot, Character Arcs, Subplots)
- Add timeline events with flexible timestamps
- Link entities to events
- Visual timeline view showing all storylines
- Color-code events for easy visualization
- Connect events to chapters

### 4. Chapter & Scene Planner
- Organize your story chapter by chapter
- Break down chapters into detailed scenes
- For each scene, track:
  - Scene title and description
  - Location where it takes place
  - Characters involved
  - Additional notes
- Link chapters to timeline events
- Tag entities that appear in each chapter

### 5. Brainstorm Board
- Visual whiteboard for free-form ideation
- Add sticky notes with different colors
- Upload and place reference images
- Connect ideas with visual links
- Drag and arrange elements freely
- Perfect for mapping out complex relationships and plot connections

### 6. PDF Export
- Export your entire story bible to a professional PDF
- Includes clickable table of contents for easy navigation
- Internal hyperlinks between sections
- Comprehensive document with all entities, timeline, chapters, and relationships
- Perfect for sharing with editors, beta readers, or for backup purposes

### 7. Data Persistence
- All data stored locally in your browser using IndexedDB
- No server required - complete privacy
- Automatic saving as you work
- Data persists between sessions

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Story-Bible
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Creating Your First Book

1. When you first open the app, you'll see the book selection screen
2. Click "Create New Book"
3. Enter a name and optional description
4. Click "Create Book" to start working

### Working with Entities

1. Click on "Entities" in the sidebar
2. Use the colored buttons to create different entity types
3. Fill in details, notes, and upload images
4. Click "Add Link" to create relationships between entities
5. Click "Save" when done

### Building Your Timeline

1. Navigate to "Timeline"
2. Click the "+" button to create a new event
3. Choose a storyline (or create a new one)
4. Add a flexible timestamp (e.g., "Day 1", "Chapter 5", "Spring 1985")
5. Write what happens in the event
6. Link related entities
7. Events appear in chronological order on the timeline view

### Planning Chapters

1. Go to "Chapters"
2. Click "+" to create a new chapter
3. Set chapter number and title
4. Write a summary
5. Add scenes using the "Add Scene" button
6. Expand scenes to add detailed information
7. Link entities and timeline events to chapters

### Brainstorming

1. Visit the "Brainstorm" page
2. Click "Add Note" to create sticky notes
3. Click "Add Image" to upload reference images
4. Drag notes and images to arrange them
5. Click and drag from one node's edge to another to create connections
6. Select a color before adding notes to change their appearance

### Exporting to PDF

1. Click "Export to PDF" in the sidebar (bottom section)
2. The PDF will be automatically generated and downloaded
3. The PDF includes:
   - Cover page with book information
   - Clickable table of contents
   - All entities with notes and relationships
   - Complete timeline with all storylines
   - All chapters with scenes
   - Internal hyperlinks for easy navigation

### Managing Multiple Books

1. Click "Change Book" in the sidebar
2. Select a different book from the main screen
3. Create new books or delete old ones as needed

## Technical Details

### Built With

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **ReactFlow** - Brainstorm board visualization
- **idb** - IndexedDB wrapper for data persistence
- **pdfmake** - PDF generation with hyperlinks and table of contents
- **Lucide React** - Icons

### Data Storage

All data is stored locally in your browser's IndexedDB. This means:
- ✅ Complete privacy - your data never leaves your computer
- ✅ Works offline
- ✅ Fast performance
- ⚠️ Clearing browser data will delete your books
- ⚠️ Data is browser-specific (not synced across devices)

**Backup Recommendation**: Consider periodically exporting your data or backing up your browser's IndexedDB to prevent data loss.

### Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ⚠️ Limited support (best on tablet or desktop)

## Tips for Best Results

1. **Start with Entities**: Create your characters and places first
2. **Use Relationships**: Link entities together to track complex connections
3. **Timeline Early**: Map out major plot points on the timeline before writing
4. **Chapter Planning**: Use scenes to break down exactly what happens
5. **Brainstorm Freely**: Don't worry about organization on the brainstorm board - it's for exploration
6. **Regular Backups**: Export or backup your browser data regularly

## Future Enhancements

Potential features for future versions:
- Export to various formats (PDF, JSON, Markdown)
- Import existing data
- Cloud sync across devices
- Collaborative editing
- Advanced search and filtering
- Templates for common story structures
- Statistics and analytics

## License

MIT License - feel free to use and modify for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

Happy writing! 📚✨
