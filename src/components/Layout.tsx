import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useBook } from '../BookContext';
import {
  Users,
  Clock,
  BookOpen,
  Lightbulb,
  ChevronDown,
  Home,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentBook, setCurrentBook } = useBook();
  const navigate = useNavigate();
  const location = useLocation();

  function handleChangeBook() {
    setCurrentBook(null);
    navigate('/');
  }

  const navItems = [
    { path: '/entities', icon: Users, label: 'Entities' },
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/chapters', icon: BookOpen, label: 'Chapters' },
    { path: '/brainstorm', icon: Lightbulb, label: 'Brainstorm' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-purple-600 to-purple-800 text-white flex flex-col">
        <div className="p-4 border-b border-purple-500">
          <h1 className="text-2xl font-bold mb-2">Story Bible</h1>

          <button
            onClick={handleChangeBook}
            className="w-full bg-purple-700 hover:bg-purple-600 rounded-md p-2 text-sm flex items-center justify-between transition-colors"
          >
            <div className="flex items-center overflow-hidden">
              <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{currentBook?.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-purple-700 text-white'
                        : 'text-purple-100 hover:bg-purple-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-purple-500">
          <button
            onClick={handleChangeBook}
            className="w-full px-4 py-2 text-purple-200 hover:bg-purple-700/50 rounded-md transition-colors flex items-center"
          >
            <Home className="w-4 h-4 mr-2" />
            Change Book
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
