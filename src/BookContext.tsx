import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Book } from './types';
import { getAllBooks } from './db';

interface BookContextType {
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;
  books: Book[];
  refreshBooks: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);

  const refreshBooks = async () => {
    const allBooks = await getAllBooks();
    setBooks(allBooks);
  };

  useEffect(() => {
    refreshBooks();

    // Load the last selected book from localStorage
    const savedBookId = localStorage.getItem('currentBookId');
    if (savedBookId) {
      getAllBooks().then(allBooks => {
        const book = allBooks.find(b => b.id === savedBookId);
        if (book) {
          setCurrentBook(book);
        }
      });
    }
  }, []);

  useEffect(() => {
    // Save current book to localStorage
    if (currentBook) {
      localStorage.setItem('currentBookId', currentBook.id);
    } else {
      localStorage.removeItem('currentBookId');
    }
  }, [currentBook]);

  return (
    <BookContext.Provider value={{ currentBook, setCurrentBook, books, refreshBooks }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBook() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
}
