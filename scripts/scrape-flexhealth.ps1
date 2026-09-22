# Scrape products + images from flexhealth.in WooCommerce API
$ErrorActionPreference = 'Continue'
$root = Split-Path $PSScriptRoot -Parent
$imgDir = Join-Path $root 'images\products'
$dataDir = Join-Path $root 'data'
$scriptsDir = Join-Path $root 'scripts'
New-Item -ItemType Directory -Force -Path $imgDir, $dataDir, $scriptsDir | Out-Null

function Decode-Html([string]$text) {
  if (-not $text) { return '' }
  Add-Type -AssemblyName System.Web
  return [System.Web.HttpUtility]::HtmlDecode($text)
}

function Strip-Html([string]$html) {
  if (-not $html) { return '' }
  $t = Decode-Html $html
  $t = $t -replace '<[^>]+>', ' '
  $t = $t -replace '\s+', ' '
  return $t.Trim()
}

$brandMap = @{
  'ON (OPTIMUM NUTRITION)'       = @{ id='optimum-nutrition'; name='Optimum Nutrition' }
  'MUSCLETECH NUTRITION'         = @{ id='muscletech'; name='MuscleTech' }
  'DYMATIZE NUTRITION'           = @{ id='dymatize'; name='Dymatize' }
  'BSN NUTRITION'                = @{ id='bsn'; name='BSN' }
  'CELLUCORE NUTRITION'          = @{ id='cellucor'; name='Cellucor' }
  'FLEX POWER NUTRITION'         = @{ id='flex-power'; name='Flex Power Nutrition' }
  'REBEL NUTRITION'              = @{ id='rebel-nutrition'; name='Rebel Nutrition' }
  'RULE 1 NUTRITION'             = @{ id='rule-1'; name='Rule 1 Nutrition' }
  'KEVIN LEVRON NUTRITION'       = @{ id='kevin-levrone'; name='Kevin Levrone' }
  'NUTREX NUTRITION'             = @{ id='nutrex'; name='Nutrex Research' }
  'NATURE BEST NUTRITION ISOPURE' = @{ id='isopure'; name='Isopure' }
  'ULTIMATE NUTRITION'           = @{ id='universal'; name='Universal Nutrition' }
  'GNC NUTRITION'                = @{ id='gnc'; name='GNC' }
  'MUSCLEBLAZE NUTRITION'        = @{ id='muscleblaze'; name='MuscleBlaze' }
  'BPI NUTRITION'                = @{ id='bpi'; name='BPI Sports' }
  'LABRADA NUTRITION'            = @{ id='labrada'; name='Labrada' }
  'RONIE COLEMAN NUTRITION'      = @{ id='ronnie-coleman'; name='Ronnie Coleman' }
  'BIG MUCLES NUTRITION'         = @{ id='big-muscles'; name='Big Muscles' }
  'SCITRON NUTRITION'            = @{ id='scitron'; name='Scitron' }
  'ICONIC NUTRITION'             = @{ id='iconic'; name='Iconic Nutrition' }
  'INSANE LAB'                   = @{ id='insane-lab'; name='Insane Lab' }
  'Now Foods Nutrition'          = @{ id='now-foods'; name='Now Foods' }
  'ALASKA SUNLINE'               = @{ id='alaska'; name='Alaska Sunline' }
  'SCIVITION NUTRITION'          = @{ id='scivation'; name='Scivation' }
}

function Get-ProductCategory($product, [string]$name) {
  $cats = @($product.categories | ForEach-Object { Decode-Html $_.name })
  $n = $name.ToLower()
  if ($cats -match 'SUPER SAVER COMBO') { return 'combo' }
  if ($cats -match 'Weight Gainer') { return 'mass-gainer' }
  if ($cats -match 'Whey protein') { return 'whey' }
  if ($cats -match 'Pre and post workout') { return 'pre-workout' }
  if ($cats -match 'INTRA WORKOUT') { return 'bcaa' }
  if ($cats -match 'Multivitamin|FAT BURNER') { return 'vitamins' }
  if ($n -match 'creatine') { return 'creatine' }
  if ($n -match 'bcaa|amino|eaa') { return 'bcaa' }
  if ($n -match 'mass gainer|weight gainer|mass tech|anabolic mass') { return 'mass-gainer' }
  if ($n -match 'pre workout|pre-workout|nitrix|pump') { return 'pre-workout' }
  if ($n -match 'whey|protein isolate|nitrotech|iso100') { return 'whey' }
  if ($n -match 'multivitamin|omega|fish oil|vitamin|capsule|tablet') { return 'vitamins' }
  return 'whey'
}

function Get-ProductBrand($product) {
  foreach ($c in $product.categories) {
    $cn = Decode-Html $c.name
    if ($brandMap.ContainsKey($cn)) { return $brandMap[$cn] }
  }
  return @{ id='other'; name='Flex Health' }
}

