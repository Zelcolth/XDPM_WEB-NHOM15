import React from 'react';

export default function FoodCard({ item, imageUrl, onView, onQuickAdd }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="w-full h-40 bg-gray-100">
        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-4">
        <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
        {item.description && (
          <p className="text-sm text-gray-500 mt-2">{item.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-red-500 font-extrabold">{item.price ? item.price + ' ₫' : ''}</div>

          <div className="flex gap-2">
            <button
              onClick={() => onView && onView(item)}
              className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
            >
              Xem
            </button>

            <button
              onClick={() => onQuickAdd && onQuickAdd(item)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Thêm nhanh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
