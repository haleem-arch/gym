-- ============================================================
-- 1. UPGRADE SCHEMA FIRST
-- Run these ALTER TABLE commands to support the new columns
-- ============================================================
ALTER TABLE public.food_inventory ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.food_inventory ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.food_inventory ADD COLUMN IF NOT EXISTS fiber numeric;
ALTER TABLE public.food_inventory ADD COLUMN IF NOT EXISTS sugar numeric;
ALTER TABLE public.food_inventory ADD COLUMN IF NOT EXISTS sodium numeric;

-- Temporarily drop the source constraint so we can use 'egyptian_preset'
ALTER TABLE public.food_inventory DROP CONSTRAINT IF EXISTS food_inventory_source_check;


-- ============================================================
-- HALEEM'S FOOD DATABASE — ~150 items
-- Egyptian-focused · Athlete-optimized · Ready for Supabase
-- ============================================================

INSERT INTO food_inventory (name, name_ar, category, kcal_per_100g, protein, carbs, fat, fiber, sugar, sodium, source) VALUES

-- ============================================================
-- EGYPTIAN STAPLES
-- ============================================================
('Ful Medames (cooked)', 'فول مدمس', 'Egyptian Staples', 110, 8.0, 15.0, 0.5, 6.0, 0.5, 240, 'egyptian_preset'),
('Ful Medames with Oil', 'فول بالزيت', 'Egyptian Staples', 160, 7.5, 14.0, 7.0, 5.5, 0.5, 260, 'egyptian_preset'),
('Ful Medames with Egg', 'فول بالبيض', 'Egyptian Staples', 185, 11.0, 13.0, 9.0, 5.0, 0.5, 280, 'egyptian_preset'),
('Koshari', 'كشري', 'Egyptian Staples', 150, 5.0, 28.0, 3.0, 2.5, 2.0, 310, 'egyptian_preset'),
('Koshari (large portion)', 'كشري كبير', 'Egyptian Staples', 155, 5.2, 29.0, 3.2, 2.5, 2.0, 320, 'egyptian_preset'),
('Macarona Bechamel', 'مكرونة بشاميل', 'Egyptian Staples', 180, 7.0, 22.0, 7.0, 1.0, 2.5, 350, 'egyptian_preset'),
('Feteer Meshaltet', 'فطير مشلتت', 'Egyptian Staples', 340, 7.0, 50.0, 13.0, 1.0, 2.0, 280, 'egyptian_preset'),
('Feteer with Honey', 'فطير بالعسل', 'Egyptian Staples', 390, 6.5, 62.0, 13.0, 0.8, 18.0, 200, 'egyptian_preset'),
('Feteer Savory (meat)', 'فطير بالمينا', 'Egyptian Staples', 360, 14.0, 42.0, 15.0, 1.0, 1.0, 400, 'egyptian_preset'),
('Aish Baladi', 'عيش بلدي', 'Egyptian Staples', 255, 8.0, 52.0, 1.5, 4.0, 1.0, 420, 'egyptian_preset'),
('Aish Fino', 'عيش فينو', 'Egyptian Staples', 280, 9.0, 55.0, 2.0, 1.5, 3.0, 500, 'egyptian_preset'),
('Aish Shami (white pita)', 'عيش شامي', 'Egyptian Staples', 265, 8.5, 54.0, 1.2, 2.0, 1.5, 460, 'egyptian_preset'),
('Aish Toasts', 'عيش توست', 'Egyptian Staples', 265, 9.0, 49.0, 3.2, 2.5, 3.5, 480, 'egyptian_preset'),
('Molokhia (cooked, with broth)', 'ملوخية', 'Egyptian Staples', 35, 3.0, 5.0, 0.6, 2.0, 0.5, 180, 'egyptian_preset'),
('Molokhia with Chicken', 'ملوخية بالفراخ', 'Egyptian Staples', 95, 10.0, 5.0, 4.0, 2.0, 0.5, 250, 'egyptian_preset'),
('Hamam (pigeon, grilled)', 'حمام مشوي', 'Egyptian Staples', 220, 26.0, 0.0, 13.0, 0.0, 0.0, 90, 'egyptian_preset'),
('Kofta (grilled)', 'كفتة مشوية', 'Egyptian Staples', 260, 22.0, 4.0, 17.0, 0.0, 1.0, 380, 'egyptian_preset'),
('Kofta (fried)', 'كفتة مقلية', 'Egyptian Staples', 310, 20.0, 8.0, 22.0, 0.0, 1.0, 400, 'egyptian_preset'),
('Hawawshi', 'هواوشي', 'Egyptian Staples', 310, 18.0, 28.0, 13.0, 1.0, 1.5, 550, 'egyptian_preset'),
('Shawarma Chicken (no bread)', 'شاورما فراخ', 'Egyptian Staples', 185, 22.0, 5.0, 9.0, 0.0, 2.0, 480, 'egyptian_preset'),
('Shawarma Meat (no bread)', 'شاورما لحمة', 'Egyptian Staples', 210, 20.0, 4.0, 13.0, 0.0, 1.0, 500, 'egyptian_preset'),
('Shawarma Chicken Wrap', 'شاورما فراخ بالخبز', 'Egyptian Staples', 230, 16.0, 28.0, 7.0, 1.5, 2.0, 560, 'egyptian_preset'),
('Tamr (dates)', 'تمر', 'Egyptian Staples', 282, 2.5, 75.0, 0.4, 8.0, 63.0, 2, 'egyptian_preset'),
('Ayran (yogurt drink)', 'عيران', 'Egyptian Staples', 60, 3.5, 6.0, 2.0, 0.0, 5.0, 80, 'egyptian_preset'),
('Roz Bil Laban', 'رز باللبن', 'Egyptian Staples', 130, 4.0, 24.0, 2.5, 0.2, 10.0, 60, 'egyptian_preset'),
('Om Ali', 'أم علي', 'Egyptian Staples', 280, 7.0, 32.0, 14.0, 0.5, 15.0, 120, 'egyptian_preset'),
('Basbousa', 'بسبوسة', 'Egyptian Staples', 380, 6.0, 60.0, 13.0, 1.0, 30.0, 150, 'egyptian_preset'),
('Tahini', 'طحينة', 'Egyptian Staples', 595, 17.0, 21.0, 54.0, 3.0, 0.5, 115, 'egyptian_preset'),
('Baba Ghanoush', 'بابا غنوج', 'Egyptian Staples', 88, 2.4, 9.0, 5.2, 2.5, 4.0, 210, 'egyptian_preset'),
('Hummus', 'حمص', 'Egyptian Staples', 177, 8.0, 20.0, 10.0, 4.0, 0.5, 380, 'egyptian_preset'),
('Lentil Soup', 'شوربة عدس', 'Egyptian Staples', 116, 9.0, 20.0, 0.4, 4.0, 2.0, 300, 'egyptian_preset'),
('Warak Enab (stuffed grape leaves)', 'ورق عنب', 'Egyptian Staples', 170, 4.0, 22.0, 8.0, 2.0, 1.5, 280, 'egyptian_preset'),
('Filfil Mahshi (stuffed pepper)', 'فلفل محشي', 'Egyptian Staples', 140, 6.0, 18.0, 5.0, 2.0, 4.0, 320, 'egyptian_preset'),
('Koronb Mahshi (stuffed cabbage)', 'كرنب محشي', 'Egyptian Staples', 130, 5.5, 17.0, 4.5, 2.5, 3.0, 290, 'egyptian_preset'),
('Basterma', 'بسطرمة', 'Egyptian Staples', 220, 26.0, 2.0, 12.0, 0.0, 0.5, 1800, 'egyptian_preset'),
('Sogo (Egyptian sausage)', 'سجق', 'Egyptian Staples', 310, 14.0, 3.0, 27.0, 0.0, 1.0, 900, 'egyptian_preset'),
('Feta Cheese (local)', 'جبنة فيتا', 'Egyptian Staples', 264, 14.0, 4.0, 21.0, 0.0, 0.5, 1100, 'egyptian_preset'),
('Rumi Cheese', 'جبنة رومي', 'Egyptian Staples', 350, 28.0, 0.0, 26.0, 0.0, 0.0, 1400, 'egyptian_preset'),
('Gebna Beida (white cheese)', 'جبنة بيضاء', 'Egyptian Staples', 260, 16.0, 2.0, 21.0, 0.0, 0.5, 1200, 'egyptian_preset'),
('Gebna Domyati', 'جبنة دمياطي', 'Egyptian Staples', 280, 17.0, 1.5, 23.0, 0.0, 0.5, 1300, 'egyptian_preset'),
('Liver Chicken (grilled)', 'كبدة فراخ', 'Egyptian Staples', 167, 25.0, 1.0, 7.0, 0.0, 0.0, 120, 'egyptian_preset'),
('Liver Beef (grilled)', 'كبدة بتلو', 'Egyptian Staples', 175, 27.0, 4.0, 5.0, 0.0, 0.0, 80, 'egyptian_preset'),
('Liver with Peppers (alexandrian)', 'كبدة إسكندراني', 'Egyptian Staples', 195, 23.0, 6.0, 9.0, 1.0, 2.0, 400, 'egyptian_preset'),
('Eggplant Fatteh', 'فتة باذنجان', 'Egyptian Staples', 160, 5.0, 20.0, 7.0, 2.5, 3.0, 280, 'egyptian_preset'),
('Fatteh (meat and bread)', 'فتة باللحمة', 'Egyptian Staples', 210, 12.0, 24.0, 8.0, 1.5, 2.0, 350, 'egyptian_preset'),
('Macaroni Pasta (cooked)', 'مكرونة', 'Egyptian Staples', 131, 5.0, 25.0, 1.1, 1.5, 0.5, 1, 'egyptian_preset'),
('Spaghetti (cooked)', 'سباجيتي', 'Egyptian Staples', 157, 5.8, 30.9, 0.9, 1.8, 0.6, 1, 'egyptian_preset'),
('Penne (cooked)', 'بيني', 'Egyptian Staples', 131, 5.0, 25.0, 1.0, 1.5, 0.5, 1, 'egyptian_preset'),
('Kushari Lentils', 'عدس كشري', 'Egyptian Staples', 116, 9.0, 20.0, 0.3, 7.9, 1.8, 2, 'egyptian_preset'),

