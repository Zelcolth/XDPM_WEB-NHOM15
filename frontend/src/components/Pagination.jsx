import React from 'react';

export default function Pagination({ currentPage, totalPages, onPrev, onNext, onSelect }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        onClick={onPrev}
        className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
        disabled={totalPages <= 1}
      >
        Prev
      </button>

      <div className="flex gap-2">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onSelect && onSelect(p)}
            className={`px-3 py-1 rounded ${p === currentPage ? 'bg-orange-500 text-white' : 'bg-white border hover:bg-gray-50'}`}
          >
            {p + 1}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
        disabled={totalPages <= 1}
      >
        Next
      </button>
    </div>
  );
}
