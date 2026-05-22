import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';

interface Book {
  id: string;
  title: string;
  author: string;
  format: string;
  path: string;
  fileSize: number;
  addedAt: string;
  progress: number;
}

type ViewType = 'bookshelf' | 'detail';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('bookshelf');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const savedBooks = await invoke<Book[]>('load_books');
      setBooks(savedBooks);
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const handleImportBook = async () => {
    setIsLoading(true);
    try {
      const newBook = await invoke<Book>('import_book');
      if (newBook) {
        setBooks(prev => [...prev, newBook]);
      }
    } catch (error) {
      console.error('Failed to import book:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setCurrentView('detail');
  };

  const handleBackToShelf = () => {
    setSelectedBook(null);
    setCurrentView('bookshelf');
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await invoke('delete_book', { bookId });
      setBooks(prev => prev.filter(b => b.id !== bookId));
      handleBackToShelf();
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">阅 读 器</h1>
          <p className="app-subtitle">Tiny Reader</p>
        </div>
        
        <nav className="nav-menu">
          <div
            className={`nav-item ${currentView === 'bookshelf' ? 'active' : ''}`}
            onClick={() => { setCurrentView('bookshelf'); setSelectedBook(null); }}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              </svg>
            </span>
            书 架
          </div>
          <div
            className={`nav-item ${currentView === 'detail' ? 'active' : ''}`}
            onClick={() => selectedBook && setCurrentView('detail')}
            style={{ opacity: selectedBook ? 1 : 0.5 }}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
            详细内容
          </div>
        </nav>

        <div className="sidebar-footer">
          <p className="book-count">
            馆藏 <strong>{books.length}</strong> 本书籍
          </p>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h2 className="page-title">
            {currentView === 'bookshelf' ? '我的书架' : '书籍详情'}
          </h2>
          <div className="header-actions">
            {currentView === 'bookshelf' && (
              <button 
                className="btn btn-primary" 
                onClick={handleImportBook}
                disabled={isLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14"/>
                  <path d="M5 12h14"/>
                </svg>
                {isLoading ? '导入中...' : '导入书籍'}
              </button>
            )}
            {currentView === 'detail' && (
              <button className="btn btn-secondary" onClick={handleBackToShelf}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                返回书架
              </button>
            )}
          </div>
        </header>

        <div className="content-body">
          {currentView === 'bookshelf' && (
            <>
              {books.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    </svg>
                  </div>
                  <h3 className="empty-title">书架空空如也</h3>
                  <p className="empty-description">
                    点击右上角的「导入书籍」按钮，添加你的第一本书开始阅读之旅
                  </p>
                  <button className="btn btn-primary" onClick={handleImportBook} disabled={isLoading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14"/>
                      <path d="M5 12h14"/>
                    </svg>
                    导入书籍
                  </button>
                </div>
              ) : (
                <div className="bookshelf">
                  {books.map((book) => (
                    <div 
                      key={book.id} 
                      className="book-card"
                      onClick={() => handleBookClick(book)}
                    >
                      <div className="book-cover">
                        <div className="book-cover-text">
                          {book.title.slice(0, 2)}
                        </div>
                      </div>
                      <div className="book-info">
                        <div className="book-title" title={book.title}>
                          {book.title}
                        </div>
                        <div className="book-author">{book.author}</div>
                        <div className="book-meta">
                          <span className="book-format">{book.format}</span>
                          <span className="book-progress">{book.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {currentView === 'detail' && selectedBook && (
            <div className="detail-view">
              <div className="detail-cover">
                <div className="book-cover">
                  <div className="book-cover-text" style={{ fontSize: '32px' }}>
                    {selectedBook.title.slice(0, 2)}
                  </div>
                </div>
              </div>
              <div className="detail-info">
                <h2 className="detail-title">{selectedBook.title}</h2>
                <p className="detail-author">{selectedBook.author}</p>
                
                <div className="detail-meta">
                  <div className="meta-item">
                    <span className="meta-label">文件格式</span>
                    <span className="meta-value">{selectedBook.format.toUpperCase()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">文件大小</span>
                    <span className="meta-value">{formatFileSize(selectedBook.fileSize)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">导入时间</span>
                    <span className="meta-value">{formatDate(selectedBook.addedAt)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">阅读进度</span>
                    <span className="meta-value">{selectedBook.progress}%</span>
                  </div>
                  <div className="meta-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="meta-label">文件路径</span>
                    <span className="meta-value" style={{ fontSize: '13px', wordBreak: 'break-all' }}>
                      {selectedBook.path}
                    </span>
                  </div>
                </div>

                <div className="detail-actions">
                  <button className="btn btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    开始阅读
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleDeleteBook(selectedBook.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    删除书籍
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
