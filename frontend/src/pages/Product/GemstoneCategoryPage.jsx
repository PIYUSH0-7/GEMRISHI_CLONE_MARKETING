import { fbqTrack } from "../../utils/metaPixel.js";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ShieldCheck,
  Gem,
  Globe,
  RotateCcw,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import WishlistButton from "../../components/wishlistButton";
import CompareButton from "../../components/compare/CompareButton";
import Price from "../../components/Price";
import { getProductDisplayPrice, getProductOriginalPrice } from "../../config/campaignOffers.config.js";
import { getProductUrl } from "../../utils/productUrl";
import { addItemToCart } from "../../redux/cartSlice";

/* ------------------------------------------------------------------ */
/*  Design tokens (taken from the GemRishi category-page mockup)       */
/* ------------------------------------------------------------------ */
const C = {
  forest: "#14352B",
  green: "#264A3F",
  gold: "#B8923A",
  cream: "#FBF6EC",
  parchment: "#F2EADA",
  ink: "#1E2A25",
};
const DISPLAY = "'Cormorant Garamond', Georgia, serif";
const PAGE_SIZE = 9;

const CARAT_BUCKETS = [
  { id: "lt2", label: "Below 2 Carat", test: (c) => c < 2 },
  { id: "2-5", label: "2 – 5 Carat", test: (c) => c >= 2 && c < 5 },
  { id: "5-10", label: "5 – 10 Carat", test: (c) => c >= 5 && c < 10 },
  { id: "gt10", label: "Above 10 Carat", test: (c) => c >= 10 },
];

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "carat-desc", label: "Carat: High to Low" },
];

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
const getUserToken = () => {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || "{}")?.token || null;
  } catch {
    return null;
  }
};

const priceOf = (p) => getProductDisplayPrice(p);
const caratOf = (p) => Number(p.carat || 0);
const isInStock = (p) =>
  p.isAvailable !== false && (p.stock === undefined || p.stock === null || p.stock > 0);
const certsOf = (p) =>
  (p.certificate || []).map((c) => c?.certificateType).filter(Boolean);
const clean = (v) => (typeof v === "string" ? v.trim() : "");

