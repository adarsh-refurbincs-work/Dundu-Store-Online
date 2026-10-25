import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, PackagePlus, X, Search, Check, Copy,
  ArrowUp, ArrowDown, Layers, Tag, AlertTriangle, ImagePlus, ShoppingBag, Percent,
} from 'lucide-react';
import { comboApi, productApi } from '../../../api';
import Button from '../../../components/ui/Button';
import Input, { Textarea } from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import Spinner from '../../../components/ui/Spinner';
import StatCard from '../../../components/ui/StatCard';
import Badge from '../../../components/ui/Badge';
import ImageCropperModal from '../../../components/ui/ImageCropperModal';
import toast from 'react-hot-toast';
import { Palette as PaletteIcon, ImagePlus as ImagePlusIcon, X as XIcon } from 'lucide-react';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const unit = (p) => (Number(p?.offer_price) > 0 ? Number(p.offer_price) : Number(p?.price) || 0);
const savingsPct = (regular, bundle) => (regular > 0 && bundle < regular ? Math.round(((regular - bundle) / regular) * 100) : 0);

function Thumb({ src, name, size = 'w-9 h-9', rounded = 'rounded-lg' }) {
  return src
    ? <img src={src} alt="" className={`${size} ${rounded} object-cover shrink-0 border border-gray-100 bg-gray-50`} />
    : <div className={`${size} ${rounded} bg-violet-100 text-violet-600 font-bold text-xs flex items-center justify-center shrink-0`}>{(name || '?')[0]}</div>;
}

