# Image Directory Structure Guide

## Quick Reference

```
client/public/images/
│
├── properties/          # Main property images
│   ├── House2.jpg
│   ├── House3.jpg
│   ├── Front_View.jpg
│   └── ...
│
├── rooms/               # Room-specific images
│   ├── BedRoom.jpg
│   ├── Kitchen.jpg
│   ├── BathRoom.jpg
│   └── ...
│
├── placeholders/        # Default/fallback images
│   └── (to be added)
│
└── icons/               # App icons and UI elements
    └── (to be added)
```

## Path Mapping

### Old → New Paths

| Old Path | New Path | Category |
|----------|----------|----------|
| `/sample-properties/House2.jpg` | `/images/properties/House2.jpg` | Property |
| `/sample-properties/BedRoom.jpg` | `/images/rooms/BedRoom.jpg` | Room |
| `/sample-properties/Kitchen.jpg` | `/images/rooms/Kitchen.jpg` | Room |
| `/sample-properties/BathRoom.jpg` | `/images/rooms/BathRoom.jpg` | Room |

## Code Updates Needed

If you want to use the new paths, update references in:

1. **Server Seed Scripts:**
   - `server/setupSampleListings.js` - Update image paths
   - `server/setupSampleData.js` - Update image paths

2. **Client Components:**
   - `client/src/data/sampleHouses.js` - Update IMAGE_URL paths
   - `client/src/components/HomePage.jsx` - Update image paths

**Note:** The old `/sample-properties/` paths will still work if you maintain backward compatibility, but using the new structure is recommended for better organization.