/** Build [{ key, label, count }] for a field, e.g. origin / color / shape */
const buildFacet = (products, getValues) => {
  const map = new Map();
  products.forEach((p) => {
    const seen = new Set();
    getValues(p).forEach((raw) => {
      const label = clean(raw);
      if (!label) return;
      const key = label.toLowerCase();
      if (seen.has(key)) return; // count a product once per value
      seen.add(key);
      const prev = map.get(key);
      map.set(key, { key, label: prev?.label || label, count: (prev?.count || 0) + 1 });
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count);
};

const pageList = (current, total) => {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, current - 1, current, current + 1, total]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
};

/* ------------------------------------------------------------------ */
/*  Shape icons for the shape strip                                    */
/* ------------------------------------------------------------------ */
const SHAPE_PATHS = {
  oval: <ellipse cx="20" cy="20" rx="11" ry="15" />,
  round: <circle cx="20" cy="20" r="14" />,
  cushion: <rect x="8" y="8" width="24" height="24" rx="8" />,
  emerald: <path d="M13 6h14l7 7v14l-7 7H13l-7-7V13z" />,
  pear: <path d="M20 5c6 8 12 13 12 20a12 12 0 0 1-24 0C8 18 14 13 20 5z" />,
  octagon: <path d="M14 6h12l8 8v12l-8 8H14l-8-8V14z" />,
  heart: <path d="M20 34C8 25 6 18 6 14a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 4-2 11-14 20z" />,
  default: <path d="M20 5l14 10-6 18H12L6 15z" />,
};

const ShapeIcon = ({ name, active }) => {
  const key = Object.keys(SHAPE_PATHS).find((k) => name?.toLowerCase().includes(k)) || "default";
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-7 w-7"
      fill={active ? C.green : "none"}
      fillOpacity={active ? 0.15 : 0}
      stroke={C.green}
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SHAPE_PATHS[key]}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Sidebar pieces                                                     */
/* ------------------------------------------------------------------ */
const FilterGroup = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E6DCC6] py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left text-[15px] font-semibold text-[#1E2A25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A]"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

const CheckRow = ({ label, count, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px] text-[#3b4a43]">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-[#bfb394] accent-[#264A3F]"
    />
    <span className="flex-1">{label}</span>
    <span className="text-[#8a8a7e]">({count})</span>
  </label>
);

/* ------------------------------------------------------------------ */
/*  Product card                                                       */
/* ------------------------------------------------------------------ */
const GemCard = ({ product, onAdd, adding }) => {
  const image = product.images?.[0]?.url || "/ring.png";
  const certs = certsOf(product);
  const line1 = [caratOf(product) ? `${caratOf(product)} Carat` : "", clean(product.shape)]
    .filter(Boolean)
    .join(" | ");
  const line2 = [clean(product.color), clean(product.treatment)].filter(Boolean).join(" | ");
  const stock = isInStock(product);

  return (
    <article className="flex flex-col rounded-2xl border border-[#E6DCC6] bg-white p-3 shadow-[0_1px_2px_rgba(38,74,63,0.06)]">
      <div className="relative overflow-hidden rounded-xl bg-[#F6F0E2]">
        {certs.length > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-[#264A3F]">
            <BadgeCheck className="h-3.5 w-3.5" /> Lab Certified
          </span>
        )}
        <div className="absolute right-2 top-2 z-10">
          <WishlistButton itemId={product._id} itemType="Product" product={product} />
        </div>
        <Link to={getProductUrl(product)} aria-label={`View ${product.name}`}>
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-contain p-3 mix-blend-multiply"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h3 className="text-[15px] font-semibold leading-snug text-[#1E2A25]">{product.name}</h3>
        <p className="mt-1 text-[13px] text-[#5b6a62]">{line1}</p>
        {line2 && <p className="text-[13px] text-[#5b6a62]">{line2}</p>}
        {certs[0] && <p className="text-[13px] text-[#5b6a62]">{certs[0]} Certified</p>}

        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <Price amount={priceOf(product)} className="text-[20px] font-semibold text-[#1E2A25]" />
          {getProductOriginalPrice(product) ? (
            <span className="text-sm text-gray-400 line-through">
              <Price amount={getProductOriginalPrice(product)} />
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-2">
          <Link
            to={getProductUrl(product)}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#14352B] text-[14px] font-medium text-white transition-colors hover:bg-[#0f2a20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A] focus-visible:ring-offset-2"
          >
            View Details <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={adding || !stock}
            className="h-10 w-full rounded-lg border border-[#d9cfb8] bg-white text-[14px] font-medium text-[#1E2A25] transition-colors hover:border-[#264A3F] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A]"
          >
            {!stock ? "Out of stock" : adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const EMPTY_FILTERS = {
  carat: [],
  origin: [],
  color: [],
  shape: [],
  cert: [],
  treatment: [],
  inStock: false,
};

const GemstoneCategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const API = import.meta.env.VITE_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [addingId, setAddingId] = useState(null);

  /* ---- fetch the category + its products -------------------------- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API}/subcategory/single-subcategory/${slug}`);
        if (cancelled) return;
        if (!res.data?.subcategory) {
          setError("Category not found.");
          return;
        }
        setData(res.data);
        setFilters(EMPTY_FILTERS);
        setPage(1);
      } catch (e) {
        if (!cancelled) setError("Could not load gemstones. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, API]);

  const subcategory = data?.subcategory;
  const products = useMemo(() => (Array.isArray(data?.products) ? data.products : []), [data]);

  /* ---- facets & price bounds -------------------------------------- */
  const bounds = useMemo(() => {
    const prices = products.map(priceOf).filter((n) => n > 0);
    if (!prices.length) return [0, 0];
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  useEffect(() => setPriceRange(bounds), [bounds]);

  const facets = useMemo(
    () => ({
      origin: buildFacet(products, (p) => [p.origin]),
      color: buildFacet(products, (p) => [p.color]),
      shape: buildFacet(products, (p) => [p.shape]),
      cert: buildFacet(products, certsOf),
      treatment: buildFacet(products, (p) => [p.treatment]),
    }),
    [products],
  );

  const caratCounts = useMemo(
    () =>
      CARAT_BUCKETS.map((b) => ({
        ...b,
        count: products.filter((p) => b.test(caratOf(p))).length,
      })),
    [products],
  );

  /* ---- filtering + sorting ---------------------------------------- */
  const results = useMemo(() => {
    const [lo, hi] = priceRange;
    const pick = (selected, values) =>
      !selected.length || values.some((v) => selected.includes(clean(v).toLowerCase()));

    const list = products.filter((p) => {
      const price = priceOf(p);
      if (bounds[1] && (price < lo || price > hi)) return false;
      if (
        filters.carat.length &&
        !CARAT_BUCKETS.some((b) => filters.carat.includes(b.id) && b.test(caratOf(p)))
      )
        return false;
      if (!pick(filters.origin, [p.origin || ""])) return false;
      if (!pick(filters.color, [p.color || ""])) return false;
      if (!pick(filters.shape, [p.shape || ""])) return false;
      if (!pick(filters.cert, certsOf(p))) return false;
      if (!pick(filters.treatment, [p.treatment || ""])) return false;
      if (filters.inStock && !isInStock(p)) return false;
      return true;
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === "price-desc") sorted.sort((a, b) => priceOf(b) - priceOf(a));
    else if (sort === "carat-desc") sorted.sort((a, b) => caratOf(b) - caratOf(a));
    else sorted.sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured));
    return sorted;
  }, [products, filters, priceRange, bounds, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [filters, priceRange, sort]);

  /* ---- filter actions --------------------------------------------- */
  const toggle = (group, value) =>
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(value) ? f[group].filter((v) => v !== value) : [...f[group], value],
    }));

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setPriceRange(bounds);
  };

  const priceActive = bounds[1] && (priceRange[0] > bounds[0] || priceRange[1] < bounds[1]);

  const chips = [
    ...filters.carat.map((id) => ({
      group: "carat",
      value: id,
      label: CARAT_BUCKETS.find((b) => b.id === id)?.label,
    })),
    ...["origin", "color", "shape", "cert", "treatment"].flatMap((g) =>
      filters[g].map((v) => ({
        group: g,
        value: v,
        label: facets[g].find((f) => f.key === v)?.label || v,
      })),
    ),
    ...(filters.inStock ? [{ group: "inStock", value: true, label: "In stock" }] : []),
  ];

  const removeChip = (chip) =>
    chip.group === "inStock"
      ? setFilters((f) => ({ ...f, inStock: false }))
      : toggle(chip.group, chip.value);

  /* ---- add to cart (same API the detail page uses) ----------------- */
  const handleAdd = async (product) => {
    const atcEventId = `add_to_cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const payload = { itemId: product._id, quantity: 1, customization: {}, eventId: atcEventId };
    const token = getUserToken();
    try {
      setAddingId(product._id);
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await axios.post(`${API}/cart/add_item_in_cart`, payload, {
        headers,
        withCredentials: true,
      });
      dispatch(addItemToCart(payload));
      if (res.data?.success) {
        fbqTrack(
          "AddToCart",
          {
            content_ids: [String(product.sku || product._id || "")],
            content_type: "product",
            content_name: product.name || "Gemstone",
            content_category: "Gemstone",
            value: Number(product.price) || 0,
            currency: "INR",
          },
          { eventID: atcEventId }
        );
        toast.success("Added to cart", { position: "top-center" });
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not add this item to the cart.", {
        position: "top-center",
      });
    } finally {
      setAddingId(null);
    }
  };

  /* ---- loading / error states -------------------------------------- */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FBF6EC]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#264A3F]" />
      </div>
    );
  }
  if (error || !subcategory) {
    return (
      <div className="min-h-[60vh] bg-[#FBF6EC] py-24 text-center text-[#1E2A25]">
        <p className="text-lg">{error || "Category not found."}</p>
        <Link to="/gemstone" className="mt-4 inline-block text-[#264A3F] underline">
          Browse all gemstones
        </Link>
      </div>
    );
  }

  const heroImage = subcategory.image?.url || products[0]?.images?.[0]?.url || "/ring.png";
  const topColor = facets.color[0]?.label;
  const keywords = [topColor, "Natural", "Rare", "Timeless"].filter(Boolean);
  const shapeStrip = facets.shape.slice(0, 9);

  const sidebar = (
    <aside className="rounded-2xl border border-[#E6DCC6] bg-white px-5 py-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-[17px] font-semibold text-[#1E2A25]">Filters</h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-[13px] font-medium text-[#B8923A] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A]"
        >
          Clear All
        </button>
      </div>

      {bounds[1] > 0 && (
        <FilterGroup title="Price Range">
          <div className="gr-range relative h-6">
            <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded bg-[#E6DCC6]" />
            <div
              className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded bg-[#264A3F]"
              style={{
                left: `${((priceRange[0] - bounds[0]) / (bounds[1] - bounds[0] || 1)) * 100}%`,
                right: `${100 - ((priceRange[1] - bounds[0]) / (bounds[1] - bounds[0] || 1)) * 100}%`,
              }}
            />
            <input
              type="range"
              aria-label="Minimum price"
              min={bounds[0]}
              max={bounds[1]}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])
              }
            />
            <input
              type="range"
              aria-label="Maximum price"
              min={bounds[0]}
              max={bounds[1]}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])
              }
            />
          </div>
          <div className="mt-2 flex justify-between text-[13px] text-[#3b4a43]">
            <Price amount={priceRange[0]} />
            <Price amount={priceRange[1]} />
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Carat Weight">
        {caratCounts.map((b) => (
          <CheckRow
            key={b.id}
            label={b.label}
            count={b.count}
            checked={filters.carat.includes(b.id)}
            onChange={() => toggle("carat", b.id)}
          />
        ))}
      </FilterGroup>

      {[
        ["origin", "Origin"],
        ["color", "Colour"],
        ["shape", "Shape"],
        ["cert", "Certification"],
        ["treatment", "Treatment"],
      ].map(
        ([group, title]) =>
          facets[group].length > 0 && (
            <FilterGroup key={group} title={title} defaultOpen={group === "origin" || group === "color"}>
              {facets[group].map((f) => (
                <CheckRow
                  key={f.key}
                  label={f.label}
                  count={f.count}
                  checked={filters[group].includes(f.key)}
                  onChange={() => toggle(group, f.key)}
                />
              ))}
            </FilterGroup>
          ),
      )}

      <FilterGroup title="Availability" defaultOpen={false}>
        <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px] text-[#3b4a43]">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
            className="h-4 w-4 rounded accent-[#264A3F]"
          />
          In stock only
        </label>
      </FilterGroup>
    </aside>
  );

  return (
    <div className="bg-[#FBF6EC] text-[#1E2A25]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Helmet>
        <title>{`${subcategory.name} Gemstones | GemRishi India`}</title>
        <meta
          name="description"
          content={`Buy certified natural ${subcategory.name} online from GemRishi India. Authentic gemstones with lab certificates.`}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      {/* dual-handle price slider styling */}
      <style>{`
        .gr-range input[type=range]{position:absolute;left:0;top:0;width:100%;height:100%;margin:0;background:none;pointer-events:none;-webkit-appearance:none;appearance:none}
        .gr-range input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;height:18px;width:18px;border-radius:50%;background:#14352B;border:2px solid #fff;box-shadow:0 0 0 1px #14352B;cursor:pointer}
        .gr-range input[type=range]::-moz-range-thumb{pointer-events:auto;height:16px;width:16px;border-radius:50%;background:#14352B;border:2px solid #fff;cursor:pointer}
        .gr-range input[type=range]:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px #B8923A}
      `}</style>

      {/* ------------------------------ HERO ------------------------------ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(100deg, #F6EEDC 0%, #EBE3CC 38%, #1d4a3a 72%, ${C.forest} 100%)`,
        }}
      >
        <div className="mx-auto grid max-w-[1280px] items-center gap-6 px-5 pb-8 pt-5 lg:grid-cols-[1.1fr_1fr_auto] lg:px-8">
          <div>
            <nav aria-label="Breadcrumb" className="text-[12px] text-[#5b6a62]">
              <Link to="/" className="hover:underline">Home</Link>
              <span className="mx-1.5">›</span>
              <Link to="/gemstone" className="hover:underline">Gemstones</Link>
              <span className="mx-1.5">›</span>
              <span className="text-[#1E2A25]">{subcategory.name}</span>
            </nav>

            <p className="mt-6 text-[12px] tracking-[0.18em] text-[#B8923A]">
              Natural · Certified · Timeless
            </p>
            <h1
              className="mt-2 text-[44px] font-semibold leading-[1.02] text-[#14352B] sm:text-[56px]"
              style={{ fontFamily: DISPLAY }}
            >
              Natural {subcategory.name}
            </h1>
            {subcategory.description && (
              <p className="mt-4 line-clamp-4 max-w-[460px] text-[14.5px] leading-relaxed text-[#3b4a43]">
                {subcategory.description}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <img
              src={heroImage}
              alt={subcategory.name}
              fetchPriority="high"
              className="max-h-[260px] w-auto max-w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)] lg:max-h-[300px]"
            />
          </div>

          <ul
            className="hidden gap-1 text-right text-[26px] leading-tight text-[#E3C77C] lg:grid"
            style={{ fontFamily: DISPLAY }}
          >
            {keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>

        {/* trust strip */}
        <div className="border-t border-[#d8cdb0]/60 bg-[#FBF6EC]/90">
          <ul className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-4 gap-y-3 px-5 py-3.5 text-[13px] lg:grid-cols-4 lg:px-8">
            {[
              [ShieldCheck, "Lab Certified", "SSEF, GIA, IGI & more"],
              [Gem, "100% Natural", "No synthetic stones"],
              [Globe, "Worldwide Shipping", "Insured delivery"],
              [RotateCcw, "10 Days", "Hassle-free returns"],
            ].map(([Icon, t, s]) => (
              <li key={t} className="flex items-center gap-2.5">
                <Icon className="h-6 w-6 shrink-0 text-[#B8923A]" strokeWidth={1.5} />
                <span>
                  <span className="block font-semibold text-[#1E2A25]">{t}</span>
                  <span className="text-[#5b6a62]">{s}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------- SHAPE STRIP -------------------------- */}
      {shapeStrip.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-5 pt-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, shape: [] }))}
              className="flex min-w-[64px] flex-col items-center gap-1.5 text-[12px] text-[#3b4a43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A]"
              aria-pressed={filters.shape.length === 0}
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-full border ${filters.shape.length === 0 ? "border-[#264A3F] bg-white" : "border-[#E6DCC6]"}`}
              >
                <ShapeIcon name="default" active={filters.shape.length === 0} />
              </span>
              All Shapes
            </button>
            {shapeStrip.map((s) => {
              const active = filters.shape.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, shape: active ? [] : [s.key] }))}
                  aria-pressed={active}
                  className="flex min-w-[64px] flex-col items-center gap-1.5 text-[12px] text-[#3b4a43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A]"
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full border ${active ? "border-[#264A3F] bg-white" : "border-[#E6DCC6]"}`}
                  >
                    <ShapeIcon name={s.label} active={active} />
                  </span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------------- FILTERS + PRODUCT GRID --------------------- */}
      <section className="mx-auto grid max-w-[1280px] gap-6 px-5 py-6 lg:grid-cols-[250px_1fr] lg:px-8">
        <div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="mb-3 flex h-10 items-center gap-2 rounded-lg border border-[#d9cfb8] bg-white px-4 text-[14px] font-medium lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
          <div className={`${showFilters ? "block" : "hidden"} lg:sticky lg:top-4 lg:block`}>
            {sidebar}
          </div>
        </div>

        <div>
          {/* result bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="text-[17px] font-semibold">
              {results.length} Natural {subcategory.name.replace(/\s*\(.*\)/, "")}
              {results.length === 1 ? "" : "s"}
            </h2>

            <div className="flex flex-1 flex-wrap gap-2">
              {chips.map((c) => (
                <button
                  key={`${c.group}-${c.value}`}
                  type="button"
                  onClick={() => removeChip(c)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#d9cfb8] bg-white px-2.5 py-1 text-[12px] text-[#3b4a43] hover:border-[#264A3F]"
                >
                  {c.label} <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
              {priceActive && (
                <button
                  type="button"
                  onClick={() => setPriceRange(bounds)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#d9cfb8] bg-white px-2.5 py-1 text-[12px] text-[#3b4a43] hover:border-[#264A3F]"
                >
                  Price range <X className="h-3 w-3" />
                  <span className="sr-only">Remove filter</span>
                </button>
              )}
            </div>

            <label className="flex items-center gap-2 text-[13px] text-[#5b6a62]">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-lg border border-[#d9cfb8] bg-white px-2 text-[13px] text-[#1E2A25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8923A]"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* grid */}
          {pageItems.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((p) => (
                <GemCard key={p._id} product={p} onAdd={handleAdd} adding={addingId === p._id} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-[#E6DCC6] bg-white p-10 text-center">
              <p className="text-[15px] text-[#3b4a43]">No gemstones match these filters.</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-4 rounded-lg bg-[#14352B] px-5 py-2.5 text-[14px] font-medium text-white"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* pagination */}
          {results.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <nav aria-label="Pagination" className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage === 1}
                  aria-label="Previous page"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#d9cfb8] bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {pageList(safePage, totalPages).map((n, i) =>
                  n === "…" ? (
                    <span key={`gap-${i}`} className="px-1 text-[#8a8a7e]">…</span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === safePage ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-lg border px-2 text-[14px] ${
                        n === safePage
                          ? "border-[#14352B] bg-[#14352B] text-white"
                          : "border-[#d9cfb8] bg-white text-[#1E2A25]"
                      }`}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage === totalPages}
                  aria-label="Next page"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[#d9cfb8] bg-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
              <p className="text-[13px] text-[#5b6a62]">
                Showing {(safePage - 1) * PAGE_SIZE + 1} –{" "}
                {Math.min(safePage * PAGE_SIZE, results.length)} of {results.length}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------ ABOUT ------------------------------ */}
      {(subcategory.description || subcategory.benefits?.length > 0) && (
        <section className="bg-[#F2EADA]">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-10 lg:grid-cols-[1.3fr_1fr] lg:px-8">
            <div>
              <h2 className="text-[32px] font-semibold text-[#14352B]" style={{ fontFamily: DISPLAY }}>
                About {subcategory.name}
              </h2>
              {subcategory.description && (
                <p className="mt-3 max-w-[640px] whitespace-pre-line text-[14.5px] leading-relaxed text-[#3b4a43]">
                  {subcategory.description}
                </p>
              )}
              {subcategory.benefits?.length > 0 && (
                <ul className="mt-4 grid max-w-[640px] gap-1.5 text-[14px] text-[#3b4a43]">
                  {subcategory.benefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#264A3F]" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <dl className="self-start rounded-2xl border border-[#E6DCC6] bg-white px-5 py-3 text-[14px]">
              {[
                ["Colours", facets.color.slice(0, 3).map((f) => f.label).join(", ")],
                ["Origins", facets.origin.slice(0, 3).map((f) => f.label).join(", ")],
                ["Quality", subcategory.qualityLevel],
                ["Suited for", subcategory.targetAudience],
                ["Price guide", subcategory.pricingDetails],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-[#EFE6D2] py-2.5 last:border-b-0">
                    <dt className="text-[#5b6a62]">{k}</dt>
                    <dd className="text-right font-medium text-[#1E2A25]">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </section>
      )}
    </div>
  );
};

export default GemstoneCategoryPage;