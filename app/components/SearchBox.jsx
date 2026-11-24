"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight, PackageSearch } from "lucide-react";
import { api } from "../../lib/api";

const MAX_RESULTS = 6;

const productHref = (p) => `/product/${p.slug || p.product_id || p.id}`;
const productImage = (p) => p.first_image || p.images?.[0]?.image || "/placeholder.png";

function getPrices(p) {
  const price = parseFloat(p.price) || parseFloat(p.unit_price) || 0;
  const discounted = parseFloat(p.discounted_price) || 0;
  const hasDiscount = discounted > 0 && discounted < price;
  return { current: hasDiscount ? discounted : price, original: hasDiscount ? price : null };
}

function Highlight({ text = "", query }) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent text-[#FA8B24] font-semibold">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

/**
 * Product search with live suggestions.
 * variant "desktop": pill input with floating dropdown.
 * variant "mobile": full-width input with inline results.
 */
export default function SearchBox({ variant = "desktop", onNavigate }) {
  const router = useRouter();
  const isDesktop = variant === "desktop";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = query.trim();

  // Debounced fetch; ignores responses that arrive after the query changed
  useEffect(() => {
    if (!trimmed) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({ search: trimmed, page_size: MAX_RESULTS });
        const list = Array.isArray(res) ? res : res?.data || res?.results || [];
        if (!cancelled) {
          setResults(list.slice(0, MAX_RESULTS));
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!isDesktop) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isDesktop]);

  // Press "/" anywhere to jump to the search bar
  useEffect(() => {
    if (!isDesktop) return;
    const handleKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isDesktop]);

  const finish = () => {
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    onNavigate?.();
  };

  const goToResults = () => {
    if (!trimmed) return;
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    finish();
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (!e.target.value.trim()) {
      setResults([]);
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setLoading(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i <= 0 ? results.length - 1 : i - 1) : -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      e.preventDefault();
      router.push(productHref(results[activeIndex]));
      setQuery("");
      finish();
    }
  };

  const showPanel = (isDesktop ? open : true) && trimmed;

  return (
    <div ref={wrapperRef} className={isDesktop ? "relative w-full" : "w-full"}>
      <form
        onSubmit={(e) => { e.preventDefault(); goToResults(); }}
        role="search"
        className={`group flex items-center w-full bg-gray-50 border border-gray-200 transition-all focus-within:bg-white focus-within:border-[#FA8B24] focus-within:ring-4 focus-within:ring-[#FA8B24]/15 ${
          isDesktop ? "rounded-full h-11 pl-4 pr-1.5" : "rounded-xl h-12 pl-3 pr-1.5"
        }`}
      >
        <Search size={18} className="text-gray-400 shrink-0 group-focus-within:text-[#FA8B24] transition-colors" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products, brands and categories"
          aria-label="Search products"
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent px-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none [&::-webkit-search-cancel-button]:hidden"
        />

        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="p-1.5 mr-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {isDesktop && !query && (
          <kbd className="hidden lg:flex items-center justify-center mr-2 h-6 min-w-6 px-1.5 rounded-md border border-gray-200 bg-white text-[11px] font-semibold text-gray-400">
            /
          </kbd>
        )}

        <button
          type="submit"
          aria-label="Search"
          className={`shrink-0 flex items-center justify-center gap-1.5 bg-[#FA8B24] hover:bg-[#E87A13] text-white font-semibold text-sm transition-colors ${
            isDesktop ? "h-8 px-5 rounded-full" : "h-9 w-9 rounded-lg"
          }`}
        >
          {isDesktop ? "Search" : <Search size={16} />}
        </button>
      </form>

      {showPanel && (
        <div
          className={
            isDesktop
              ? "absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-gray-200/70 border border-gray-100 overflow-hidden z-[60]"
              : "mt-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          }
        >
          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin text-[#FA8B24]" /> Searching…
            </div>
          ) : results.length === 0 ? (
            !loading && (
              <div className="flex flex-col items-center gap-2 p-6 text-center">
                <PackageSearch size={28} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-700">No products found for “{trimmed}”</p>
                <p className="text-xs text-gray-400">Try a different keyword or browse the shop.</p>
              </div>
            )
          ) : (
            <>
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Products</span>
                {loading && <Loader2 size={14} className="animate-spin text-[#FA8B24]" />}
              </div>
              <ul role="listbox" className="pb-2">
                {results.map((product, i) => {
                  const { current, original } = getPrices(product);
                  const category = product.category?.name || (typeof product.category === "string" ? product.category : null);
                  return (
                    <li key={product.slug || product.product_id || product.id} role="option" aria-selected={i === activeIndex}>
                      <Link
                        href={productHref(product)}
                        onClick={() => { setQuery(""); finish(); }}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${i === activeIndex ? "bg-orange-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 shrink-0 overflow-hidden p-1">
                          <img
                            src={productImage(product)}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">
                            <Highlight text={product.name} query={trimmed} />
                          </p>
                          {(category || product.unit) && (
                            <p className="text-xs text-gray-400 truncate">
                              {[category, product.unit].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">৳{current.toLocaleString()}</p>
                          {original && <p className="text-[11px] text-gray-400 line-through">৳{original.toLocaleString()}</p>}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <button
            type="button"
            onClick={goToResults}
            className="w-full flex items-center justify-center gap-1.5 border-t border-gray-100 px-4 py-3 text-sm font-semibold text-[#FA8B24] hover:bg-orange-50 transition-colors"
          >
            See all results for “{trimmed}” <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