-- ============================================================
-- MEAT & POULTRY
-- ============================================================
('Chicken Breast (grilled)', 'صدر فراخ مشوي', 'Meat & Poultry', 165, 31.0, 0.0, 3.6, 0.0, 0.0, 74, 'preset'),
('Chicken Breast (boiled)', 'صدر فراخ مسلوق', 'Meat & Poultry', 150, 30.0, 0.0, 2.5, 0.0, 0.0, 65, 'preset'),
('Chicken Breast (fried, no breading)', 'صدر فراخ مقلي', 'Meat & Poultry', 195, 29.0, 0.0, 8.0, 0.0, 0.0, 80, 'preset'),
('Chicken Thigh (grilled, no skin)', 'فخدة فراخ مشوية', 'Meat & Poultry', 175, 25.0, 0.0, 8.0, 0.0, 0.0, 90, 'preset'),
('Chicken Thigh (with skin)', 'فخدة فراخ بالجلد', 'Meat & Poultry', 209, 26.0, 0.0, 11.0, 0.0, 0.0, 95, 'preset'),
('Chicken Wings (grilled)', 'جناح فراخ مشوي', 'Meat & Poultry', 203, 30.0, 0.0, 9.0, 0.0, 0.0, 96, 'preset'),
('Chicken Wings (fried)', 'جناح فراخ مقلي', 'Meat & Poultry', 290, 27.0, 8.0, 17.0, 0.0, 0.0, 350, 'preset'),
('Whole Chicken (roasted)', 'فراخة بلدي مشوية', 'Meat & Poultry', 215, 29.0, 0.0, 11.0, 0.0, 0.0, 77, 'preset'),
('Chicken Drumstick (grilled)', 'كنتاكي مشوي', 'Meat & Poultry', 185, 28.0, 0.0, 8.0, 0.0, 0.0, 85, 'preset'),
('Ground Beef (95% lean)', 'لحمة مفرومة قليلة الدهن', 'Meat & Poultry', 152, 26.0, 0.0, 5.0, 0.0, 0.0, 79, 'preset'),
('Ground Beef (80/20)', 'لحمة مفرومة عادية', 'Meat & Poultry', 254, 26.0, 0.0, 17.0, 0.0, 0.0, 95, 'preset'),
('Beef Steak (sirloin, grilled)', 'ستيك سيرلون', 'Meat & Poultry', 207, 30.0, 0.0, 9.0, 0.0, 0.0, 65, 'preset'),
('Beef Steak (ribeye)', 'ستيك ريب آي', 'Meat & Poultry', 291, 24.0, 0.0, 21.0, 0.0, 0.0, 72, 'preset'),
('Beef (lean, grilled)', 'لحمة بتلو مشوية', 'Meat & Poultry', 250, 26.0, 0.0, 15.0, 0.0, 0.0, 66, 'preset'),
('Veal (grilled)', 'لحمة عجل', 'Meat & Poultry', 196, 30.0, 0.0, 8.0, 0.0, 0.0, 90, 'preset'),
('Lamb (grilled leg)', 'لحمة ضاني مشوية', 'Meat & Poultry', 258, 28.0, 0.0, 16.0, 0.0, 0.0, 90, 'preset'),
('Lamb Chops (grilled)', 'ريش ضاني', 'Meat & Poultry', 294, 25.0, 0.0, 21.0, 0.0, 0.0, 85, 'preset'),
('Lamb Kofta', 'كفتة ضاني', 'Meat & Poultry', 280, 20.0, 4.0, 21.0, 0.0, 1.0, 400, 'preset'),
('Turkey Breast (grilled)', 'ديك رومي', 'Meat & Poultry', 135, 30.0, 0.0, 1.0, 0.0, 0.0, 65, 'preset'),
('Duck (roasted)', 'بطة مشوية', 'Meat & Poultry', 337, 19.0, 0.0, 28.0, 0.0, 0.0, 76, 'preset'),
('Rabbit (grilled)', 'أرنب مشوي', 'Meat & Poultry', 173, 29.0, 0.0, 5.6, 0.0, 0.0, 47, 'preset'),
('Beef Burger Patty (lean)', 'برجر لحمة', 'Meat & Poultry', 245, 26.0, 0.0, 15.0, 0.0, 0.0, 350, 'preset'),
('Chicken Burger Patty', 'برجر فراخ', 'Meat & Poultry', 165, 25.0, 3.0, 6.0, 0.0, 1.0, 320, 'preset'),
('Hot Dog / Frankfurter', 'هوت دوج', 'Meat & Poultry', 290, 11.0, 3.0, 26.0, 0.0, 1.5, 900, 'preset'),
('Salami', 'سلامي', 'Meat & Poultry', 336, 18.0, 1.0, 29.0, 0.0, 0.5, 1200, 'preset'),
('Mortadella', 'مرتديلا', 'Meat & Poultry', 310, 15.0, 4.0, 26.0, 0.0, 2.0, 1100, 'preset'),
('Chicken Mortadella', 'مرتديلا فراخ', 'Meat & Poultry', 195, 17.0, 5.0, 12.0, 0.0, 2.0, 850, 'preset'),
('Beef Jerky', 'لحمة مجففة', 'Meat & Poultry', 410, 55.0, 11.0, 10.0, 0.0, 7.0, 1900, 'preset'),
('Shrimp (grilled)', 'جمبري مشوي', 'Meat & Poultry', 99, 24.0, 0.0, 0.3, 0.0, 0.0, 180, 'preset'),
('Shrimp (fried)', 'جمبري مقلي', 'Meat & Poultry', 240, 20.0, 12.0, 13.0, 0.0, 0.5, 450, 'preset'),