Write-Host 'Fetching products from flexhealth.in...'
$all = [System.Collections.Generic.List[object]]::new()
$headers = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
for ($page = 1; $page -le 10; $page++) {
  try {
    $r = Invoke-WebRequest -Uri "https://flexhealth.in/wp-json/wc/store/v1/products?per_page=100&page=$page" -Headers $headers -UseBasicParsing -TimeoutSec 60
    $batch = $r.Content | ConvertFrom-Json
    if (-not $batch -or $batch.Count -eq 0) { break }
    $all.AddRange($batch)
    Write-Host "  Page $page : $($batch.Count) products (total $($all.Count))"
  } catch {
    Write-Host "  Page $page failed: $($_.Exception.Message)"
    break
  }
}

Write-Host "Downloaded $($all.Count) products. Fetching images..."
$converted = @()
$i = 0
foreach ($p in $all) {
  $i++
  $name = Decode-Html $p.name
  $brand = Get-ProductBrand $p
  $category = Get-ProductCategory $p $name
  $price = [math]::Round([int]$p.prices.price / 100)
  $regular = [math]::Round([int]$p.prices.regular_price / 100)
  $salePrice = if ($p.prices.sale_price) { [math]::Round([int]$p.prices.sale_price / 100) } else { $price }
  $onSale = [bool]$p.on_sale -and ($regular -gt $salePrice)
  $slug = ($p.slug -replace '[^a-z0-9-]', '').Substring(0, [Math]::Min(80, $p.slug.Length))
  $id = if ($p.sku) { ($p.sku -replace '[^a-zA-Z0-9]', '').ToLower() } else { $slug }

  $imageUrl = $null
  $localImage = "images/products/placeholder.jpg"
  if ($p.images -and $p.images.Count -gt 0) {
    $imageUrl = $p.images[0].src
    $ext = [System.IO.Path]::GetExtension(($imageUrl -split '\?')[0])
    if (-not $ext -or $ext.Length -gt 5) { $ext = '.jpg' }
    $fileName = "$id$ext"
    $localPath = Join-Path $imgDir $fileName
    $localImage = "images/products/$fileName"
    if (-not (Test-Path $localPath)) {
      try {
        Invoke-WebRequest -Uri $imageUrl -Headers $headers -UseBasicParsing -OutFile $localPath -TimeoutSec 30
      } catch {
        Write-Host "  Image fail [$id]: $($_.Exception.Message)"
        $localImage = $imageUrl
      }
    }
  }

  $cats = @($p.categories | ForEach-Object { Decode-Html $_.name })
  $badge = $null
  if ($cats -match 'NEW ARRIVAL') { $badge = 'New Arrival' }
  elseif ($cats -match 'SUPER SAVER COMBO') { $badge = 'Combo Offer' }
  elseif ($cats -match 'HOT SELLING') { $badge = 'Best Seller' }
  elseif ($onSale) { $badge = 'Sale' }

  $shortDesc = Strip-Html $p.short_description
  if ($shortDesc.Length -gt 280) { $shortDesc = $shortDesc.Substring(0, 277) + '...' }

  $converted += [ordered]@{
    id            = $id
    slug          = $p.slug
    name          = $name
    brand         = $brand.name
    brandId       = $brand.id
    category      = $category
    price         = if ($onSale) { $salePrice } else { $price }
    originalPrice = if ($onSale -and $regular -gt $salePrice) { $regular } else { $null }
    badge         = $badge
    rating        = [double]$p.average_rating
    reviews       = [int]$p.review_count
    inStock       = [bool]$p.is_in_stock
    isSale        = $onSale
    isNew         = ($cats -match 'NEW ARRIVAL')
    isPopular     = ($cats -match 'HOT SELLING') -or ($i -le 20)
    image         = $localImage
    imageUrl      = $imageUrl
    permalink     = $p.permalink
    sku           = $p.sku
    shortDescription = $shortDesc
    description   = Strip-Html $p.description
    siteCategories = $cats
  }

  if ($i % 25 -eq 0) { Write-Host "  Processed $i / $($all.Count)" }
}

# Preserve existing meta from products.json
$existingPath = Join-Path $dataDir 'products.json'
$meta = @{ categories = @(); brands = @(); reviews = @(); banners = @() }
if (Test-Path $existingPath) {
  try {
    $existing = Get-Content $existingPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($existing.categories) { $meta.categories = @($existing.categories) }
    if ($existing.brands) { $meta.brands = @($existing.brands) }
    if ($existing.reviews) { $meta.reviews = @($existing.reviews) }
    if ($existing.banners) { $meta.banners = @($existing.banners) }
  } catch {
    Write-Host "Could not read existing products.json: $($_.Exception.Message)"
  }
}

$output = [ordered]@{
  categories = $meta.categories
  brands     = $meta.brands
  products   = $converted
  reviews    = $meta.reviews
  banners    = $meta.banners
  scrapedAt  = (Get-Date).ToString('o')
  source     = 'https://flexhealth.in'
  productCount = $converted.Count
}

$jsonPath = Join-Path $dataDir 'products.json'
$rawJson = $output | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText($jsonPath, $rawJson)
Write-Host "Saved $($converted.Count) products to $jsonPath"

# Save raw API dump for reference
$all | ConvertTo-Json -Depth 6 | Out-File (Join-Path $scriptsDir 'flexhealth-raw.json') -Encoding utf8
Write-Host 'Done.'
