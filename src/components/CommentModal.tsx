import React, { useState, useEffect } from "react";
import { useAppData } from "./AppDataContext";

type CommentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  initialComment: string;
};

export default function CommentModal({ isOpen, onClose, date, initialComment }: CommentModalProps) {
  const [commentText, setCommentText] = useState(initialComment);
  const { setComment, removeComment } = useAppData();

  useEffect(() => {
    setCommentText(initialComment);
  }, [initialComment]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (commentText.trim()) {
      setComment(date, commentText.trim());
    } else {
      removeComment(date);
    }
    onClose();
  };

  const handleRemove = () => {
    removeComment(date);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Komentarz dla {formatDate(date)}
        </h2>
        
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Wpisz komentarz dla tego dnia..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Zapisz
          </button>
          
          {commentText.trim() && (
            <button
              onClick={handleRemove}
              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Usuń
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