-- ============================================================
-- FISH & SEAFOOD
-- ============================================================
('Salmon (grilled)', 'سمك سلمون مشوي', 'Fish & Seafood', 208, 20.0, 0.0, 13.0, 0.0, 0.0, 59, 'preset'),
('Salmon (baked)', 'سمك سلمون في الفرن', 'Fish & Seafood', 206, 22.0, 0.0, 12.0, 0.0, 0.0, 60, 'preset'),
('Tuna (canned in water)', 'تونة في الماء', 'Fish & Seafood', 116, 26.0, 0.0, 1.0, 0.0, 0.0, 330, 'preset'),
('Tuna (canned in oil)', 'تونة في الزيت', 'Fish & Seafood', 200, 26.0, 0.0, 10.0, 0.0, 0.0, 400, 'preset'),
('Tuna Steak (grilled)', 'تونة مشوية', 'Fish & Seafood', 184, 30.0, 0.0, 6.0, 0.0, 0.0, 50, 'preset'),
('Tilapia (grilled)', 'بلطي مشوي', 'Fish & Seafood', 128, 26.0, 0.0, 2.7, 0.0, 0.0, 56, 'preset'),
('Tilapia (fried)', 'بلطي مقلي', 'Fish & Seafood', 195, 22.0, 5.0, 9.0, 0.0, 0.0, 350, 'preset'),
('Catfish (grilled)', 'سمك قراميط', 'Fish & Seafood', 150, 22.0, 0.0, 6.5, 0.0, 0.0, 68, 'preset'),
('Sardines (canned in water)', 'سردين في الماء', 'Fish & Seafood', 208, 25.0, 0.0, 11.0, 0.0, 0.0, 400, 'preset'),
('Sardines (canned in oil)', 'سردين في الزيت', 'Fish & Seafood', 290, 24.0, 0.0, 20.0, 0.0, 0.0, 500, 'preset'),
('Mackerel (grilled)', 'سمك إسقمري', 'Fish & Seafood', 239, 19.0, 0.0, 17.0, 0.0, 0.0, 90, 'preset'),
('Sea Bass (grilled)', 'سمك قاروص', 'Fish & Seafood', 124, 23.0, 0.0, 3.0, 0.0, 0.0, 68, 'preset'),
('Shrimp (boiled)', 'جمبري مسلوق', 'Fish & Seafood', 85, 20.0, 0.0, 0.5, 0.0, 0.0, 150, 'preset'),
('Squid / Calamari (grilled)', 'كاليماري مشوي', 'Fish & Seafood', 92, 16.0, 3.0, 1.4, 0.0, 0.0, 260, 'preset'),
('Crab (boiled)', 'كابوريا', 'Fish & Seafood', 97, 19.0, 0.0, 1.8, 0.0, 0.0, 370, 'preset'),
('Fesikh (salted mullet)', 'فسيخ', 'Fish & Seafood', 190, 22.0, 0.0, 11.0, 0.0, 0.0, 3500, 'preset'),
('Renga (smoked herring)', 'رنجة', 'Fish & Seafood', 210, 25.0, 0.0, 12.0, 0.0, 0.0, 2000, 'preset'),
('Bouri (mullet, grilled)', 'بوري مشوي', 'Fish & Seafood', 139, 22.0, 0.0, 5.5, 0.0, 0.0, 75, 'preset'),

