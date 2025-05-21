@echo off
echo Moving images for FertiShop project...

cd %~dp0

rem Create directories if they don't exist
if not exist "public\images\products" mkdir "public\images\products"
if not exist "public\images\products\plant-nutrients" mkdir "public\images\products\plant-nutrients"
if not exist "public\images\products\growth-boosters" mkdir "public\images\products\growth-boosters"

rem Copy the existing bone meal image to the new name
copy "public\images\products\product-bone-meal.jpg" "public\images\products\product-bone-meal-farmer.jpg"

rem Copy the soil enhancer category image for moisture retention
copy "public\images\products\soil-enhancer-category.jpg" "public\images\products\product-moisture-retention.jpg"

rem Move Plant Nutrients related images
move "public\images\products\MicroNutrient Complete Mix.jpg" "public\images\products\plant-nutrients\"
move "public\images\products\IronBoost Chelated Iron.jpg" "public\images\products\plant-nutrients\"
move "public\images\products\LeafShine Foliar Spray.webp" "public\images\products\plant-nutrients\"

rem Move Growth Boosters related images
move "public\images\products\BloomBoost Flowering Stimulant.jpg" "public\images\products\growth-boosters\"
move "public\images\products\FruitBoost Fruiting Formula.jpg" "public\images\products\growth-boosters\"
move "public\images\products\HarvestMax Yield Booster.webp" "public\images\products\growth-boosters\"

echo Image files have been set up.
echo Please replace with actual images if needed.
echo.
echo Done!
pause 