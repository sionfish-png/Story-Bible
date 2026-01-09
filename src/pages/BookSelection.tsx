import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { getAllBooks, saveBook, deleteBook, generateId } from '../db';
import { useBook } from '../BookContext';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export default function BookSelection() {
  const [books, setBooks] = useState<Book[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [newBookDescription, setNewBookDescription] = useState('');
  const { setCurrentBook } = useBook();
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    const allBooks = await getAllBooks();
    setBooks(allBooks);
  }

  async function handleCreateBook() {
    if (!newBookName.trim()) return;

    const newBook: Book = {
      id: generateId(),
      name: newBookName,
      description: newBookDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveBook(newBook);
    setNewBookName('');
    setNewBookDescription('');
    setShowCreateModal(false);
    loadBooks();
  }

  function handleSelectBook(book: Book) {
    setCurrentBook(book);
    navigate('/entities');
  }

  async function handleDeleteBook(bookId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this book? All data will be lost.')) {
      await deleteBook(bookId);
      loadBooks();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Story Bible</h1>
          <p className="text-xl text-gray-600">Your Novel Planning Companion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Book Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white rounded-lg shadow-md p-8 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] group"
          >
            <Plus className="w-16 h-16 text-purple-400 group-hover:text-purple-600 mb-4" />
            <span className="text-lg font-semibold text-gray-700">Create New Book</span>
          </button>

          {/* Existing Books */}
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => handleSelectBook(book)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-400 relative group min-h-[200px] flex flex-col"
            >
              <button
                onClick={(e) => handleDeleteBook(book.id, e)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete book"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="flex items-start mb-4">
                <BookOpen className="w-8 h-8 text-purple-500 mr-3 flex-shrink-0" />
                <h3 className="text-xl font-bold text-gray-800">{book.name}</h3>
              </div>

              {book.description && (
                <p className="text-gray-600 text-sm mb-4 flex-grow">{book.description}</p>
              )}

              <div className="text-xs text-gray-400 mt-auto">
                Created {new Date(book.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {books.length === 0 && (
          <div className="text-center mt-16 text-gray-500">
            <BookOpen className="w-24 h-24 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No books yet. Create your first story bible!</p>
          </div>
        )}
      </div>

      {/* Create Book Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Book</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Name*
              </label>
              <input
                type="text"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter book name"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newBookDescription}
                onChange={(e) => setNewBookDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
                placeholder="Brief description of your story"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBookName('');
                  setNewBookDescription('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBook}
                disabled={!newBookName.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