// ── Product picker: browse + search, multi-select with thumbnails ─────────────
function ProductPicker({ selected, onChange, allProducts }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState(null);

  // Server-side search once the local 200 don't cover it (debounced; results kept per query).
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return undefined;
    let alive = true;
    const t = setTimeout(() => {
      productApi.list({ search: term, limit: 50 })
        .then((r) => { if (alive) setRemote({ term, items: r?.data?.products || [] }); })
        .catch(() => {});
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [query]);

  const q = query.trim().toLowerCase();
  const pool = useMemo(() => {
    const map = new Map();
    const remoteItems = remote?.term === query.trim() ? remote.items : [];
    [...allProducts, ...remoteItems].forEach((p) => { if (!p.is_hidden) map.set(p.id, p); });
    return [...map.values()];
  }, [allProducts, remote, query]);
  const results = pool.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.product_code || '').toLowerCase().includes(q)).slice(0, 40);

  const isSel = (id) => selected.some((x) => x.id === id);
  const toggle = (p) => {
    if (isSel(p.id)) onChange(selected.filter((x) => x.id !== p.id));
    else onChange([...selected, { id: p.id, name: p.name, image: p.primary_image || p.image || null, price: p.price, offer_price: p.offer_price, stock: p.stock }]);
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {selected.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2.5 px-2.5 py-2">
              <span className="text-[10px] font-bold text-gray-400 w-4">{i + 1}</span>
              <Thumb src={p.image} name={p.name} size="w-8 h-8" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400">{inr(unit(p))}{Number(p.stock) <= 0 ? ' · out of stock' : ''}</p>
              </div>
              <button type="button" onClick={() => toggle(p)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          placeholder={selected.length ? 'Add another option…' : 'Search or browse products…'}
          className="w-full pl-8 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-white"
        />
        {open && (
          <button type="button" onClick={() => { setOpen(false); setQuery(''); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label="Close list"><X className="h-3.5 w-3.5" /></button>
        )}
      </div>
      {open && (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 bg-white shadow-sm">
          {results.map((p) => {
            const sel = isSel(p.id);
            return (
              <button type="button" key={p.id} onClick={() => toggle(p)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${sel ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                <Thumb src={p.primary_image || p.image} name={p.name} size="w-8 h-8" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{inr(unit(p))} · stock {p.stock ?? 0}{p.sku ? ` · ${p.sku}` : ''}</p>
                </div>
                {sel ? <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> : <Plus className="h-3.5 w-3.5 text-gray-300 shrink-0" />}
              </button>
            );
          })}
          {results.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No products match “{query}”</p>}
        </div>
      )}
    </div>
  );
}

// ── Slot builder ──────────────────────────────────────────────────────────────
function SlotEditor({ slots, setSlots, allProducts }) {
  const addSlot = () => setSlots((prev) => [...prev, { slot_label: '', requires_selection: true, products: [] }]);
  const removeSlot = (i) => setSlots((prev) => prev.filter((_, j) => j !== i));
  const updateSlot = (i, key, val) => setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, [key]: val } : s)));
  const move = (i, dir) => setSlots((prev) => {
    const j = i + dir; if (j < 0 || j >= prev.length) return prev;
    const next = [...prev]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Layers className="h-4 w-4 text-violet-600" /> Bundle slots</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Each slot is one item in the bundle. Add several products to a slot to let the customer pick one.</p>
        </div>
        <Button type="button" size="xs" variant="outline" onClick={addSlot}><Plus className="h-3.5 w-3.5" /> Add slot</Button>
      </div>

      {slots.length === 0 && (
        <button type="button" onClick={addSlot} className="w-full text-xs text-gray-500 text-center py-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-violet-300 hover:text-violet-700 transition-colors">
          No slots yet — click to add the first item of this bundle
        </button>
      )}

      <div className="space-y-3">
        {slots.map((slot, i) => (
          <div key={slot.id || `new-${i}`} className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <input
                value={slot.slot_label}
                onChange={(e) => updateSlot(i, 'slot_label', e.target.value)}
                placeholder="Slot label, e.g. Kurta, Dupatta, Earrings"
                className="flex-1 border border-violet-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-violet-500 bg-white"
              />
              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded text-gray-400 hover:text-violet-700 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slots.length - 1} className="p-1 rounded text-gray-400 hover:text-violet-700 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => removeSlot(i)} className="p-1 rounded text-gray-400 hover:text-red-500" aria-label="Remove slot"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <button type="button" role="switch" aria-checked={slot.requires_selection}
                onClick={() => updateSlot(i, 'requires_selection', !slot.requires_selection)}
                className={`w-9 h-5 rounded-full relative transition-colors ${slot.requires_selection ? 'bg-violet-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${slot.requires_selection ? 'left-4' : 'left-0.5'}`} />
              </button>
              <span className="text-xs text-gray-700">{slot.requires_selection ? 'Customer picks size / colour' : 'Auto-included, no choice needed'}</span>
            </label>

            <ProductPicker selected={slot.products} onChange={(prods) => updateSlot(i, 'products', prods)} allProducts={allProducts} />
            {slot.products.length > 1 && <p className="text-[11px] text-violet-700">Customer will choose one of {slot.products.length} options.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Create / edit modal ───────────────────────────────────────────────────────
function ComboModal({ editing, duplicateOf, allProducts, onClose, onSaved }) {
  const source = editing || duplicateOf;
  const isEdit = !!editing;
  const [form, setForm] = useState({
    name: source ? (duplicateOf ? `${source.name} (copy)` : source.name) : '',
    description: source?.description || '',
    price: source?.price || '',
    offer_price: source?.offer_price || '',
    stock: source?.stock ?? 100,
    sort_order: source?.sort_order ?? 0,
  });
  const [slots, setSlots] = useState(
    (source?.slots || []).map((s) => ({
      id: isEdit ? s.id : undefined, // duplicates get fresh slots
      slot_label: s.slot_label,
      requires_selection: s.requires_selection !== false,
      products: (s.products || []).map((p) => ({ id: p.id, name: p.name, image: p.image, price: p.price, offer_price: p.offer_price, stock: p.stock })),
    }))
  );
  // Gallery: [{ url }] for saved images, [{ file, preview }] for new ones. First = cover.
  const [gallery, setGallery] = useState(() => {
    const urls = source?.images?.length ? source.images : (source?.image_url ? [source.image_url] : []);
    return urls.map((url) => ({ url, preview: url }));
  });
  const [cropper, setCropper] = useState({ isOpen: false, src: null });
  const [cropQueue, setCropQueue] = useState([]); // remaining picked files waiting for the cropper
  const moveImage = (i, dir) => setGallery((g) => { const j = i + dir; if (j < 0 || j >= g.length) return g; const n = [...g]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const removeImageAt = (i) => setGallery((g) => g.filter((_, k) => k !== i));
  const openNextCrop = (queue) => {
    const [next, ...rest] = queue;
    setCropQueue(rest);
    if (!next) { setCropper({ isOpen: false, src: null }); return; }
    const reader = new FileReader();
    reader.onload = () => setCropper({ isOpen: true, src: reader.result });
    reader.readAsDataURL(next);
  };
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const regularTotal = slots.reduce((sum, s) => sum + unit(s.products[0]), 0);
  const bundle = Number(form.offer_price) > 0 ? Number(form.offer_price) : Number(form.price) || 0;
  const pct = savingsPct(regularTotal, bundle);

  const onPickImage = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    openNextCrop(files); // each picked file goes through the 4:3 cropper in turn
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = 'Give the combo a name';
    if (!(Number(form.price) > 0)) er.price = 'Enter a price above 0';
    if (form.offer_price !== '' && Number(form.offer_price) > 0 && Number(form.offer_price) >= Number(form.price)) er.offer_price = 'Offer price must be lower than the price';
    if (form.stock !== '' && (Number(form.stock) < 0 || !Number.isInteger(Number(form.stock)))) er.stock = 'Whole number, 0 or more';
    if (slots.length === 0) er.slots = 'Add at least one slot';
    else if (slots.some((s) => !s.slot_label.trim())) er.slots = 'Every slot needs a label';
    else if (slots.some((s) => s.products.length === 0)) er.slots = 'Every slot needs at least one product';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the highlighted fields'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('offer_price', form.offer_price || '');
      fd.append('stock', form.stock === '' ? 100 : form.stock);
      fd.append('sort_order', form.sort_order || 0);
      fd.append('slots', JSON.stringify(slots.map((s) => ({ id: s.id, slot_label: s.slot_label.trim(), requires_selection: s.requires_selection, products: s.products.map((p) => p.id) }))));
      // Gallery: exact order; saved images by url, new files by their index in `images`
      let newIdx = 0;
      const order = gallery.map((g) => (g.file ? { new: newIdx++ } : { url: g.url }));
      gallery.forEach((g) => { if (g.file) fd.append('images', g.file); });
      fd.append('images_order', JSON.stringify(order));
      if (isEdit) await comboApi.update(editing.id, fd);
      else await comboApi.create(fd);
      toast.success(isEdit ? 'Combo updated' : 'Combo created');
      onSaved();
    } catch (err) {
      toast.error(err?.message || 'Could not save combo');
    } finally { setLoading(false); }
  };

  return (
    <Modal title={isEdit ? 'Edit combo' : duplicateOf ? 'Duplicate combo' : 'Create combo'} onClose={onClose} size="xl">
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">
          <section className="space-y-3">
            <Input label="Combo name" value={form.name} onChange={set('name')} error={errors.name} placeholder="e.g. Festive Kurta Set" />
            <Textarea label="Description" value={form.description} onChange={set('description')} rows={2} placeholder="What's in the bundle and who it's for" />
          </section>

          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input label="Price (₹)" type="number" min="1" step="1" value={form.price} onChange={set('price')} error={errors.price} />
            <Input label="Offer price (₹)" type="number" min="0" step="1" value={form.offer_price} onChange={set('offer_price')} error={errors.offer_price} placeholder="Optional" />
            <Input label="Stock" type="number" min="0" step="1" value={form.stock} onChange={set('stock')} error={errors.stock} />
            <Input label="Sort order" type="number" step="1" value={form.sort_order} onChange={set('sort_order')} />
          </section>

          <section>
            <div className="rounded-xl border border-gray-200 p-4">
              <SlotEditor slots={slots} setSlots={setSlots} allProducts={allProducts} />
              {errors.slots && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{errors.slots}</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Images</p>
              {gallery.length > 0 && <span className="text-[10px] text-gray-400">{gallery.length} photo{gallery.length === 1 ? '' : 's'} · first is the cover</span>}
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center">
              {gallery[0] ? <img src={gallery[0].preview} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="h-8 w-8 text-gray-300" />}
              {gallery[0] && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">Cover</span>}
            </div>
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {gallery.map((g, i) => (
                  <div key={g.url || g.preview} className={`relative group aspect-square rounded-lg overflow-hidden border ${i === 0 ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-gray-200'}`}>
                    <img src={g.preview} alt="" className="w-full h-full object-cover" />
                    {g.file && <span className="absolute top-0.5 left-0.5 text-[8px] font-bold px-1 rounded bg-emerald-600 text-white">NEW</span>}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" title="Move left" onClick={() => moveImage(i, -1)} disabled={i === 0} className="text-white text-[11px] font-bold px-1 disabled:opacity-30">‹</button>
                      <button type="button" title="Remove" onClick={() => removeImageAt(i)} className="text-rose-300 text-[11px] font-bold px-1">✕</button>
                      <button type="button" title="Move right" onClick={() => moveImage(i, 1)} disabled={i === gallery.length - 1} className="text-white text-[11px] font-bold px-1 disabled:opacity-30">›</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="block mt-2">
              <span className="block text-center text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">+ Add images</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onPickImage} className="hidden" />
            </label>
            <p className="text-[10px] text-gray-400 mt-1.5">Pick several at once — each is cropped to 4:3 in turn. Drag order with ‹ ›; the first image is the cover shown on cards.</p>
          </div>

          <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700 mb-2">Customer sees</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">{inr(bundle)}</span>
              {Number(form.offer_price) > 0 && <span className="text-sm text-gray-400 line-through">{inr(form.price)}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-1">Bought separately: <span className="font-semibold text-gray-700">{inr(regularTotal)}</span></p>
            {pct > 0
              ? <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1"><Percent className="h-3 w-3" /> Saves {pct}% ({inr(regularTotal - bundle)})</p>
              : regularTotal > 0 && bundle > 0 && <p className="text-xs font-semibold text-amber-700 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Bundle is not cheaper than buying separately</p>}
            <ul className="mt-3 space-y-1">
              {slots.map((s, i) => (
                <li key={i} className="text-xs text-gray-600 flex justify-between gap-2">
                  <span className="truncate">{s.slot_label || `Slot ${i + 1}`}{s.products.length > 1 ? ` · ${s.products.length} options` : ''}</span>
                  <span className="text-gray-400 shrink-0">{s.products[0] ? inr(unit(s.products[0])) : '—'}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" loading={loading} fullWidth>{isEdit ? 'Save changes' : 'Create combo'}</Button>
            <Button type="button" variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          </div>
        </aside>
      </form>

      <ImageCropperModal
        isOpen={cropper.isOpen}
        imageSrc={cropper.src}
        aspectRatio={4 / 3}
        allowRatioSwitch={false}
        previewType="combo"
        itemName={form.name}
        price={bundle}
        originalPrice={regularTotal > bundle ? regularTotal : null}
        fileNamePrefix="combo"
        onClose={() => { setCropper({ isOpen: false, src: null }); setCropQueue([]); }}
        onSkipCrop={() => { setCropper({ isOpen: false, src: null }); openNextCrop(cropQueue); }}
        onCropComplete={(file, url) => { setGallery((g) => [...g, { file, preview: url }]); openNextCrop(cropQueue); }}
      />
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const COMBO_THEME_PRESETS = [
  { name: 'Dundu Pink', primary: '#e91e8c', bg: '#1a0a12' },
  { name: 'Royal Violet', primary: '#8b5cf6', bg: '#120a1f' },
  { name: 'Festive Gold', primary: '#f59e0b', bg: '#1a1205' },
  { name: 'Emerald', primary: '#22c55e', bg: '#040d04' },
  { name: 'Ocean', primary: '#0ea5e9', bg: '#06131c' },
  { name: 'Ruby', primary: '#ef4444', bg: '#1c0606' },
  { name: 'Coral', primary: '#fb7185', bg: '#1f0a10' },
  { name: 'Slate', primary: '#94a3b8', bg: '#0b0f14' },
];

// Icon image + theme for the "Combos" circle in the web/mobile category strip,
// and the theme applied while browsing combos — mirrors the per-category theme editor.
function ComboAppearanceCard() {
  const { data, isLoading } = useQuery({ queryKey: ['combo-appearance'], queryFn: comboApi.getAppearance });
  const saved = data?.data?.appearance;
  if (isLoading || !saved) {
    return <div className="bg-white rounded-2xl border border-gray-200 p-5"><Spinner /></div>;
  }
  // Re-mount the form whenever the saved values change so its state re-initialises from them.
  return <ComboAppearanceForm key={JSON.stringify(saved)} saved={saved} />;
}

function ComboAppearanceForm({ saved }) {
  const qc = useQueryClient();
  const [themeEnabled, setThemeEnabled] = useState(!!saved.theme_enabled);
  const [themeColor, setThemeColor] = useState(saved.theme_color || '#e91e8c');
  const [themeBgColor, setThemeBgColor] = useState(saved.theme_bg_color || '#1a0a12');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(saved.icon_url || null);
  const [removeIcon, setRemoveIcon] = useState(false);
  const [cropper, setCropper] = useState({ isOpen: false, src: null });
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(saved.page_bg_url || null);
  const [removeBg, setRemoveBg] = useState(false);
  const [bgCropper, setBgCropper] = useState({ isOpen: false, src: null });
  const pickBg = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image (JPEG, PNG, WebP)'); return; }
    const reader = new FileReader();
    reader.onload = () => setBgCropper({ isOpen: true, src: reader.result });
    reader.readAsDataURL(file);
  };
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const mark = (fn) => (...a) => { fn(...a); setDirty(true); };
  const pickIcon = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image (JPEG, PNG, WebP)'); return; }
    const reader = new FileReader();
    reader.onload = () => setCropper({ isOpen: true, src: reader.result });
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (iconFile) fd.append('icon', iconFile);
      if (removeIcon && !iconFile) fd.append('remove_icon', 'true');
      if (bgFile) fd.append('bg_image', bgFile);
      if (removeBg && !bgFile) fd.append('remove_bg_image', 'true');
      fd.append('theme_enabled', themeEnabled);
      fd.append('theme_color', themeColor);
      fd.append('theme_bg_color', themeBgColor);
      await comboApi.updateAppearance(fd);
      qc.invalidateQueries({ queryKey: ['combo-appearance'] });
      toast.success('Combo appearance saved — live on web & app');
    } catch (e) { toast.error(e?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><PaletteIcon className="h-4 w-4 text-violet-600" /> Combo icon &amp; theme</h2>
          <p className="text-xs text-gray-400 mt-0.5">How the "Combos" circle looks in the category strip, and the colours shoppers see while browsing combos — same as a category theme.</p>
        </div>
        <Button size="sm" onClick={save} loading={saving} disabled={!dirty && !iconFile && !removeIcon && !bgFile && !removeBg}>Save appearance</Button>
      </div>

      {(
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          {/* Icon */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-gray-700">Strip icon (1:1)</span>
            <label className="group relative w-28 h-28 rounded-full border-2 border-dashed border-gray-300 hover:border-violet-400 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50"
              style={{ borderColor: themeEnabled ? themeColor : undefined }}>
              {iconPreview && !removeIcon
                ? <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                : <span className="text-3xl">🎀</span>}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { pickIcon(e.target.files?.[0]); e.target.value = ''; }} />
              <span className="absolute inset-0 bg-black/55 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                <ImagePlusIcon className="h-3.5 w-3.5" /> Change
              </span>
            </label>
            {iconPreview && !removeIcon && (
              <button type="button" onClick={() => { setRemoveIcon(true); setIconFile(null); setDirty(true); }} className="text-xs text-rose-600 hover:underline flex items-center gap-1">
                <XIcon className="h-3 w-3" /> Remove icon (use default 🎀)
              </button>
            )}
            <p className="text-[11px] text-gray-400">Shown as a round icon beside the categories on web and mobile.</p>

            {/* Page background */}
            <span className="block text-xs font-semibold text-gray-700 pt-2">Combo page background</span>
            <label className="group relative block w-full aspect-[16/9] rounded-xl border-2 border-dashed border-gray-300 hover:border-violet-400 overflow-hidden bg-gray-50 cursor-pointer">
              {bgPreview && !removeBg
                ? <img src={bgPreview} alt="" className="w-full h-full object-cover" />
                : <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400 text-[11px] font-semibold"><ImagePlusIcon className="h-4 w-4" /> Add background</span>}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { pickBg(e.target.files?.[0]); e.target.value = ''; }} />
              {bgPreview && !removeBg && (
                <span className="absolute inset-0 bg-black/55 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                  <ImagePlusIcon className="h-3.5 w-3.5" /> Change
                </span>
              )}
            </label>
            {bgPreview && !removeBg && (
              <button type="button" onClick={() => { setRemoveBg(true); setBgFile(null); setDirty(true); }} className="text-xs text-rose-600 hover:underline flex items-center gap-1">
                <XIcon className="h-3 w-3" /> Remove background
              </button>
            )}
            <p className="text-[11px] text-gray-400">Shown behind the combo list on web and in the app, dimmed so cards stay readable.</p>
          </div>

          {/* Theme */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-gray-800">Custom combo theme &amp; colours</p>
                <p className="text-[11px] text-gray-500">When on, the store switches to these colours while shoppers browse combos.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" checked={themeEnabled} onChange={mark((e) => setThemeEnabled(e.target.checked))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {themeEnabled && (
              <>
                <div>
                  <span className="block text-xs font-semibold text-gray-700 mb-2">Quick presets</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COMBO_THEME_PRESETS.map((p) => {
                      const sel = themeColor.toLowerCase() === p.primary.toLowerCase();
                      return (
                        <button key={p.name} type="button" onClick={mark(() => { setThemeColor(p.primary); setThemeBgColor(p.bg); })}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${sel ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200 hover:border-gray-300'}`}>
                          <span className="w-4 h-4 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: p.primary }} />
                          <span className="text-xs font-medium text-gray-800 truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[['Primary accent colour', themeColor, setThemeColor], ['Dark background hue', themeBgColor, setThemeBgColor]].map(([label, val, setter]) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                      <div className="flex items-center gap-2.5">
                        <input type="color" value={val} onChange={mark((e) => setter(e.target.value))} className="w-10 h-10 rounded-xl border border-gray-300 p-0.5 cursor-pointer bg-white shrink-0" />
                        <input type="text" value={val} onChange={mark((e) => setter(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono uppercase bg-white outline-none focus:border-violet-500" />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Live preview */}
                <div className="rounded-2xl p-4 flex items-center gap-4 border bg-cover bg-center" style={{ backgroundColor: themeBgColor, borderColor: themeColor + '55', backgroundImage: bgPreview && !removeBg ? `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${bgPreview})` : undefined }}>
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2" style={{ borderColor: themeColor, backgroundColor: themeColor + '25' }}>
                    {iconPreview && !removeIcon ? <img src={iconPreview} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">🎀</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: themeColor }}>Combos</p>
                    <p className="text-[11px] text-white/70">Preview of the strip circle and combo page colours</p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: themeColor }}>View Combo →</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ImageCropperModal
        isOpen={cropper.isOpen}
        imageSrc={cropper.src}
        aspectRatio={1}
        allowRatioSwitch={false}
        fileNamePrefix="combo-icon"
        onClose={() => setCropper({ isOpen: false, src: null })}
        onCropComplete={(file, url) => { setIconFile(file); setIconPreview(url); setRemoveIcon(false); setDirty(true); setCropper({ isOpen: false, src: null }); }}
      />
      <ImageCropperModal
        isOpen={bgCropper.isOpen}
        imageSrc={bgCropper.src}
        aspectRatio={16 / 9}
        allowRatioSwitch
        fileNamePrefix="combo-bg"
        onClose={() => setBgCropper({ isOpen: false, src: null })}
        onCropComplete={(file, url) => { setBgFile(file); setBgPreview(url); setRemoveBg(false); setDirty(true); setBgCropper({ isOpen: false, src: null }); }}
      />
    </div>
  );
}

export default function Combos() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit' | 'duplicate', combo }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('order');

  const { data: comboData, isLoading } = useQuery({ queryKey: ['admin-combos'], queryFn: comboApi.list });
  const { data: productData } = useQuery({ queryKey: ['admin-products-all'], queryFn: () => productApi.list({ limit: 200 }), staleTime: 5 * 60 * 1000 });

  const combos = comboData?.data?.combos || [];
  const allProducts = productData?.data?.products || [];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = combos.filter((c) =>
      (status === 'all' || (status === 'active' ? c.is_active : !c.is_active)) &&
      (!q || c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q) ||
        (c.slots || []).some((s) => s.slot_label.toLowerCase().includes(q) || (s.products || []).some((p) => p.name.toLowerCase().includes(q)))));
    const bundle = (c) => (Number(c.offer_price) > 0 ? Number(c.offer_price) : Number(c.price));
    if (sort === 'price_asc') list = [...list].sort((a, b) => bundle(a) - bundle(b));
    if (sort === 'price_desc') list = [...list].sort((a, b) => bundle(b) - bundle(a));
    if (sort === 'savings') list = [...list].sort((a, b) => savingsPct(b.regular_total, bundle(b)) - savingsPct(a.regular_total, bundle(a)));
    if (sort === 'orders') list = [...list].sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0));
    if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }, [combos, search, status, sort]);

  const refresh = () => { setModal(null); qc.invalidateQueries({ queryKey: ['admin-combos'] }); };

  const openEdit = async (combo, mode = 'edit') => {
    try {
      const full = await comboApi.getOne(combo.id);
      setModal({ mode, combo: full?.data?.combo || combo });
    } catch { toast.error('Could not load combo'); }
  };

  const handleToggle = async (combo) => {
    try {
      await comboApi.toggle(combo.id);
      qc.invalidateQueries({ queryKey: ['admin-combos'] });
      toast.success(combo.is_active ? 'Combo hidden from the store' : 'Combo is live');
    } catch (e) { toast.error(e?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    const combo = confirmDelete;
    try {
      await comboApi.remove(combo.id);
      toast.success('Combo deleted');
      qc.invalidateQueries({ queryKey: ['admin-combos'] });
    } catch (e) { toast.error(e?.message || 'Failed to delete'); }
    finally { setConfirmDelete(null); }
  };

  const active = combos.filter((c) => c.is_active).length;
  const lowStock = combos.filter((c) => c.stock != null && Number(c.stock) <= 5).length;
  const totalOrders = combos.reduce((s, c) => s + (c.orders_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><PackagePlus className="h-5 w-5 text-violet-600" /> Combo products</h1>
          <p className="text-xs text-gray-400 mt-0.5">Bundle products into one purchasable set at a single price</p>
        </div>
        <Button onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> New combo</Button>
      </div>

      <ComboAppearanceCard />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Combos" value={combos.length} icon={Layers} color="purple" sub={`${active} live · ${combos.length - active} hidden`} />
        <StatCard title="Orders with combos" value={totalOrders} icon={ShoppingBag} color="indigo" />
        <StatCard title="Low stock" value={lowStock} icon={AlertTriangle} color={lowStock ? 'amber' : 'green'} sub="5 or fewer left" />
        <StatCard title="Avg. savings" value={`${combos.length ? Math.round(combos.reduce((s, c) => s + savingsPct(c.regular_total, Number(c.offer_price) > 0 ? Number(c.offer_price) : Number(c.price)), 0) / combos.length) : 0}%`} icon={Percent} color="green" sub="vs. buying separately" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search combos, slots or products…" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-400" />
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
          {[['all', 'All'], ['active', 'Live'], ['inactive', 'Hidden']].map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${status === v ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{l}</button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-indigo-400">
          <option value="order">Display order</option>
          <option value="newest">Newest</option>
          <option value="orders">Most ordered</option>
          <option value="savings">Biggest savings</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
      </div>

      {isLoading ? <Spinner /> : visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400 rounded-2xl border border-dashed border-gray-200 bg-white">
          <PackagePlus className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-600">{combos.length ? 'No combos match your filters' : 'No combos yet'}</p>
          <p className="text-sm mt-1">{combos.length ? 'Try a different search or status.' : 'Bundle a few products together and sell them at one price.'}</p>
          {!combos.length && <Button className="mt-4" onClick={() => setModal({ mode: 'create' })}><Plus className="h-4 w-4" /> Create your first combo</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((combo) => {
            const bundle = Number(combo.offer_price) > 0 ? Number(combo.offer_price) : Number(combo.price);
            const pct = savingsPct(combo.regular_total, bundle);
            const preview = (combo.slots || []).flatMap((s) => (s.products || []).slice(0, 1)).slice(0, 4);
            const low = combo.stock != null && Number(combo.stock) <= 5;
            return (
              <div key={combo.id} className={`rounded-2xl border bg-white overflow-hidden transition-shadow hover:shadow-md ${combo.is_active ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-70'}`}>
                <div className="relative aspect-[16/8] bg-gray-50">
                  {combo.image_url
                    ? <img src={combo.image_url} alt={combo.name} className="w-full h-full object-cover" />
                    : preview.length
                      ? <div className={`grid h-full ${preview.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>{preview.map((p, i) => <img key={i} src={p.image || ''} alt="" className="w-full h-full object-cover" />)}</div>
                      : <div className="h-full flex items-center justify-center"><PackagePlus className="h-8 w-8 text-gray-300" /></div>}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {pct > 0 && <Badge color="green">Save {pct}%</Badge>}
                    {!combo.is_active && <Badge color="gray">Hidden</Badge>}
                    {low && <Badge color="yellow">{Number(combo.stock) === 0 ? 'Out of stock' : `Only ${combo.stock} left`}</Badge>}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{combo.name}</p>
                      {combo.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{combo.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-gray-900">{inr(bundle)}</p>
                      {combo.regular_total > 0 && <p className="text-[10px] text-gray-400 line-through">{inr(combo.regular_total)}</p>}
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {(combo.slots || []).map((slot) => (
                      <li key={slot.id} className="flex items-center gap-2 text-xs text-gray-600">
                        <Tag className="h-3 w-3 text-violet-400 shrink-0" />
                        <span className="font-medium truncate">{slot.slot_label}</span>
                        <span className="text-gray-400 truncate">· {slot.product_count === 1 ? slot.products?.[0]?.name : `${slot.product_count} options`}</span>
                        {slot.requires_selection && <span className="ml-auto text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">size/colour</span>}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>Stock <b className="text-gray-700">{combo.stock ?? '∞'}</b></span>
                      <span>Orders <b className="text-gray-700">{combo.orders_count || 0}</b></span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => handleToggle(combo)} title={combo.is_active ? 'Hide from store' : 'Show in store'}
                        className={`p-1.5 rounded-lg transition-colors ${combo.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                        {combo.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openEdit(combo, 'duplicate')} title="Duplicate" className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(combo, 'edit')} title="Edit" className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setConfirmDelete(combo)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ComboModal
          editing={modal.mode === 'edit' ? modal.combo : null}
          duplicateOf={modal.mode === 'duplicate' ? modal.combo : null}
          allProducts={allProducts}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}

      {confirmDelete && (
        <Modal title="Delete combo?" onClose={() => setConfirmDelete(null)} size="sm">
          <p className="text-sm text-gray-600">
            <b>{confirmDelete.name}</b> will be removed from the store and from customers' carts. Past orders keep their history.
            {confirmDelete.orders_count > 0 && <span className="block mt-1 text-amber-700">It has been ordered {confirmDelete.orders_count} time{confirmDelete.orders_count === 1 ? '' : 's'} — hiding it may be safer than deleting.</span>}
          </p>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            {confirmDelete.is_active && <Button variant="ghost" onClick={() => { handleToggle(confirmDelete); setConfirmDelete(null); }}>Hide instead</Button>}
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
