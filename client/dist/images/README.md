# 🖼️ Images Directory Structure

This directory contains all images used in the Home Rental Application, organized into logical folders for easy maintenance.

## 📁 Directory Structure

```
images/
├── properties/     # Main property listing images (houses, apartments, villas)
├── rooms/         # Room-specific images (bedrooms, kitchens, bathrooms, etc.)
├── placeholders/  # Default/placeholder images for missing photos
└── icons/         # Application icons and UI elements
```

## 📂 Folder Details

### `/properties/`
Contains main property images:
- `House2.jpg`, `House3.jpg` - Full property views
- `Front_View.jpg` - Property front views
- `House2_Front.jpg`, `House2_Entrance.jpg` - Property entrances
- `House2_Hall.jpg`, `House2_MainHall.jpg` - Main hall areas
- `Top.jpg` - Top/rooftop views

**Usage:**
```javascript
images: ['/images/properties/House2.jpg', '/images/properties/Front_View.jpg']
```

### `/rooms/`
Contains room-specific images:
- `BedRoom.jpg`, `BedRoom1.jpg`, `BedRoom2.jpg` - Bedroom images
- `Kitchen.jpg`, `House2_Kitchen.jpg` - Kitchen images
- `BathRoom.jpg` - Bathroom images
- `Hall.jpg` - Hall/living room images
- `Balcony.jpg` - Balcony images
- `Enterance.jpg` - Entrance images

**Usage:**
```javascript
images: ['/images/rooms/BedRoom.jpg', '/images/rooms/Kitchen.jpg']
```

### `/placeholders/`
Default images used when property images are not available.

**Usage:**
```javascript
image: listing.image || '/images/placeholders/default-property.jpg'
```

### `/icons/`
Application icons, logos, and UI elements.

## 🔄 Migration Notes

**Old Path:** `/sample-properties/`
**New Path:** `/images/properties/` or `/images/rooms/`

The old `/sample-properties/` folder has been reorganized. All images have been moved to the appropriate subdirectories under `/images/`.

## 📝 Image Naming Conventions

1. **Property Images:** Use descriptive names like `House2.jpg`, `Villa1.jpg`, `Apartment1.jpg`
2. **Room Images:** Use room type prefix: `BedRoom.jpg`, `Kitchen.jpg`, `BathRoom.jpg`
3. **Multiple Views:** Use suffixes: `House2_Front.jpg`, `House2_Kitchen.jpg`

## 🚀 Adding New Images

1. **Property Images:** Add to `images/properties/`
2. **Room Images:** Add to `images/rooms/`
3. **Placeholders:** Add to `images/placeholders/`
4. **Icons:** Add to `images/icons/`

## 💡 Best Practices

1. **File Formats:** Use `.jpg` for photos, `.png` for icons with transparency
2. **File Sizes:** Optimize images for web (recommended: < 500KB per image)
3. **Naming:** Use PascalCase or camelCase, avoid spaces
4. **Dimensions:** 
   - Property images: 1200x800px (16:9 ratio)
   - Room images: 800x600px (4:3 ratio)
   - Icons: 64x64px or 128x128px

## 🔗 References in Code

Images are referenced in:
- `server/setupSampleListings.js` - Seed data
- `client/src/data/sampleHouses.js` - Sample house data
- `client/src/components/HomePage.jsx` - Homepage featured properties
- `client/src/components/ShowList99Acres.jsx` - Property listing page

## 📋 Current Image Inventory

### Properties (17 images)
- Full property views: House2.jpg, House3.jpg
- Front/entrance views: Front_View.jpg, House2_Front.jpg, House2_Entrance.jpg
- Hall areas: House2_Hall.jpg, House2_MainHall.jpg
- Top view: Top.jpg

### Rooms (9 images)
- Bedrooms: BedRoom.jpg, BedRoom1.jpg, BedRoom2.jpg
- Kitchen: Kitchen.jpg, House2_Kitchen.jpg
- Bathroom: BathRoom.jpg
- Hall: Hall.jpg
- Balcony: Balcony.jpg
- Entrance: Enterance.jpg
