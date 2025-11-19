const { Listing } = require('../models');

exports.getListings = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query; // radius in meters

    if (lat && lng) {
      const maxDistance = parseInt(radius, 10) || 5000; // default 5km

      const listings = await Listing.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: maxDistance
          }
        }
      }).limit(200);

      return res.json(listings);
    }

    // fallback: paginated/all listings
    const listings = await Listing.find().sort({ createdAt: -1 }).limit(200);
    return res.json(listings);
  } catch (err) {
    console.error('getListings error', err);
    return res.status(500).json({ message: 'Failed to get listings' });
  }
};

// Keep getAllListings for backward compatibility
exports.getAllListings = exports.getListings;

exports.searchListings = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, category, furnished, verified, minBeds, minBaths, page = 1, pageSize = 20 } = req.query;
    const query = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (category) query.category = category;
    if (furnished) query.furnished = furnished;
    if (verified) query.verified = true;
    if (minBeds) query.bedrooms = { $gte: Number(minBeds) };
    if (minBaths) query.bathrooms = { $gte: Number(minBaths) };

    const skip = (Number(page) - 1) * Number(pageSize);

    const [total, items] = await Promise.all([
      Listing.countDocuments(query),
      Listing.find(query)
        .sort({ available_from: 1, created_at: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean()
    ]);

    res.json({ total, items });
  } catch (err) {
    console.error('Search listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings', details: err.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate('owner', 'name email')
      .lean();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error('Get listing error:', err);
    res.status(500).json({ error: 'Failed to fetch listing', details: err.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    // ownerEmail from authenticated user if available, otherwise from body
    const ownerEmail = req.user?.email || req.body.ownerEmail;
    if (!ownerEmail) return res.status(400).json({ message: 'ownerEmail required' });

    // accept location as { lat, lng } or GeoJSON
    let location = { type: 'Point', coordinates: [0, 0] };
    if (req.body.location && req.body.location.coordinates) {
      location = req.body.location;
    } else if (req.body.lat && req.body.lng) {
      location = { type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)] };
    }

    const images = Array.isArray(req.body.images) ? req.body.images : [];

    const listingData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      locationText: req.body.locationText || req.body.address || '',
      location,
      propertyType: req.body.propertyType,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      area: req.body.area,
      furnished: req.body.furnished,
      furnishing: req.body.furnishing || 'Unfurnished',
      depositAmount: req.body.depositAmount || 0,
      availableFor: req.body.availableFor || 'Any',
      availableUnits: req.body.availableUnits || 1,
      amenities: req.body.amenities || [],
      images,
      ownerEmail
    };

    // Set owner reference if authenticated user exists
    if (req.user?.userId) {
      listingData.owner = req.user.userId;
    }

    const listing = await Listing.create(listingData);
    return res.status(201).json(listing);
  } catch (err) {
    console.error('createListing error', err);
    return res.status(500).json({ message: 'Failed to create listing' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    
    const updateData = {
      ...(b.title && { title: b.title }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.image_url !== undefined && { image_url: b.image_url }),
      ...(b.address !== undefined && { address: b.address }),
      ...(b.latitude && b.longitude && { 
        location: {
          type: 'Point',
          coordinates: [b.longitude, b.latitude]
        }
      }),
      ...(b.owner_phone !== undefined && { owner_phone: b.owner_phone }),
      ...(b.bedrooms !== undefined && { bedrooms: b.bedrooms }),
      ...(b.bathrooms !== undefined && { bathrooms: b.bathrooms }),
      ...(b.area_sqft !== undefined && { area_sqft: b.area_sqft }),
      ...(b.furnished !== undefined && { furnished: b.furnished }),
      ...(b.verified !== undefined && { verified: Boolean(b.verified) }),
      ...(b.deposit !== undefined && { deposit: b.deposit }),
      ...(b.show_date && { available_from: new Date(b.show_date) }),
      ...(b.contact_start !== undefined && { contact_start: b.contact_start }),
      ...(b.contact_end !== undefined && { contact_end: b.contact_end }),
      ...(b.price !== undefined && { price: b.price }),
      ...(b.total_seats !== undefined && { total_units: b.total_seats }),
      ...(b.available_seats !== undefined && { available_units: b.available_seats }),
      ...(b.venue !== undefined && { city: b.venue }),
      ...(b.category !== undefined && { category: b.category }),
      updated_at: new Date()
    };

    const listing = await Listing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ error: 'Failed to update listing', details: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ error: 'Failed to delete listing', details: err.message });
  }
};

exports.verifyListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(
      id,
      { verified: true, updated_at: new Date() },
      { new: true }
    ).lean();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ message: 'Listing verified' });
  } catch (err) {
    console.error('Verify listing error:', err);
    res.status(500).json({ error: 'Failed to verify listing', details: err.message });
  }
};
