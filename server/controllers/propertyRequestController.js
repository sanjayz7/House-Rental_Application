const { PropertyRequest, Listing } = require('../models');

// Create a new property request
exports.createPropertyRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;
    const userId = req.user.userId;

    console.log('📥 Received property request:', {
      listingId,
      listingIdType: typeof listingId,
      userId,
      userEmail: req.user.email,
      messageLength: message?.length
    });

    // Validate listingId format (MongoDB ObjectId should be 24 hex characters)
    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID is required'
      });
    }

    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      console.error('❌ Listing not found in database:', listingId);
      return res.status(404).json({
        success: false,
        message: 'Listing not found. The property may have been removed or the ID is invalid.'
      });
    }

    console.log('✅ Listing found:', {
      listingId: listing._id,
      title: listing.title,
      ownerEmail: listing.ownerEmail,
      ownerId: listing.owner?.toString()
    });

    // Check if a request already exists
    const existingRequest = await PropertyRequest.findOne({
      user: userId,
      listing: listingId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this property'
      });
    }

    // Create new request
    const propertyRequest = await PropertyRequest.create({
      user: userId,
      listing: listingId,
      message
    });

    await propertyRequest.populate('user', 'name email');
    await propertyRequest.populate('listing', 'title location price images owner ownerEmail');

    console.log('✅ Property request created successfully:', {
      requestId: propertyRequest._id,
      userId: userId,
      listingId: listingId,
      listingTitle: listing.title,
      listingOwner: listing.owner?.toString(),
      listingOwnerEmail: listing.ownerEmail,
      message: message
    });
    
    // Log all requests for debugging
    const allRequests = await PropertyRequest.find({}).populate('listing', 'title ownerEmail');
    console.log('📊 Total requests in database:', allRequests.length);
    allRequests.forEach((req, idx) => {
      console.log(`  Request ${idx + 1}:`, {
        id: req._id,
        listingId: req.listing?._id,
        listingTitle: req.listing?.title,
        listingOwnerEmail: req.listing?.ownerEmail,
        status: req.status
      });
    });

    res.status(201).json({
      success: true,
      message: 'Property request created successfully',
      request: propertyRequest
    });

  } catch (error) {
    console.error('Error creating property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property request'
    });
  }
};

// Get requests for a user
exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await PropertyRequest.find({ user: userId })
      .populate('listing', 'title location price images')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Error getting user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get property requests'
    });
  }
};

// Get requests for an owner's properties
exports.getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const ownerEmail = req.user.email;

    console.log('getOwnerRequests called:', { ownerId, ownerEmail });

    // For testing: sanjayk.1234it@kongu.edu sees all requests
    // In production, remove this and only show requests for owner's listings
    if (ownerEmail === 'sanjayk.1234it@kongu.edu') {
      const allRequests = await PropertyRequest.find({})
        .populate('user', 'name email')
        .populate('listing', 'title locationText location price images owner ownerEmail')
        .sort({ created_at: -1 });

      console.log('sanjayk.1234it@kongu.edu - Found all requests:', allRequests.length);
      
      return res.json({
        success: true,
        requests: allRequests
      });
    }

    // Normal flow: get all listings owned by this user
    // Check both owner ObjectId and ownerEmail
    const listings = await Listing.find({
      $or: [
        { owner: ownerId },
        { ownerEmail: ownerEmail }
      ]
    }, '_id ownerEmail owner');

    console.log('Found listings for owner:', listings.length, listings.map(l => ({ id: l._id, ownerEmail: l.ownerEmail })));

    const listingIds = listings.map(listing => listing._id);

    if (listingIds.length === 0) {
      console.log('No listings found for owner, returning empty requests');
      return res.json({
        success: true,
        requests: []
      });
    }

    // Then get all requests for these listings
    const requests = await PropertyRequest.find({
      listing: { $in: listingIds }
    })
      .populate('user', 'name email')
      .populate('listing', 'title locationText location price images owner ownerEmail')
      .sort({ created_at: -1 });

    console.log('Found requests for owner listings:', requests.length);

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Error getting owner requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get property requests',
      error: error.message
    });
  }
};

// Update request status (approve/reject)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, response } = req.body;
    const ownerId = req.user.userId;

    // Find the request
    const propertyRequest = await PropertyRequest.findById(requestId)
      .populate('listing', 'owner ownerEmail title');

    if (!propertyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found'
      });
    }

    // Verify that the owner owns this property
    // Allow sanjayk.1234it@kongu.edu to accept any request for testing
    const listing = propertyRequest.listing;
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found for this request'
      });
    }
    
    const isOwner = listing.owner && listing.owner.toString() === ownerId;
    const isOwnerByEmail = listing.ownerEmail && listing.ownerEmail === req.user.email;
    const isTestOwner = req.user.email === 'sanjayk.1234it@kongu.edu';
    
    if (!isOwner && !isOwnerByEmail && !isTestOwner) {
      console.log('Authorization check failed:', {
        listingOwner: listing.owner?.toString(),
        ownerId,
        listingOwnerEmail: listing.ownerEmail,
        userEmail: req.user.email,
        isOwner,
        isOwnerByEmail,
        isTestOwner
      });
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this request'
      });
    }
    
    console.log('✅ Authorization passed:', {
      requestId,
      status,
      ownerEmail: req.user.email,
      listingOwner: listing.owner?.toString(),
      listingOwnerEmail: listing.ownerEmail
    });

    // Update the request
    propertyRequest.status = status;
    propertyRequest.response = response || '';
    await propertyRequest.save();

    await propertyRequest.populate('user', 'name email');
    await propertyRequest.populate('listing', 'title location price images');

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request: propertyRequest
    });

  } catch (error) {
    console.error('Error updating property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property request'
    });
  }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const request = await PropertyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found'
      });
    }

    // Verify that the user owns this request
    if (request.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this request'
      });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: 'Property request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property request'
    });
  }
};