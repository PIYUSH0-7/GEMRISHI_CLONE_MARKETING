import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { getProductUrl } from "../../utils/productUrl";
import { ConvertFromINR, formatCurrency } from "../../utils/currency";
import { trackCustomEvent } from "../../utils/autoTracking";

export default function HeaderSearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_URL;

  const { currency, rates } = useSelector((s) => s.currency);
  const formatPrice = (price) =>
    formatCurrency(ConvertFromINR(Number(price) || 0, rates, currency), currency);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!isOpen || !trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${URL}/product/search?keyword=${encodeURIComponent(trimmed)}`);
        const items = res.data?.products?.length
          ? res.data.products
          : res.data?.jeweleries?.length
          ? res.data.jeweleries
          : [];
        setResults(items);

        if (items.length === 0) {
          trackCustomEvent("Search_Zero_Results", {
            search_query: trimmed,
            category: "Search Telemetry",
          });
          if (typeof window.clarity === "function") {
            window.clarity("set", "search_zero_result", trimmed.slice(0, 30));
          }
        }
      } catch (err) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, URL]);

  const handleSubmit = useCallback(
    (e) => {
      e?.preventDefault();
      const trimmed = searchQuery.trim();
      if (trimmed) {
        navigate(`/search-results?keyword=${encodeURIComponent(trimmed)}`);
        onClose();
      }
    },
    [searchQuery, navigate, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col items-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center px-5 py-4 border-b border-gray-100 gap-3">
          <Search className="w-5 h-5 text-[#1E3A34] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by gemstone, ring, jewelry..."
            className="w-full text-base outline-none text-[#111827] placeholder:text-gray-400 font-sans"
          />
          {isLoading && <Loader2 className="w-5 h-5 text-[#1E3A34] animate-spin shrink-0" />}
          {searchQuery && !isLoading && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs uppercase font-semibold text-gray-500 hover:text-gray-800 ml-2 px-2 py-1"
          >
            Esc
          </button>
        </form>

        {/* Live Results Preview */}
        {results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 pb-2">
              Top Products
            </div>
            {results.slice(0, 6).map((item) => {
              const name = item.jewelryName || item.name;
              const price = item.jewelryPrice || item.price;
              const imgUrl = item.images?.[0]?.url || item.thumbnail || "/placeholder.svg";
              return (
                <Link
                  key={item._id}
                  to={getProductUrl(item)}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#FAF9F6] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={imgUrl}
                      alt={name}
                      className="w-12 h-12 object-cover rounded border border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#111827] group-hover:text-[#1E3A34]">
                        {name}
                      </p>
                      <p className="text-xs font-semibold text-[#1E3A34]">
                        {formatPrice(price)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1E3A34] -translate-x-1 group-hover:translate-x-0 transition-all" />
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2.5 text-center text-xs font-semibold text-[#1E3A34] hover:bg-[#FAF9F6] rounded-md transition-colors"
            >
              View all results for "{searchQuery}"
            </button>
          </div>
        )}

        {/* No results prompt */}
        {!isLoading && searchQuery.trim() && results.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">
            No products found matching "{searchQuery}".
          </div>
        )}

      </div>
    </div>
  );
}
