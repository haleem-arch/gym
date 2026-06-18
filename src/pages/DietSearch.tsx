import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Plus, Globe, UtensilsCrossed, ChevronLeft, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DumbbellLoader } from '../components/DumbbellLoader';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const DietSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mealId = searchParams.get('mealId');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Bottom Sheet State
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [grams, setGrams] = useState<string>('100');
  const [isAdding, setIsAdding] = useState(false);

  // Editable base values for bottom sheet
  const [baseName, setBaseName] = useState('');
  const [baseKcal, setBaseKcal] = useState<string>('0');
  const [baseProtein, setBaseProtein] = useState<string>('0');
  const [baseCarbs, setBaseCarbs] = useState<string>('0');
  const [baseFat, setBaseFat] = useState<string>('0');
  const [showEditMacros, setShowEditMacros] = useState(false);

  // Barcode Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [cameraStream, setCameraStream] = useState<any | null>(null);
  const [customBarcode, setCustomBarcode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Sync editable states with selected food
  useEffect(() => {
    if (selectedFood) {
      setBaseName(selectedFood.name || '');
      setBaseKcal(String(selectedFood.kcal_per_100g ?? 0));
      setBaseProtein(String(selectedFood.protein ?? 0));
      setBaseCarbs(String(selectedFood.carbs ?? 0));
      setBaseFat(String(selectedFood.fat ?? 0));
      setShowEditMacros(false); // Hide editing by default when opening a food sheet
    }
  }, [selectedFood]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 1200;
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio beep failed:", e);
    }
  };

  const validateBarcodeChecksum = (code: string): boolean => {
    const trimmed = code.trim();
    // Validate barcode checksum only if it is a standard EAN-13, UPC-A, or EAN-8 (8, 12, 13, 14 digits)
    if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(trimmed)) {
      return true; // allow custom short barcodes/inputs
    }
    const digits = trimmed.split('').map(Number);
    const checkDigit = digits.pop()!;
    
    let sum = 0;
    const reversed = digits.reverse();
    for (let i = 0; i < reversed.length; i++) {
      const weight = (i % 2 === 0) ? 3 : 1;
      sum += reversed[i] * weight;
    }
    
    const calculatedCheck = (10 - (sum % 10)) % 10;
    return calculatedCheck === checkDigit;
  };

  const handleScanSuccess = (code: string) => {
    if (!validateBarcodeChecksum(code)) {
      console.warn("Discarded scanned barcode due to invalid checksum (likely camera blur misread):", code);
      return;
    }
    playBeep();
    setQuery(code);
    setShowScanner(false);
  };

  useEffect(() => {
    let isActive = true;
    let scannerInstance: Html5Qrcode | null = null;

    const startScanning = async () => {
      if (showScanner) {
        // Wait 250ms for modal rendering to mount the #reader element
        await new Promise((resolve) => setTimeout(resolve, 250));
        if (!isActive) return;

        try {
          const scanner = new Html5Qrcode("reader", {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E
            ],
            verbose: false
          });
          scannerInstance = scanner;
          scannerRef.current = scanner;

          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const minEdge = Math.min(width, height);
                const boxWidth = Math.floor(minEdge * 0.85);
                const boxHeight = Math.floor(boxWidth * 0.55);
                return { width: boxWidth, height: boxHeight };
              },
              aspectRatio: 1.7777778
            },
            (decodedText) => {
              handleScanSuccess(decodedText);
            },
            () => {
              // Frame parse errors, silent
            }
          );
          if (isActive) {
            setCameraStream({}); // set dummy active object so UI knows webcam is running
          }
        } catch (err) {
          console.warn("Html5Qrcode scanner failed to initialize:", err);
          if (isActive) setCameraStream(null);
        }
      }
    };

    startScanning();

    return () => {
      isActive = false;
      setCameraStream(null);
      if (scannerInstance) {
        if (scannerInstance.isScanning) {
          scannerInstance.stop().then(() => {
            console.log("Scanner stopped successfully");
          }).catch((e) => {
            console.warn("Failed to stop scanner:", e);
          });
        }
      }
      scannerRef.current = null;
    };
  }, [showScanner]);

  useEffect(() => {
    const searchFoods = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);

      let localResults: any[] = [];
      const { data } = await supabase
        .from('food_inventory')
        .select('*')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,barcode.eq.${query}`)
        .limit(50);

      if (data) localResults = data;

      // OpenFoodFacts API Integration
      // If query is a barcode (only digits, length >= 6) and we don't have an exact match locally
      const isNumericBarcode = /^\d{6,}$/.test(query.trim());
      const hasExactLocalMatch = localResults.some(item => item.barcode === query.trim());
      const hasLocalNameMatch = localResults.length > 0;

      if (isNumericBarcode && !hasExactLocalMatch && !hasLocalNameMatch) {
        try {
          const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${query.trim()}.json`);
          const apiData = await response.json();
          
          if (apiData.status === 1 && apiData.product) {
            const p = apiData.product;
            const n = p.nutriments || {};
            
            // Some products don't have per 100g values if they only have per serving. 
            // We'll fallback to 0 if missing.
            const globalProduct = {
              id: 'api_' + query.trim(),
              name: p.product_name || 'Unknown Global Product',
              barcode: query.trim(),
              kcal_per_100g: Number(n['energy-kcal_100g']) || 0,
              protein: Number(n.proteins_100g) || 0,
              carbs: Number(n.carbohydrates_100g) || 0,
              fat: Number(n.fat_100g) || 0,
              source: 'api' // special flag for UI
            };
            
            localResults = [globalProduct, ...localResults];
          }
        } catch (err) {
          console.error("OpenFoodFacts API Error:", err);
        }
      }

      // Sort results to prioritize simple staple items and exact name matches
      const sortedResults = [...localResults].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        const q = query.toLowerCase().trim();

        const getScore = (item: any, name: string) => {
          let score = 100;

          // 1. Exact match
          if (name === q) {
            score -= 90;
          }
          // 2. Starts with query (e.g. "Rice Baladi")
          else if (name.startsWith(q)) {
            score -= 50;
          }
          // 3. Common prefixes before query (e.g. "White Rice", "Cooked Rice")
          else if (
            name.startsWith("white " + q) || 
            name.startsWith("cooked " + q) || 
            name.startsWith("raw " + q) || 
            name.startsWith("brown " + q) || 
            name.startsWith("basmati " + q) ||
            name.startsWith("sliced " + q) ||
            name.startsWith("whole " + q)
          ) {
            score -= 40;
          }
          // 4. Starts with the first word as query or contains it as a standalone word
          else {
            const firstWord = name.split(/[\s,()\-]+/)[0];
            if (firstWord === q) {
              score -= 30;
            } else if (name.includes(" " + q)) {
              score -= 15;
            }
          }

          // 5. Category-based priority (Fitness Staples first, fast food last)
          const cat = item.category || '';
          if (cat.includes('Fitness')) {
            score -= 25;
          } else if (cat.includes('Restaurants') || cat.includes('Fast Food')) {
            score += 30; // Demote complex restaurant dishes
          }

          // 6. Prefer simpler names (fewer characters / simpler ingredients)
          score += name.length * 0.1;

          return score;
        };

        return getScore(a, nameA) - getScore(b, nameB);
      });

      setResults(sortedResults);
      setLoading(false);
    };

    const debounce = setTimeout(() => searchFoods(), 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleAddFood = async () => {
    if (!selectedFood || !mealId || !grams) return;
    setIsAdding(true);

    const amount = parseFloat(grams);
    const isPerItem = selectedFood.serving_type === 'per_item';
    if (isNaN(amount) || amount <= 0 || amount > 10000) {
      alert(isPerItem ? 'Please enter a valid quantity between 0.1 and 10000.' : 'Please enter a valid amount between 0.1g and 10000g.');
      setIsAdding(false);
      return;
    }

    const kcalVal = parseFloat(baseKcal) || 0;
    const proteinVal = parseFloat(baseProtein) || 0;
    const carbsVal = parseFloat(baseCarbs) || 0;
    const fatVal = parseFloat(baseFat) || 0;

    // Realistic bounds check for base nutritional values to protect database
    if (kcalVal < 0 || kcalVal > 5000) {
      alert("Calories per 100g/serving must be between 0 and 5000.");
      setIsAdding(false);
      return;
    }
    if (proteinVal < 0 || proteinVal > 500 || carbsVal < 0 || carbsVal > 500 || fatVal < 0 || fatVal > 500) {
      alert("Macros must be between 0 and 500g.");
      setIsAdding(false);
      return;
    }
    if (!baseName.trim()) {
      alert("Please enter a valid food name.");
      setIsAdding(false);
      return;
    }

    let foodId = selectedFood.id;
    const nameChanged = baseName.trim() !== selectedFood.name;
    const macrosChanged = 
      kcalVal !== (selectedFood.kcal_per_100g || 0) ||
      proteinVal !== (selectedFood.protein || 0) ||
      carbsVal !== (selectedFood.carbs || 0) ||
      fatVal !== (selectedFood.fat || 0);

    // If it's an API product OR if it was modified by the user, save it as a local food first!
    if (selectedFood.source === 'api' || nameChanged || macrosChanged) {
      const { data: { session } } = await supabase.auth.getSession();
      const newLocalFood = {
        user_id: session?.user?.id || null,
        name: baseName.trim(),
        barcode: selectedFood.barcode || null,
        kcal_per_100g: kcalVal,
        protein: proteinVal,
        carbs: carbsVal,
        fat: fatVal,
        serving_type: selectedFood.serving_type || 'per_100g',
        source: 'barcode' // Store as barcode so it's a permanent local item now
      };

      const { data: inserted, error: insertError } = await supabase
        .from('food_inventory')
        .insert(newLocalFood)
        .select()
        .single();

      if (insertError) {
        console.error("Error saving API/modified food to DB:", insertError);
        alert("Failed to save product to local inventory.");
        setIsAdding(false);
        return;
      }
      if (inserted) {
        foodId = inserted.id; // Use the real DB UUID
      }
    }

    const multiplier = isPerItem ? amount : amount / 100;
    const calculatedMacros = {
      kcal: kcalVal * multiplier,
      protein: proteinVal * multiplier,
      carbs: carbsVal * multiplier,
      fat: fatVal * multiplier
    };

    const newItem = {
      id: crypto.randomUUID(),
      food_id: foodId,
      name: baseName.trim(),
      grams: amount,
      macros: calculatedMacros,
      serving_type: selectedFood.serving_type || 'per_100g'
    };

    // 1. Fetch current meal
    const { data: currentMeal } = await supabase.from('diet_meals').select('items').eq('id', mealId).single();
    
    // 2. Append item
    const updatedItems = [...(currentMeal?.items || []), newItem];
    
    // 3. Save to Supabase
    await supabase.from('diet_meals').update({ items: updatedItems }).eq('id', mealId);

    // Close and navigate back
    setSelectedFood(null);
    setIsAdding(false);
    navigate(`/diet/meal/${mealId}`);
  };

  const isSelectedPerItem = selectedFood?.serving_type === 'per_item';
  const previewMultiplier = isSelectedPerItem
    ? parseFloat(grams || '0')
    : parseFloat(grams || '0') / 100;
  const calculatedPreview = selectedFood ? {
    kcal: (parseFloat(baseKcal) || 0) * previewMultiplier,
    protein: (parseFloat(baseProtein) || 0) * previewMultiplier,
    carbs: (parseFloat(baseCarbs) || 0) * previewMultiplier,
    fat: (parseFloat(baseFat) || 0) * previewMultiplier,
  } : null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background relative">
      <div className="sticky top-0 z-20 bg-[#07080e]/90 backdrop-blur-md border-b border-gray-800 px-4 pb-4 flex flex-col gap-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-900/60 border border-gray-850 hover:border-gray-700 rounded-xl transition-all active:scale-95 shrink-0 flex items-center justify-center">
            <ChevronLeft size={16} className="text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">Add Food</h1>
          <button 
            onClick={() => navigate('/diet/food/new')}
            className="text-primary font-bold text-sm tracking-wide"
          >
            CREATE
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550 w-4 h-4" />
          <input 
            type="text" 
            autoFocus
            maxLength={100}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food or scan barcode..." 
            className="w-full bg-surface border border-gray-700 rounded-lg py-3 pl-10 pr-12 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
          <button 
            onClick={() => setShowScanner(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary active:scale-90 p-1.5 transition-colors cursor-pointer"
            title="Scan Barcode"
            type="button"
          >
            <Camera size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <DumbbellLoader label="Searching foods..." size={80} />
        ) : query.trim() === '' ? (
          <div className="p-8 text-center flex flex-col items-center text-gray-500 gap-2 mt-10">
            <Search className="w-8 h-8 opacity-50" />
            <p className="text-sm">Type a name or barcode to search.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center text-gray-500 gap-2 mt-10">
            <p className="text-sm mb-4">No results found for "{query}".</p>
            <button 
              onClick={() => navigate('/diet/food/new')}
              className="bg-surface border border-gray-700 text-primary font-bold py-3 px-6 rounded-xl flex items-center gap-2 mx-auto"
            >
              <Plus size={18} /> Create New Food
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {results.map((food) => {
              const isPerItem = food.serving_type === 'per_item';
              return (
                <div 
                  key={food.id} 
                  onClick={() => { setSelectedFood(food); setGrams(isPerItem ? '1' : '100'); }}
                  className="p-4 bg-background hover:bg-surface transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white flex items-center gap-2 flex-1 mr-2">
                      {food.name}
                      {food.source === 'api' && (
                        <span className="bg-purple-900/40 text-purple-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-800/50 shrink-0">
                          <Globe size={10} /> Global API
                        </span>
                      )}
                    </h3>
                    <span className="text-primary font-bold whitespace-nowrap ml-2">
                      {Math.round(food.kcal_per_100g)} <span className="text-xs font-normal text-gray-500">{isPerItem ? 'kcal/serving' : 'kcal/100g'}</span>
                    </span>
                  </div>
                  {food.category && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-gray-500">{food.category}</span>
                    </div>
                  )}
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span>P: {Math.round(food.protein)}g</span>
                    <span>C: {Math.round(food.carbs)}g</span>
                    <span>F: {Math.round(food.fat)}g</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {food.source === 'preset' && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">Verified Preset</span>
                    )}
                    {isPerItem && (
                      <span className="text-[10px] bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded flex items-center gap-1">
                        <UtensilsCrossed size={9} /> Per Serving
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Amount Bottom Sheet */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelectedFood(null)} 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface border-t border-gray-800 rounded-t-3xl p-6 relative z-10 pb-10 max-h-[90vh] overflow-y-auto"
            >
              {!showEditMacros ? (
                <>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedFood.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 border-b border-gray-800 pb-4">
                    {isSelectedPerItem
                      ? `${selectedFood.kcal_per_100g} kcal per serving`
                      : `Base: ${selectedFood.kcal_per_100g} kcal per 100g`
                    }
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowEditMacros(true)}
                    className="text-xs font-bold text-red-500 hover:text-red-400 active:scale-95 transition-all mb-6 block hover:underline"
                  >
                    ⚠️ Is there a problem with the food details?
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Food Name</label>
                    <input 
                      type="text"
                      maxLength={100}
                      value={baseName}
                      onChange={(e) => setBaseName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 px-4 text-sm font-bold text-white focus:border-primary outline-none"
                      placeholder="e.g. Snickers Bar"
                    />
                  </div>

                  {/* Editable Base Macros section */}
                  <div className="bg-gray-900/50 border border-gray-850 rounded-2xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-extrabold text-gray-550 uppercase tracking-widest block">
                        Edit Base Nutrition ({isSelectedPerItem ? 'per serving' : 'per 100g'})
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          setBaseName(selectedFood.name || '');
                          setBaseKcal(String(selectedFood.kcal_per_100g ?? 0));
                          setBaseProtein(String(selectedFood.protein ?? 0));
                          setBaseCarbs(String(selectedFood.carbs ?? 0));
                          setBaseFat(String(selectedFood.fat ?? 0));
                          setShowEditMacros(false);
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 text-center">Calories</label>
                        <input 
                          type="number"
                          inputMode="decimal"
                          value={baseKcal}
                          onChange={(e) => setBaseKcal(e.target.value)}
                          className="w-full bg-gray-955 border border-gray-800 rounded-lg py-1.5 px-1 text-xs font-bold text-primary text-center outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 text-center">Protein (g)</label>
                        <input 
                          type="number"
                          inputMode="decimal"
                          value={baseProtein}
                          onChange={(e) => setBaseProtein(e.target.value)}
                          className="w-full bg-gray-955 border border-gray-800 rounded-lg py-1.5 px-1 text-xs font-bold text-blue-400 text-center outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 text-center">Carbs (g)</label>
                        <input 
                          type="number"
                          inputMode="decimal"
                          value={baseCarbs}
                          onChange={(e) => setBaseCarbs(e.target.value)}
                          className="w-full bg-gray-955 border border-gray-800 rounded-lg py-1.5 px-1 text-xs font-bold text-green-400 text-center outline-none focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-1 text-center">Fat (g)</label>
                        <input 
                          type="number"
                          inputMode="decimal"
                          value={baseFat}
                          onChange={(e) => setBaseFat(e.target.value)}
                          className="w-full bg-gray-955 border border-gray-800 rounded-lg py-1.5 px-1 text-xs font-bold text-yellow-400 text-center outline-none focus:border-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{isSelectedPerItem ? 'Quantity (Servings)' : 'Amount'}</label>
                  <div className="relative">
                    <input 
                      type="number"
                      autoFocus
                      inputMode="decimal"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 pl-4 pr-12 text-xl font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{isSelectedPerItem ? 'serving(s)' : 'g'}</span>
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center h-[88px]">
                  <span className="text-xs font-bold text-gray-550 uppercase tracking-wider block mb-1">Calories</span>
                  <span className="text-2xl font-bold text-primary">{Math.round(calculatedPreview?.kcal || 0)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-8 px-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Protein</span>
                  <span className="text-lg font-bold text-blue-400">{Math.round(calculatedPreview?.protein || 0)}g</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-550 uppercase">Carbs</span>
                  <span className="text-lg font-bold text-green-400">{Math.round(calculatedPreview?.carbs || 0)}g</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-550 uppercase">Fat</span>
                  <span className="text-lg font-bold text-yellow-400">{Math.round(calculatedPreview?.fat || 0)}g</span>
                </div>
              </div>
              
              <button 
                onClick={handleAddFood}
                disabled={isAdding}
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isAdding ? 'ADDING...' : (
                  <>
                    <Plus size={20} /> Add to Meal
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setShowScanner(false)} 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface border-t border-gray-800 rounded-t-3xl p-6 relative z-10 pb-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Camera className="text-primary w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Barcode Scanner</h3>
                </div>
                <button 
                  onClick={() => setShowScanner(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Viewfinder Container */}
              <div className="relative w-full h-48 bg-slate-950 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center mb-6">
                <div 
                  id="reader" 
                  className={`w-full h-full ${cameraStream ? 'block' : 'hidden'}`}
                />
                
                {!cameraStream && (
                  <div className="text-center p-4 text-gray-555 absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                    <Camera size={28} className="mx-auto mb-2 opacity-30 animate-pulse" />
                    <p className="text-xs">Camera feed unavailable or loading...</p>
                    <p className="text-[10px] text-gray-600 mt-1">Point your physical camera to scan packaging</p>
                  </div>
                )}

                {/* Laser scan line animation */}
                <motion.div 
                  animate={{ y: [-96, 96] }} 
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
                  className="absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444]" 
                />

                {/* Viewfinder target brackets */}
                <div className="absolute inset-8 border border-white/20 rounded-lg pointer-events-none" />
              </div>

              {/* Presets Grid */}
              <div className="mb-6">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Simulate Quick Scans</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { name: 'Snickers Bar 🍫', code: '5000159461122' },
                    { name: 'Coca-Cola Can 🥤', code: '5449000000996' },
                    { name: 'Tuna Salad 🐟', code: '6221007010471' },
                    { name: 'Lurpak Butter 🧈', code: '5711953046187' }
                  ].map((preset) => (
                    <button
                      key={preset.code}
                      onClick={() => handleScanSuccess(preset.code)}
                      className="bg-gray-900/40 hover:bg-gray-900 border border-gray-800 hover:border-primary/30 p-3 rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
                      <span className="text-[9px] text-gray-550 block font-mono mt-0.5">{preset.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Barcode Input */}
              <div className="bg-gray-955/40 border border-gray-850 p-4 rounded-xl mb-6">
                <label className="text-[10px] font-bold text-gray-550 uppercase tracking-widest block mb-2">Manual Barcode Input</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={20}
                    value={customBarcode}
                    onChange={(e) => setCustomBarcode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 5000159461122"
                    className="flex-1 bg-gray-955 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary/50 font-mono font-bold"
                    inputMode="numeric"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customBarcode.trim()) {
                        handleScanSuccess(customBarcode.trim());
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (customBarcode.trim()) {
                        handleScanSuccess(customBarcode.trim());
                      }
                    }}
                    className="bg-primary hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
                  >
                    Log
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowScanner(false)}
                className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-gray-850 text-gray-400 font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 border border-gray-800"
              >
                Close Scanner
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DietSearch;