-- ============================================================
-- EGGS & DAIRY
-- ============================================================
('Eggs (whole, boiled)', 'بيض مسلوق', 'Eggs & Dairy', 155, 13.0, 1.1, 11.0, 0.0, 1.1, 124, 'preset'),
('Eggs (whole, scrambled)', 'بيض مخفوق', 'Eggs & Dairy', 148, 10.0, 1.6, 11.0, 0.0, 1.6, 330, 'preset'),
('Eggs (whole, fried)', 'بيض مقلي', 'Eggs & Dairy', 196, 14.0, 0.8, 15.0, 0.0, 0.4, 208, 'preset'),
('Egg White (raw)', 'بياض البيض', 'Eggs & Dairy', 52, 11.0, 0.7, 0.2, 0.0, 0.7, 166, 'preset'),
('Egg Yolk', 'صفار البيض', 'Eggs & Dairy', 322, 16.0, 3.6, 27.0, 0.0, 0.6, 48, 'preset'),
('Greek Yogurt (full fat)', 'زبادي يوناني كامل الدسم', 'Eggs & Dairy', 97, 9.0, 3.6, 5.0, 0.0, 3.6, 36, 'preset'),
('Greek Yogurt (0% fat)', 'زبادي يوناني خالي الدسم', 'Eggs & Dairy', 59, 10.0, 3.6, 0.4, 0.0, 3.6, 36, 'preset'),
('Yogurt (plain, full fat)', 'زبادي عادي', 'Eggs & Dairy', 61, 3.5, 4.7, 3.3, 0.0, 4.7, 46, 'preset'),
('Yogurt (plain, low fat)', 'زبادي قليل الدسم', 'Eggs & Dairy', 56, 5.0, 8.0, 0.6, 0.0, 7.0, 70, 'preset'),
('Labneh', 'لبنة', 'Eggs & Dairy', 180, 9.0, 4.0, 15.0, 0.0, 4.0, 400, 'preset'),
('Milk (full fat, 3.5%)', 'لبن كامل الدسم', 'Eggs & Dairy', 61, 3.2, 4.8, 3.3, 0.0, 5.1, 43, 'preset'),
('Milk (low fat, 1.5%)', 'لبن قليل الدسم', 'Eggs & Dairy', 42, 3.4, 5.0, 1.0, 0.0, 5.0, 44, 'preset'),
('Milk (skimmed, 0%)', 'لبن خالي الدسم', 'Eggs & Dairy', 34, 3.4, 5.0, 0.1, 0.0, 5.0, 44, 'preset'),
('Cottage Cheese (low fat)', 'جبنة قريش', 'Eggs & Dairy', 98, 11.0, 3.4, 4.3, 0.0, 2.7, 405, 'preset'),
('Cottage Cheese (full fat)', 'جبنة قريش كاملة الدسم', 'Eggs & Dairy', 206, 12.0, 2.7, 17.0, 0.0, 2.5, 400, 'preset'),
('Cheddar Cheese', 'جبنة شيدر', 'Eggs & Dairy', 403, 25.0, 1.3, 33.0, 0.0, 0.5, 621, 'preset'),
('Mozzarella', 'جبنة موتزاريلا', 'Eggs & Dairy', 280, 28.0, 2.2, 17.0, 0.0, 1.0, 627, 'preset'),
('Cream Cheese', 'جبنة كريمة', 'Eggs & Dairy', 342, 6.0, 4.1, 34.0, 0.0, 3.2, 314, 'preset'),
('Butter', 'زبدة', 'Eggs & Dairy', 717, 0.9, 0.1, 81.0, 0.0, 0.1, 643, 'preset'),
('Ghee (samn)', 'سمن', 'Eggs & Dairy', 900, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Heavy Cream', 'كريمة', 'Eggs & Dairy', 340, 2.0, 3.0, 36.0, 0.0, 3.0, 38, 'preset'),
('Ice Cream (vanilla)', 'آيس كريم فانيليا', 'Eggs & Dairy', 207, 3.5, 24.0, 11.0, 0.0, 21.0, 80, 'preset'),
('Whey Protein Powder', 'واي بروتين', 'Eggs & Dairy', 400, 80.0, 8.0, 4.0, 0.0, 4.0, 200, 'preset'),
('Casein Protein Powder', 'كازين بروتين', 'Eggs & Dairy', 380, 78.0, 8.0, 2.0, 0.0, 3.0, 180, 'preset'),

-- ============================================================
-- GRAINS & BREAD
-- ============================================================
('White Rice (cooked)', 'رز أبيض مطبوخ', 'Grains & Bread', 130, 2.7, 28.0, 0.3, 0.4, 0.0, 1, 'preset'),
('Brown Rice (cooked)', 'رز بني مطبوخ', 'Grains & Bread', 123, 2.6, 23.0, 1.0, 1.8, 0.0, 1, 'preset'),
('Basmati Rice (cooked)', 'رز بسمتي مطبوخ', 'Grains & Bread', 130, 2.7, 28.2, 0.2, 0.3, 0.0, 1, 'preset'),
('Egyptian Rice (cooked, short grain)', 'رز مصري مطبوخ', 'Grains & Bread', 130, 2.5, 29.0, 0.3, 0.3, 0.0, 1, 'preset'),
('White Rice (dry/raw)', 'رز أبيض نيء', 'Grains & Bread', 365, 7.0, 80.0, 0.7, 0.6, 0.0, 1, 'preset'),
('Oats (rolled, dry)', 'شوفان', 'Grains & Bread', 389, 17.0, 66.0, 7.0, 10.0, 1.0, 2, 'preset'),
('Oats (cooked with water)', 'شوفان مطبوخ', 'Grains & Bread', 71, 2.5, 12.0, 1.5, 1.7, 0.0, 49, 'preset'),
('Granola', 'جرانولا', 'Grains & Bread', 471, 10.0, 64.0, 20.0, 5.0, 24.0, 40, 'preset'),
('Cornflakes', 'كورن فليكس', 'Grains & Bread', 357, 7.0, 84.0, 0.4, 1.2, 8.0, 500, 'preset'),
('Whole Wheat Bread', 'عيش أسمر كامل القمح', 'Grains & Bread', 247, 13.0, 41.0, 4.2, 6.0, 3.5, 400, 'preset'),
('White Bread (sliced)', 'عيش أبيض', 'Grains & Bread', 265, 9.0, 49.0, 3.2, 2.0, 5.0, 490, 'preset'),
('Rice Cakes (plain)', 'كيك رز', 'Grains & Bread', 387, 8.0, 82.0, 3.0, 1.0, 1.0, 25, 'preset'),
('Crackers (whole wheat)', 'بسكويت قمح كامل', 'Grains & Bread', 415, 10.0, 65.0, 15.0, 5.0, 5.0, 500, 'preset'),
('Breadsticks', 'جريسيني', 'Grains & Bread', 392, 11.0, 72.0, 7.0, 3.0, 3.0, 440, 'preset'),
('Pasta (cooked, any shape)', 'باستا مطبوخة', 'Grains & Bread', 131, 5.0, 25.0, 1.1, 1.8, 0.6, 1, 'preset'),
('Pasta (dry, any shape)', 'باستا نيئة', 'Grains & Bread', 371, 13.0, 75.0, 1.5, 3.2, 0.6, 6, 'preset'),
('Whole Wheat Pasta (cooked)', 'باستا قمح كامل مطبوخة', 'Grains & Bread', 124, 5.3, 26.5, 0.5, 3.9, 0.5, 3, 'preset'),
('Quinoa (cooked)', 'كينوا', 'Grains & Bread', 120, 4.4, 21.3, 1.9, 2.8, 0.9, 7, 'preset'),
('Bulgur (cooked)', 'برغل مطبوخ', 'Grains & Bread', 83, 3.1, 18.6, 0.2, 4.5, 0.0, 5, 'preset'),
('Couscous (cooked)', 'كسكس مطبوخ', 'Grains & Bread', 112, 3.8, 23.2, 0.2, 1.4, 0.0, 5, 'preset'),
('Bread Crumbs', 'بقسماط', 'Grains & Bread', 395, 13.0, 73.0, 5.0, 3.0, 5.0, 730, 'preset'),
('Corn (boiled)', 'ذرة مسلوقة', 'Grains & Bread', 96, 3.4, 21.0, 1.5, 2.4, 4.5, 15, 'preset'),
('Sweet Corn (canned)', 'ذرة معلبة', 'Grains & Bread', 83, 2.5, 19.0, 0.9, 2.0, 4.0, 280, 'preset'),
('Flour (all purpose)', 'دقيق أبيض', 'Grains & Bread', 364, 10.0, 76.0, 1.0, 2.7, 0.3, 2, 'preset'),
('Whole Wheat Flour', 'دقيق قمح كامل', 'Grains & Bread', 340, 13.0, 72.0, 2.5, 10.7, 0.4, 2, 'preset'),

-- ============================================================
-- LEGUMES
-- ============================================================
('Lentils (cooked, green)', 'عدس أخضر مطبوخ', 'Legumes', 116, 9.0, 20.0, 0.4, 7.9, 1.8, 2, 'preset'),
('Lentils (cooked, red)', 'عدس أحمر مطبوخ', 'Legumes', 116, 9.0, 20.0, 0.4, 8.0, 1.8, 2, 'preset'),
('Lentils (cooked, black)', 'عدس أسود مطبوخ', 'Legumes', 114, 9.0, 20.0, 0.4, 8.0, 1.8, 2, 'preset'),
('Chickpeas (cooked)', 'حمص مطبوخ', 'Legumes', 164, 8.9, 27.0, 2.6, 7.6, 4.8, 7, 'preset'),
('Chickpeas (canned)', 'حمص معلب', 'Legumes', 139, 7.0, 22.0, 2.0, 6.0, 4.0, 400, 'preset'),
('Fava Beans / Ful (dry)', 'فول مجفف', 'Legumes', 341, 26.0, 58.0, 1.5, 25.0, 5.0, 13, 'preset'),
('Fava Beans (cooked)', 'فول مسلوق', 'Legumes', 110, 7.6, 19.6, 0.4, 5.4, 2.0, 5, 'preset'),
('Black Beans (cooked)', 'فاصوليا سوداء', 'Legumes', 132, 8.9, 24.0, 0.5, 8.7, 0.3, 1, 'preset'),
('Kidney Beans (cooked)', 'فاصوليا حمراء', 'Legumes', 127, 8.7, 22.8, 0.5, 6.4, 0.3, 2, 'preset'),
('White Beans (cooked)', 'فاصوليا بيضاء', 'Legumes', 139, 9.7, 25.1, 0.4, 6.3, 0.4, 2, 'preset'),
('Peas (cooked)', 'بسلة مطبوخة', 'Legumes', 84, 5.4, 15.6, 0.2, 5.5, 5.5, 3, 'preset'),
('Soybeans (cooked)', 'صويا مطبوخة', 'Legumes', 173, 16.6, 10.0, 9.0, 6.0, 3.0, 1, 'preset'),
('Edamame', 'إيداماميه', 'Legumes', 121, 11.9, 8.9, 5.2, 5.2, 2.2, 6, 'preset'),
('Peanuts (roasted)', 'فول سوداني محمص', 'Legumes', 567, 26.0, 16.0, 49.0, 8.5, 4.0, 6, 'preset'),
('Peanut Butter (natural)', 'زبدة الفول السوداني طبيعية', 'Legumes', 588, 25.0, 20.0, 50.0, 6.0, 9.0, 7, 'preset'),
('Peanut Butter (commercial)', 'زبدة الفول السوداني', 'Legumes', 588, 25.0, 20.0, 50.0, 6.0, 9.0, 400, 'preset'),

-- ============================================================
-- VEGETABLES
-- ============================================================
('Spinach (raw)', 'سبانخ طازجة', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, 'preset'),
('Spinach (cooked)', 'سبانخ مطبوخة', 'Vegetables', 41, 5.4, 6.8, 0.5, 4.3, 0.8, 70, 'preset'),
('Broccoli (raw)', 'بروكلي طازج', 'Vegetables', 34, 2.8, 7.0, 0.4, 2.6, 1.7, 33, 'preset'),
('Broccoli (steamed)', 'بروكلي مطبوخ بالبخار', 'Vegetables', 35, 2.4, 7.2, 0.4, 3.3, 1.7, 41, 'preset'),
('Cauliflower (raw)', 'قرنبيط', 'Vegetables', 25, 1.9, 5.0, 0.3, 2.0, 1.9, 30, 'preset'),
('Cucumber (raw)', 'خيار', 'Vegetables', 16, 0.7, 4.0, 0.1, 0.5, 1.7, 2, 'preset'),
('Tomato (raw)', 'طماطم', 'Vegetables', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, 'preset'),
('Tomato (cooked/sauce)', 'صوصة طماطم', 'Vegetables', 29, 1.3, 6.0, 0.3, 1.7, 4.0, 300, 'preset'),
('Cherry Tomatoes', 'طماطم كرزي', 'Vegetables', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, 'preset'),
('Lettuce (romaine)', 'خس', 'Vegetables', 17, 1.2, 3.3, 0.3, 2.1, 1.2, 8, 'preset'),
('Cabbage (raw)', 'كرنب', 'Vegetables', 25, 1.3, 5.8, 0.1, 2.5, 3.2, 18, 'preset'),
('Carrot (raw)', 'جزر', 'Vegetables', 41, 0.9, 9.6, 0.2, 2.8, 4.7, 69, 'preset'),
('Carrot (cooked)', 'جزر مطبوخ', 'Vegetables', 35, 0.8, 8.2, 0.2, 2.4, 3.5, 58, 'preset'),
('Bell Pepper (red)', 'فلفل أحمر', 'Vegetables', 31, 1.0, 6.0, 0.3, 2.1, 4.2, 4, 'preset'),
('Bell Pepper (green)', 'فلفل أخضر', 'Vegetables', 20, 0.9, 4.6, 0.2, 1.7, 2.4, 3, 'preset'),
('Bell Pepper (yellow)', 'فلفل أصفر', 'Vegetables', 27, 1.0, 6.3, 0.2, 0.9, 2.7, 2, 'preset'),
('Onion (raw)', 'بصل', 'Vegetables', 40, 1.1, 9.3, 0.1, 1.7, 4.2, 4, 'preset'),
('Onion (cooked)', 'بصل مطبوخ', 'Vegetables', 44, 1.4, 10.2, 0.2, 1.8, 4.7, 3, 'preset'),
('Garlic', 'ثوم', 'Vegetables', 149, 6.4, 33.1, 0.5, 2.1, 1.0, 17, 'preset'),
('Mushroom (raw)', 'فطر', 'Vegetables', 22, 3.1, 3.3, 0.3, 1.0, 2.0, 5, 'preset'),
('Mushroom (grilled)', 'فطر مشوي', 'Vegetables', 28, 3.6, 4.4, 0.5, 1.1, 2.5, 3, 'preset'),
('Eggplant (raw)', 'باذنجان', 'Vegetables', 25, 1.0, 5.9, 0.2, 3.0, 3.5, 2, 'preset'),
('Eggplant (grilled)', 'باذنجان مشوي', 'Vegetables', 33, 1.4, 8.1, 0.2, 2.5, 5.0, 2, 'preset'),
('Zucchini (raw)', 'كوسة', 'Vegetables', 17, 1.2, 3.1, 0.3, 1.0, 2.5, 8, 'preset'),
('Zucchini (cooked)', 'كوسة مطبوخة', 'Vegetables', 29, 1.8, 6.5, 0.2, 1.2, 3.5, 3, 'preset'),
('Peas (canned)', 'بسلة معلبة', 'Vegetables', 69, 4.5, 12.5, 0.3, 4.5, 4.0, 310, 'preset'),
('Sweet Potato (baked)', 'بطاطا حلوة', 'Vegetables', 90, 2.0, 21.0, 0.1, 3.3, 4.2, 36, 'preset'),
('Potato (boiled)', 'بطاطس مسلوقة', 'Vegetables', 87, 1.9, 20.1, 0.1, 1.8, 0.9, 6, 'preset'),
('Potato (baked)', 'بطاطس في الفرن', 'Vegetables', 93, 2.0, 21.0, 0.1, 1.5, 1.0, 7, 'preset'),
('French Fries (fried)', 'بطاطس مقلية', 'Vegetables', 312, 3.4, 41.0, 15.0, 3.8, 0.3, 210, 'preset'),
('Green Beans (cooked)', 'فاصوليا خضراء مطبوخة', 'Vegetables', 35, 1.9, 8.0, 0.1, 3.4, 1.6, 1, 'preset'),
('Asparagus (grilled)', 'هليون', 'Vegetables', 27, 2.9, 5.2, 0.2, 2.1, 1.9, 14, 'preset'),
('Artichoke (cooked)', 'خرشوف', 'Vegetables', 53, 3.5, 12.0, 0.2, 6.9, 1.0, 60, 'preset'),
('Leeks', 'كراث', 'Vegetables', 61, 1.5, 14.2, 0.3, 1.8, 3.9, 20, 'preset'),
('Celery', 'كرفس', 'Vegetables', 16, 0.7, 3.0, 0.2, 1.6, 1.3, 80, 'preset'),
('Radish', 'فجل', 'Vegetables', 16, 0.7, 3.4, 0.1, 1.6, 1.9, 39, 'preset'),
('Beetroot (cooked)', 'بنجر مطبوخ', 'Vegetables', 44, 1.7, 10.0, 0.2, 2.0, 7.6, 77, 'preset'),
('Pumpkin (cooked)', 'قرع عسلي', 'Vegetables', 20, 0.7, 4.9, 0.1, 0.5, 2.1, 1, 'preset'),
('Corn on the Cob', 'كوز ذرة', 'Vegetables', 86, 3.3, 19.0, 1.4, 2.0, 6.3, 15, 'preset'),
('Mixed Salad (no dressing)', 'سلطة مشكلة', 'Vegetables', 17, 1.2, 3.3, 0.3, 1.5, 1.5, 20, 'preset'),

-- ============================================================
-- FRUITS
-- ============================================================
('Banana', 'موز', 'Fruits', 89, 1.1, 23.0, 0.3, 2.6, 12.2, 1, 'preset'),
('Apple', 'تفاح', 'Fruits', 52, 0.3, 14.0, 0.2, 2.4, 10.4, 1, 'preset'),
('Orange', 'برتقال', 'Fruits', 47, 0.9, 12.0, 0.1, 2.4, 9.4, 0, 'preset'),
('Mango', 'مانجو', 'Fruits', 60, 0.8, 15.0, 0.4, 1.6, 13.7, 1, 'preset'),
('Watermelon', 'بطيخ', 'Fruits', 30, 0.6, 7.6, 0.2, 0.4, 6.2, 1, 'preset'),
('Grapes', 'عنب', 'Fruits', 67, 0.6, 17.2, 0.4, 0.9, 16.2, 2, 'preset'),
('Strawberry', 'فراولة', 'Fruits', 32, 0.7, 7.7, 0.3, 2.0, 4.9, 1, 'preset'),
('Peach', 'خوخ', 'Fruits', 39, 0.9, 9.5, 0.3, 1.5, 8.4, 0, 'preset'),
('Pear', 'كمثرى', 'Fruits', 57, 0.4, 15.2, 0.1, 3.1, 9.8, 1, 'preset'),
('Pineapple', 'أناناس', 'Fruits', 50, 0.5, 13.1, 0.1, 1.4, 9.9, 1, 'preset'),
('Guava', 'جوافة', 'Fruits', 68, 2.6, 14.3, 1.0, 5.4, 8.9, 2, 'preset'),
('Papaya', 'بابايا', 'Fruits', 43, 0.5, 11.0, 0.3, 1.7, 7.8, 8, 'preset'),
('Kiwi', 'كيوي', 'Fruits', 61, 1.1, 14.7, 0.5, 3.0, 9.0, 3, 'preset'),
('Lemon (juice)', 'عصير ليمون', 'Fruits', 22, 0.4, 6.9, 0.2, 0.3, 2.5, 1, 'preset'),
('Pomegranate', 'رمان', 'Fruits', 83, 1.7, 18.7, 1.2, 4.0, 13.7, 3, 'preset'),
('Fig (fresh)', 'تين طازج', 'Fruits', 74, 0.8, 19.2, 0.3, 2.9, 16.3, 1, 'preset'),
('Fig (dried)', 'تين مجفف', 'Fruits', 249, 3.3, 63.9, 0.9, 9.8, 47.9, 10, 'preset'),
('Dates (Medjool)', 'تمر مجدول', 'Fruits', 277, 1.8, 75.0, 0.2, 6.7, 66.5, 1, 'preset'),
('Raisins', 'زبيب', 'Fruits', 299, 3.1, 79.2, 0.5, 3.7, 59.2, 11, 'preset'),
('Apricot (fresh)', 'مشمش طازج', 'Fruits', 48, 1.4, 11.1, 0.4, 2.0, 9.2, 1, 'preset'),
('Apricot (dried)', 'مشمش مجفف', 'Fruits', 241, 3.4, 62.6, 0.5, 7.3, 53.4, 10, 'preset'),
('Cantaloupe', 'شمام', 'Fruits', 34, 0.8, 8.2, 0.2, 0.9, 7.9, 16, 'preset'),
('Avocado', 'أفوكادو', 'Fruits', 160, 2.0, 8.5, 14.7, 6.7, 0.7, 7, 'preset'),
('Coconut (fresh)', 'جوز هند', 'Fruits', 354, 3.3, 15.2, 33.5, 9.0, 6.2, 20, 'preset'),
('Blueberries', 'توت أزرق', 'Fruits', 57, 0.7, 14.5, 0.3, 2.4, 10.0, 1, 'preset'),
('Cherry', 'كرز', 'Fruits', 63, 1.1, 16.0, 0.2, 2.1, 12.8, 0, 'preset'),
('Plum', 'برقوق', 'Fruits', 46, 0.7, 11.4, 0.3, 1.4, 9.9, 0, 'preset'),
('Melon (honeydew)', 'شمام عسلي', 'Fruits', 36, 0.5, 9.1, 0.1, 0.8, 8.1, 18, 'preset'),

-- ============================================================
-- NUTS & SEEDS
-- ============================================================
('Almonds (raw)', 'لوز', 'Nuts & Seeds', 579, 21.0, 22.0, 50.0, 12.5, 4.4, 1, 'preset'),
('Almonds (roasted, unsalted)', 'لوز محمص', 'Nuts & Seeds', 598, 21.0, 22.0, 52.0, 12.5, 4.4, 1, 'preset'),
('Cashews (raw)', 'كاجو', 'Nuts & Seeds', 553, 18.0, 30.0, 44.0, 3.3, 5.9, 12, 'preset'),
('Cashews (roasted)', 'كاجو محمص', 'Nuts & Seeds', 574, 15.0, 33.0, 46.0, 3.0, 5.0, 180, 'preset'),
('Walnuts', 'جوز', 'Nuts & Seeds', 654, 15.0, 14.0, 65.0, 6.7, 2.6, 2, 'preset'),
('Pistachios', 'فستق حلبي', 'Nuts & Seeds', 562, 20.0, 28.0, 45.0, 10.3, 7.7, 1, 'preset'),
('Hazelnuts', 'بندق', 'Nuts & Seeds', 628, 15.0, 17.0, 61.0, 9.7, 4.3, 0, 'preset'),
('Macadamia Nuts', 'ماكاداميا', 'Nuts & Seeds', 718, 7.9, 13.8, 75.8, 8.6, 4.6, 5, 'preset'),
('Brazil Nuts', 'برازيل نات', 'Nuts & Seeds', 659, 14.3, 11.7, 67.1, 7.5, 3.1, 3, 'preset'),
('Sunflower Seeds', 'بذور عباد الشمس', 'Nuts & Seeds', 584, 20.8, 20.0, 51.5, 8.6, 2.6, 9, 'preset'),
('Pumpkin Seeds', 'بذور اليقطين', 'Nuts & Seeds', 559, 30.2, 10.7, 49.1, 6.0, 1.4, 7, 'preset'),
('Sesame Seeds', 'سمسم', 'Nuts & Seeds', 573, 17.7, 23.5, 49.7, 11.8, 0.3, 11, 'preset'),
('Chia Seeds', 'بذور الشيا', 'Nuts & Seeds', 486, 16.5, 42.1, 30.7, 34.4, 0.0, 16, 'preset'),
('Flaxseeds (ground)', 'بذر الكتان', 'Nuts & Seeds', 534, 18.3, 28.9, 42.2, 27.3, 1.6, 30, 'preset'),
('Pine Nuts', 'صنوبر', 'Nuts & Seeds', 673, 13.7, 13.1, 68.4, 3.7, 3.6, 2, 'preset'),
('Trail Mix (avg)', 'مكسرات مشكلة', 'Nuts & Seeds', 462, 10.5, 46.0, 29.0, 4.0, 25.0, 110, 'preset'),

-- ============================================================
-- OILS & FATS
-- ============================================================
('Olive Oil (extra virgin)', 'زيت زيتون بكر', 'Oils & Fats', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Sunflower Oil', 'زيت عباد الشمس', 'Oils & Fats', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Coconut Oil', 'زيت جوز الهند', 'Oils & Fats', 892, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Canola Oil', 'زيت الكانولا', 'Oils & Fats', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Corn Oil', 'زيت الذرة', 'Oils & Fats', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Vegetable Oil (mixed)', 'زيت نباتي', 'Oils & Fats', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Sesame Oil', 'زيت سمسم', 'Oils & Fats', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 0, 'preset'),
('Mayonnaise (full fat)', 'مايونيز', 'Oils & Fats', 680, 1.0, 0.6, 75.0, 0.0, 0.5, 590, 'preset'),
('Mayonnaise (light)', 'مايونيز لايت', 'Oils & Fats', 312, 0.7, 10.0, 30.0, 0.0, 4.0, 500, 'preset'),
('Butter (unsalted)', 'زبدة بدون ملح', 'Oils & Fats', 717, 0.9, 0.1, 81.0, 0.0, 0.1, 11, 'preset'),
('Butter (salted)', 'زبدة مملحة', 'Oils & Fats', 717, 0.9, 0.1, 81.0, 0.0, 0.1, 643, 'preset'),
('Ghee / Samn Baladi', 'سمن بلدي', 'Oils & Fats', 900, 0.0, 0.0, 100.0, 0.0, 0.0, 2, 'preset'),
('Cream (cooking)', 'كريمة طبخ', 'Oils & Fats', 340, 2.0, 3.0, 36.0, 0.0, 3.0, 38, 'preset'),

-- ============================================================
-- CONDIMENTS & SAUCES
-- ============================================================
('Ketchup', 'كاتشب', 'Condiments', 112, 1.3, 27.0, 0.1, 0.3, 22.0, 907, 'preset'),
('Mustard (yellow)', 'مسطردة', 'Condiments', 60, 3.7, 5.8, 3.7, 2.0, 0.9, 1120, 'preset'),
('Soy Sauce', 'صوصة الصويا', 'Condiments', 53, 8.1, 4.9, 0.1, 0.1, 1.7, 5493, 'preset'),
('Hot Sauce (Tabasco)', 'تاباسكو', 'Condiments', 12, 0.5, 1.0, 0.4, 0.0, 0.5, 1390, 'preset'),
('Tomato Sauce (plain)', 'صوصة طماطم', 'Condiments', 29, 1.3, 6.0, 0.3, 1.7, 4.0, 300, 'preset'),
('Tahini Sauce', 'صوصة الطحينة', 'Condiments', 595, 17.0, 21.0, 54.0, 3.0, 0.5, 115, 'preset'),
('Vinegar (white)', 'خل أبيض', 'Condiments', 18, 0.0, 0.6, 0.0, 0.0, 0.6, 2, 'preset'),
('Vinegar (apple cider)', 'خل التفاح', 'Condiments', 22, 0.0, 0.9, 0.0, 0.0, 0.4, 5, 'preset'),
('Lemon Juice', 'عصير ليمون', 'Condiments', 22, 0.4, 6.9, 0.2, 0.3, 2.5, 1, 'preset'),
('Honey', 'عسل', 'Condiments', 304, 0.3, 82.0, 0.0, 0.2, 82.1, 4, 'preset'),
('Jam (fruit)', 'مربى', 'Condiments', 278, 0.4, 69.0, 0.1, 1.1, 49.7, 32, 'preset'),
('Nutella', 'نوتيلا', 'Condiments', 539, 6.3, 57.5, 30.9, 2.8, 56.3, 41, 'preset'),
('Salad Dressing (caesar)', 'تتبيلة سيزر', 'Condiments', 357, 3.2, 8.0, 36.0, 0.0, 3.0, 650, 'preset'),
('Salt', 'ملح', 'Condiments', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 38758, 'preset'),
('Cumin', 'كمون', 'Condiments', 375, 18.0, 44.0, 22.0, 10.5, 2.3, 168, 'preset'),
('Cinnamon', 'قرفة', 'Condiments', 247, 4.0, 81.0, 1.2, 53.1, 2.2, 10, 'preset'),
('Black Pepper', 'فلفل أسود', 'Condiments', 251, 10.4, 64.0, 3.3, 26.5, 0.6, 20, 'preset'),
('Paprika', 'بابريكا', 'Condiments', 282, 14.1, 53.9, 12.9, 34.9, 10.3, 68, 'preset'),
('Turmeric', 'كركم', 'Condiments', 312, 9.7, 67.1, 3.3, 22.7, 3.2, 38, 'preset'),
('Chili Powder', 'فلفل حار مطحون', 'Condiments', 282, 13.5, 49.7, 14.3, 34.5, 7.2, 1592, 'preset'),
('Garlic Powder', 'بودرة ثوم', 'Condiments', 331, 16.5, 72.7, 0.7, 9.0, 2.5, 60, 'preset'),

-- ============================================================
-- DRINKS & BEVERAGES
-- ============================================================
('Water', 'ماء', 'Drinks', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 2, 'preset'),
('Milk (full fat)', 'لبن كامل', 'Drinks', 61, 3.2, 4.8, 3.3, 0.0, 5.1, 43, 'preset'),
('Milk (skimmed)', 'لبن خالي الدسم', 'Drinks', 34, 3.4, 5.0, 0.1, 0.0, 5.0, 44, 'preset'),
('Orange Juice (fresh)', 'عصير برتقال طازج', 'Drinks', 45, 0.7, 10.4, 0.2, 0.2, 8.4, 1, 'preset'),
('Apple Juice', 'عصير تفاح', 'Drinks', 46, 0.1, 11.4, 0.1, 0.2, 9.6, 4, 'preset'),
('Mango Juice', 'عصير مانجو', 'Drinks', 60, 0.4, 15.0, 0.1, 0.3, 13.5, 5, 'preset'),
('Coffee (black)', 'قهوة سوداء', 'Drinks', 2, 0.3, 0.0, 0.0, 0.0, 0.0, 2, 'preset'),
('Coffee with Milk', 'قهوة باللبن', 'Drinks', 30, 1.5, 3.5, 0.8, 0.0, 3.5, 25, 'preset'),
('Nescafe with Milk', 'نسكافيه باللبن', 'Drinks', 35, 1.5, 4.5, 0.8, 0.0, 4.0, 30, 'preset'),
('Tea (black, no sugar)', 'شاي أسود', 'Drinks', 1, 0.0, 0.3, 0.0, 0.0, 0.0, 3, 'preset'),
('Tea with Milk', 'شاي باللبن', 'Drinks', 18, 0.7, 2.5, 0.5, 0.0, 2.5, 15, 'preset'),
('Powerade (500ml bottle)', 'باودريد', 'Drinks', 26, 0.0, 6.4, 0.0, 0.0, 6.0, 92, 'preset'),
('Gatorade (500ml)', 'جاتوريد', 'Drinks', 25, 0.0, 6.0, 0.0, 0.0, 5.5, 110, 'preset'),
('Protein Shake (with water)', 'شيك بروتين', 'Drinks', 120, 25.0, 5.0, 1.5, 0.0, 2.0, 150, 'preset'),
('Protein Shake (with milk)', 'شيك بروتين باللبن', 'Drinks', 185, 28.0, 10.0, 4.5, 0.0, 7.0, 200, 'preset'),
('Coca Cola (330ml can)', 'كوكا كولا', 'Drinks', 42, 0.0, 10.6, 0.0, 0.0, 10.6, 10, 'preset'),
('Diet Coke / Zero', 'كوكا كولا دايت', 'Drinks', 1, 0.0, 0.1, 0.0, 0.0, 0.0, 12, 'preset'),
('Ayran (yogurt drink)', 'عيران', 'Drinks', 60, 3.5, 6.0, 2.0, 0.0, 5.0, 80, 'preset'),
('Smoothie (banana+milk)', 'سموزي موز', 'Drinks', 90, 3.5, 18.0, 1.5, 0.5, 12.0, 45, 'preset'),
('Energy Drink (Red Bull 250ml)', 'ريد بول', 'Drinks', 45, 0.0, 11.0, 0.0, 0.0, 11.0, 100, 'preset'),

-- ============================================================
-- SNACKS & BARS
-- ============================================================
('Protein Bar (avg, 60g)', 'بار بروتين', 'Snacks & Bars', 380, 35.0, 30.0, 10.0, 3.0, 15.0, 250, 'preset'),
('Cliff Bar', 'كليف بار', 'Snacks & Bars', 390, 10.0, 65.0, 7.0, 5.0, 24.0, 150, 'preset'),
('Quest Bar (avg)', 'كويست بار', 'Snacks & Bars', 370, 21.0, 25.0, 14.0, 14.0, 7.0, 230, 'preset'),
('Rice Cake with Peanut Butter', 'كيك رز بزبدة فول', 'Snacks & Bars', 320, 10.0, 42.0, 14.0, 2.0, 3.0, 180, 'preset'),
('Granola Bar', 'جرانولا بار', 'Snacks & Bars', 471, 7.0, 64.0, 20.0, 4.0, 25.0, 160, 'preset'),
('Chips (potato)', 'شيبس بطاطس', 'Snacks & Bars', 536, 7.0, 53.0, 35.0, 4.8, 0.5, 530, 'preset'),
('Popcorn (plain, air popped)', 'فشار سادة', 'Snacks & Bars', 387, 13.0, 78.0, 4.5, 14.5, 0.9, 8, 'preset'),
('Popcorn (salted, butter)', 'فشار بالزبدة', 'Snacks & Bars', 424, 8.0, 60.0, 19.0, 7.0, 1.0, 400, 'preset'),
('Dark Chocolate (70%+)', 'شوكولاتة داكنة', 'Snacks & Bars', 598, 7.8, 45.8, 42.6, 10.9, 24.0, 20, 'preset'),
('Milk Chocolate', 'شوكولاتة باللبن', 'Snacks & Bars', 535, 7.6, 59.5, 29.7, 1.5, 51.5, 79, 'preset'),
('Crackers (salted)', 'كراكرز مملحة', 'Snacks & Bars', 421, 9.0, 68.0, 13.0, 2.5, 2.5, 700, 'preset'),
('Biscuits (plain)', 'بسكويت', 'Snacks & Bars', 460, 6.0, 70.0, 18.0, 1.5, 18.0, 300, 'preset'),
('Wafer', 'ويفر', 'Snacks & Bars', 524, 6.1, 62.3, 27.2, 1.8, 32.1, 90, 'preset'),
('Corn Puffs (Cheetos style)', 'تشيتوز', 'Snacks & Bars', 535, 7.0, 58.0, 32.0, 1.0, 1.5, 690, 'preset'),
('Dates + Almond Snack', 'تمر باللوز', 'Snacks & Bars', 290, 4.5, 60.0, 8.0, 7.0, 48.0, 5, 'preset'),
('Oat Cookies (homemade)', 'كوكيز شوفان', 'Snacks & Bars', 430, 8.0, 62.0, 18.0, 4.0, 22.0, 200, 'preset'),

-- ============================================================
-- SUPPLEMENTS & SPORTS
-- ============================================================
('Creatine Monohydrate (5g)', 'كرياتين', 'Supplements', 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0, 'preset'),
('BCAA Powder (per serving)', 'بي سي اي اي', 'Supplements', 20, 5.0, 0.0, 0.0, 0.0, 0.0, 80, 'preset'),
('Pre-Workout (per serving, avg)', 'بري ووركاوت', 'Supplements', 25, 2.0, 5.0, 0.0, 0.0, 2.0, 150, 'preset'),
('Mass Gainer (per 100g)', 'ماس جينر', 'Supplements', 380, 15.0, 75.0, 4.0, 2.0, 20.0, 180, 'preset'),
('Omega-3 Fish Oil (per capsule 1g)', 'أوميجا 3', 'Supplements', 9, 0.0, 0.0, 1.0, 0.0, 0.0, 0, 'preset'),
('Multivitamin (per tablet)', 'فيتامينات متعددة', 'Supplements', 5, 0.0, 1.0, 0.0, 0.0, 0.0, 10, 'preset'),

-- ============================================================
-- FAST FOOD & RESTAURANT (Egyptian chains + international)
-- ============================================================
('Koshary Abou Tarek (small)', 'كشري أبو طارق صغير', 'Fast Food', 320, 12.0, 60.0, 5.0, 5.0, 4.0, 600, 'preset'),
('McDonalds Big Mac (per 100g)', 'بيج ماك', 'Fast Food', 257, 13.2, 24.0, 12.1, 1.3, 5.8, 485, 'preset'),
('McDonalds Chicken McNuggets (per pc ~17g)', 'ماكنجتس', 'Fast Food', 283, 14.6, 16.8, 17.7, 0.6, 0.4, 513, 'preset'),
('McDonalds French Fries (medium, per 100g)', 'بطاطس ماكدونالدز', 'Fast Food', 323, 4.0, 42.0, 16.0, 3.8, 0.5, 420, 'preset'),
('KFC Original Chicken (per 100g)', 'كنتاكي أصلي', 'Fast Food', 265, 24.0, 8.0, 16.0, 0.0, 0.0, 600, 'preset'),
('KFC Zinger Burger (per 100g)', 'زنجر', 'Fast Food', 290, 17.0, 30.0, 12.0, 1.5, 4.0, 580, 'preset'),
('Pizza (cheese, per slice ~100g)', 'بيتزا جبنة', 'Fast Food', 266, 11.0, 33.0, 10.0, 2.3, 3.6, 598, 'preset'),
('Pizza (pepperoni, per slice)', 'بيتزا بيبروني', 'Fast Food', 298, 12.0, 34.0, 12.0, 2.0, 3.5, 720, 'preset'),
('Subway 6-inch Turkey (per 100g)', 'ساندوتش سابوي', 'Fast Food', 183, 13.5, 27.0, 3.0, 1.8, 4.0, 680, 'preset'),
('Falafel (fried, per piece ~20g)', 'فلافل', 'Fast Food', 333, 13.3, 32.0, 17.8, 5.0, 0.8, 294, 'preset'),
('Falafel Sandwich', 'ساندوتش فلافل', 'Fast Food', 220, 8.0, 35.0, 7.0, 4.0, 2.0, 480, 'preset'),
('Ta''meya (Egyptian falafel)', 'طعمية', 'Fast Food', 310, 14.5, 30.0, 16.0, 7.0, 1.0, 350, 'preset'),
('Feteer Savoury Slice (per 100g)', 'شريحة فطير مالح', 'Fast Food', 310, 10.0, 40.0, 13.0, 1.0, 1.0, 450, 'preset'),
('Shawarma Sandwich (full)', 'ساندوتش شاورما', 'Fast Food', 240, 18.0, 28.0, 7.0, 1.5, 2.0, 560, 'preset'),
('Burger (local Egyptian, per 100g)', 'برجر مصري', 'Fast Food', 270, 15.0, 28.0, 11.0, 1.5, 4.0, 450, 'preset'),
('Escalope Sandwich', 'ساندوتش إسكالوب', 'Fast Food', 295, 16.0, 32.0, 11.0, 1.5, 2.0, 480, 'preset'),

-- ============================================================
-- BREAKFAST FOODS
-- ============================================================
('Pancakes (plain, per 100g)', 'باكنيك', 'Breakfast', 227, 6.1, 37.8, 5.4, 1.3, 7.7, 574, 'preset'),
('Waffle (plain)', 'وافل سادة', 'Breakfast', 291, 8.0, 40.0, 11.0, 1.3, 7.2, 590, 'preset'),
('French Toast', 'توست فرنسي', 'Breakfast', 229, 7.4, 29.4, 9.3, 1.1, 8.7, 311, 'preset'),
('Croissant (plain)', 'كرواسان', 'Breakfast', 406, 8.2, 45.8, 21.0, 1.8, 10.7, 375, 'preset'),
('Croissant (with cheese)', 'كرواسان بالجبنة', 'Breakfast', 450, 13.0, 42.0, 26.0, 1.5, 6.0, 600, 'preset'),
('Müsli / Mixed Cereals', 'ميوسلي', 'Breakfast', 340, 10.0, 65.0, 6.0, 6.0, 20.0, 250, 'preset'),
('Corn Flakes with Milk', 'كورن فليكس باللبن', 'Breakfast', 150, 5.0, 28.0, 2.0, 1.0, 10.0, 280, 'preset'),
('Omelette (2 eggs + veggies)', 'أومليت', 'Breakfast', 130, 11.0, 4.0, 8.0, 0.8, 2.0, 310, 'preset'),
('Shakshuka (2 eggs in sauce)', 'شكشوكة', 'Breakfast', 120, 8.0, 8.0, 7.0, 1.5, 4.0, 380, 'preset'),
('Ful with Egg', 'فول بالبيض', 'Breakfast', 200, 14.0, 15.0, 9.0, 5.0, 1.0, 300, 'preset'),

-- ============================================================
-- SOUPS
-- ============================================================
('Chicken Broth (homemade)', 'مرقة فراخ', 'Soups', 15, 1.7, 0.2, 0.8, 0.0, 0.2, 490, 'preset'),
('Lentil Soup', 'شوربة عدس', 'Soups', 116, 9.0, 20.0, 0.4, 8.0, 2.0, 300, 'preset'),
('Tomato Soup', 'شوربة طماطم', 'Soups', 54, 1.5, 10.0, 1.2, 1.5, 5.5, 480, 'preset'),
('Vegetable Soup', 'شوربة خضار', 'Soups', 60, 2.5, 10.0, 1.0, 2.0, 3.5, 400, 'preset'),
('Beef Broth', 'مرقة لحمة', 'Soups', 20, 2.5, 0.2, 0.9, 0.0, 0.2, 520, 'preset'),
('Harira Soup', 'حريرة', 'Soups', 90, 5.0, 13.0, 2.0, 3.0, 2.0, 350, 'preset'),
('Molokhia Soup', 'شوربة ملوخية', 'Soups', 35, 3.0, 5.0, 0.6, 2.0, 0.5, 200, 'preset'),
('Mixed Bean Soup', 'شوربة فاصوليا مشكلة', 'Soups', 110, 7.0, 18.0, 1.5, 5.0, 2.0, 380, 'preset'),

-- ============================================================
-- DESSERTS & SWEETS
-- ============================================================
('Konafa', 'كنافة', 'Desserts', 280, 5.0, 38.0, 13.0, 1.0, 18.0, 200, 'preset'),
('Baklava', 'بقلاوة', 'Desserts', 428, 7.0, 52.0, 23.0, 2.0, 25.0, 180, 'preset'),
('Basbousa', 'بسبوسة', 'Desserts', 380, 6.0, 60.0, 13.0, 1.0, 30.0, 150, 'preset'),
('Cake (chocolate)', 'كيك شوكولاتة', 'Desserts', 371, 4.8, 52.0, 16.5, 1.0, 32.0, 250, 'preset'),
('Cheesecake', 'تشيز كيك', 'Desserts', 321, 5.5, 25.5, 22.7, 0.5, 17.5, 220, 'preset'),
('Brownie', 'براوني', 'Desserts', 466, 5.0, 62.0, 23.0, 2.0, 38.0, 180, 'preset'),
('Cookie (chocolate chip)', 'كوكيز', 'Desserts', 488, 5.0, 65.0, 23.0, 2.0, 32.0, 320, 'preset'),
('Muffin (blueberry)', 'مافن توت', 'Desserts', 377, 5.0, 55.0, 15.0, 1.3, 27.0, 310, 'preset'),
('Halawa / Halva', 'حلاوة', 'Desserts', 469, 14.0, 55.0, 25.0, 3.5, 38.0, 115, 'preset'),
('Lolly / Ice Lolly', 'آيس كريم لولي', 'Desserts', 80, 0.5, 19.0, 0.2, 0.0, 16.0, 10, 'preset'),
('Roz bil Laban (rice pudding)', 'رز باللبن', 'Desserts', 130, 4.0, 24.0, 2.5, 0.2, 10.0, 60, 'preset'),
('Om Ali', 'أم علي', 'Desserts', 280, 7.0, 32.0, 14.0, 0.5, 15.0, 120, 'preset'),
('Biscotti', 'بيسكوتي', 'Desserts', 423, 8.5, 73.0, 11.5, 1.5, 23.0, 200, 'preset'),
('Muhallabia', 'مهلبية', 'Desserts', 120, 3.5, 20.0, 3.0, 0.0, 15.0, 70, 'preset'),
('Ashura', 'عاشوراء', 'Desserts', 150, 3.5, 30.0, 2.5, 2.5, 12.0, 60, 'preset'),

-- ============================================================
-- PROTEIN SOURCES (EXTRAS)
-- ============================================================
('Beef Kebab (grilled)', 'كباب لحمة مشوي', 'Protein Sources', 275, 23.0, 3.0, 19.0, 0.0, 1.0, 380, 'preset'),
('Mixed Grill Platter (avg per 100g)', 'مشاوي مشكلة', 'Protein Sources', 265, 27.0, 2.0, 17.0, 0.0, 0.5, 350, 'preset'),
('Chicken Tikka (grilled)', 'تيكا فراخ', 'Protein Sources', 165, 29.0, 3.0, 4.0, 0.0, 1.5, 360, 'preset'),
('Beef Tenderloin (grilled)', 'تندرلوين لحمة', 'Protein Sources', 218, 32.0, 0.0, 9.5, 0.0, 0.0, 60, 'preset'),
('Chicken Souvlaki', 'سوفلاكي فراخ', 'Protein Sources', 180, 28.0, 4.0, 5.5, 0.0, 2.0, 400, 'preset'),
('Lamb Souvlaki', 'سوفلاكي ضاني', 'Protein Sources', 220, 24.0, 4.0, 12.0, 0.0, 2.0, 420, 'preset'),
('Protein Mug Cake (per 100g)', 'مج كيك بروتين', 'Protein Sources', 180, 18.0, 18.0, 4.0, 2.0, 5.0, 200, 'preset'),
('Tofu (firm)', 'توفو', 'Protein Sources', 76, 8.0, 1.9, 4.8, 0.3, 0.9, 7, 'preset'),
('Tempeh', 'تمبيه', 'Protein Sources', 193, 19.0, 9.4, 10.8, 0.0, 0.0, 9, 'preset'),
('Luncheon Meat (chicken)', 'لانشون فراخ', 'Protein Sources', 195, 17.0, 5.0, 12.0, 0.0, 2.0, 850, 'preset'),
('Luncheon Meat (beef)', 'لانشون لحمة', 'Protein Sources', 260, 14.0, 4.0, 22.0, 0.0, 1.5, 1000, 'preset');

-- ============================================================
-- INDEXES for fast search
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_food_name ON food_inventory(name);
CREATE INDEX IF NOT EXISTS idx_food_category ON food_inventory(category);
CREATE INDEX IF NOT EXISTS idx_food_source ON food_inventory(source);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_food_name_search ON food_inventory USING gin(to_tsvector('english', name));
