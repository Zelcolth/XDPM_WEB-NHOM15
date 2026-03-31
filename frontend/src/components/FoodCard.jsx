import React from 'react';

function FoodCard({ item, imageUrl, onView, onQuickAdd }) {
  const priceLabel = Number(item?.price || 0).toLocaleString('vi-VN') + ' đ';
  const hasImage = Boolean(imageUrl);

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] overflow-hidden border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.12)]">
      <div className="w-full h-44 bg-slate-100">
        {hasImage ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-sm font-medium">
            Chưa có ảnh
          </div>
        )}
      </div>

      <div className="p-4 md:p-5">
        <h4 className="font-bold text-slate-900 text-xl leading-tight">{item.name}</h4>
        {item.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{item.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-red-500 font-extrabold text-2xl tracking-tight">{priceLabel}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onView && onView(item)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
            >
              Xem
            </button>

            <button
              onClick={() => onQuickAdd && onQuickAdd(item)}
              className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600"
            >
              Thêm nhanh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FoodCard);
