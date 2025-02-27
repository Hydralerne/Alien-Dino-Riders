# Create necessary directories
New-Item -ItemType Directory -Force -Path "public/models"
New-Item -ItemType Directory -Force -Path "public/textures"
New-Item -ItemType Directory -Force -Path "public/sounds"
New-Item -ItemType Directory -Force -Path "public/draco"

# Download DRACO decoder
$dracoURL = "https://www.gstatic.com/draco/v1/decoders/draco_decoder_gltf.js"
Invoke-WebRequest -Uri $dracoURL -OutFile "public/draco/draco_decoder_gltf.js"

# Download dinosaur models from Sketchfab
$modelURLs = @{
    "trex" = "https://sketchfab.com/3d-models/tyrannosaurus-rex-8ca1f4a7ff7041b5b4aa663634934f4c"
    "raptor" = "https://sketchfab.com/3d-models/velociraptor-d0b82650c7604d00a9d2ed429f1d8e5b"
    "triceratops" = "https://sketchfab.com/3d-models/triceratops-0c47d4e9eaff4f62a654709d1186d1e9"
    "stegosaurus" = "https://sketchfab.com/3d-models/stegosaurus-3bf0b0d997f04d14a4f229136ab2c3cc"
    "brachiosaurus" = "https://sketchfab.com/3d-models/brachiosaurus-altithorax-cf1a82a3d9674c3e8fdf1953377d40fc"
    "spinosaurus" = "https://sketchfab.com/3d-models/spinosaurus-2f652c8cd0fe4c6284f9c6a6785f2c69"
    "pterodactyl" = "https://sketchfab.com/3d-models/pteranodon-longiceps-d8651bfeb8f34da28e2f8fa2b3f545bc"
    "ankylosaurus" = "https://sketchfab.com/3d-models/ankylosaurus-magniventris-d07f1b17ed744d1c9b45b26c2d72b53f"
}

Write-Host "Please visit these URLs to download the dinosaur models:"
foreach ($model in $modelURLs.GetEnumerator()) {
    Write-Host "Download $($model.Key).glb from: $($model.Value)"
    Write-Host "Save it to: public/models/$($model.Key).glb"
}

# Create placeholder textures
$dinosaurs = @("trex", "raptor", "triceratops", "stegosaurus", "brachiosaurus", "spinosaurus", "pterodactyl", "ankylosaurus")
foreach ($dino in $dinosaurs) {
    $normalFile = "public/textures/$($dino)_normal.jpg"
    $roughnessFile = "public/textures/$($dino)_roughness.jpg"
    
    # Create placeholder texture files
    Copy-Item "placeholder_normal.jpg" -Destination $normalFile -ErrorAction SilentlyContinue
    Copy-Item "placeholder_roughness.jpg" -Destination $roughnessFile -ErrorAction SilentlyContinue
}

# Download sound effects
$soundURLs = @{
    "trex_roar" = "https://freesound.org/people/Audio_Dread/sounds/467858/"
    "trex_stomp" = "https://freesound.org/people/Audio_Dread/sounds/467859/"
    # Add more sound URLs here
}

Write-Host "`nPlease visit these URLs to download the dinosaur sounds:"
foreach ($sound in $soundURLs.GetEnumerator()) {
    Write-Host "Download $($sound.Key).mp3 from: $($sound.Value)"
    Write-Host "Save it to: public/sounds/$($sound.Key).mp3"
}

Write-Host "`nInstructions:"
Write-Host "1. Visit each Sketchfab link and download the GLB model"
Write-Host "2. Save each model to the public/models directory"
Write-Host "3. Visit each sound link and download the MP3 file"
Write-Host "4. Save each sound to the public/sounds directory"
Write-Host "5. For textures, you can use the placeholder files or download custom textures"