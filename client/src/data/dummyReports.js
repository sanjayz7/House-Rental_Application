// Dummy Reports and Data for Dashboards

export const userReports = [
  {
    id: 1,
    title: 'Property Search Activity Report',
    type: 'search',
    date: '2025-01-15',
    description: 'Summary of your property searches in the last 30 days',
    data: {
      totalSearches: 45,
      propertiesViewed: 23,
      favoritesAdded: 8,
      inquiriesSent: 5
    },
    status: 'active'
  },
  {
    id: 2,
    title: 'Inquiry Status Report',
    type: 'inquiry',
    date: '2025-01-14',
    description: 'Track all your property inquiries and their responses',
    data: {
      totalInquiries: 12,
      responded: 8,
      pending: 3,
      rejected: 1
    },
    status: 'active'
  },
  {
    id: 3,
    title: 'Favorite Properties Analysis',
    type: 'favorites',
    date: '2025-01-13',
    description: 'Analysis of your saved properties and preferences',
    data: {
      totalFavorites: 15,
      averagePrice: 25000,
      mostSearchedArea: 'Chennai',
      preferredType: 'Apartment'
    },
    status: 'active'
  },
  {
    id: 4,
    title: 'Monthly Activity Summary',
    type: 'summary',
    date: '2025-01-01',
    description: 'Complete overview of your rental search activities',
    data: {
      propertiesViewed: 67,
      inquiriesSent: 12,
      favoritesAdded: 18,
      profileViews: 5
    },
    status: 'archived'
  }
];

export const ownerReports = [
  {
    id: 1,
    title: 'Property Performance Report',
    type: 'performance',
    date: '2025-01-15',
    description: 'Detailed analysis of your property listings performance',
    data: {
      totalListings: 8,
      activeListings: 6,
      totalViews: 1245,
      inquiriesReceived: 34,
      conversionRate: '12.5%'
    },
    status: 'active'
  },
  {
    id: 2,
    title: 'Inquiry Management Report',
    type: 'inquiries',
    date: '2025-01-14',
    description: 'Overview of all property inquiries and responses',
    data: {
      totalInquiries: 34,
      newInquiries: 8,
      responded: 24,
      pending: 2
    },
    status: 'active'
  },
  {
    id: 3,
    title: 'Revenue Analytics',
    type: 'revenue',
    date: '2025-01-13',
    description: 'Monthly revenue and booking statistics',
    data: {
      totalRevenue: 240000,
      monthlyAverage: 30000,
      bookingsThisMonth: 4,
      occupancyRate: '75%'
    },
    status: 'active'
  },
  {
    id: 4,
    title: 'Property Views Report',
    type: 'views',
    date: '2025-01-12',
    description: 'Track which properties get the most attention',
    data: {
      totalViews: 1245,
      uniqueVisitors: 892,
      averageViewsPerListing: 155,
      topPerformingProperty: 'Modern 3 BHK Apartment'
    },
    status: 'active'
  },
  {
    id: 5,
    title: 'Quarterly Business Report',
    type: 'quarterly',
    date: '2024-12-31',
    description: 'Complete quarterly business performance summary',
    data: {
      totalRevenue: 720000,
      newListings: 3,
      totalInquiries: 98,
      averageResponseTime: '2.5 hours'
    },
    status: 'archived'
  }
];

export const adminReports = [
  {
    id: 1,
    title: 'Platform Analytics Report',
    type: 'analytics',
    date: '2025-01-15',
    description: 'Complete platform statistics and user engagement metrics',
    data: {
      totalUsers: 1250,
      totalOwners: 180,
      totalListings: 450,
      activeBookings: 89,
      platformRevenue: 1250000
    },
    status: 'active'
  },
  {
    id: 2,
    title: 'User Activity Report',
    type: 'users',
    date: '2025-01-14',
    description: 'Detailed user engagement and activity metrics',
    data: {
      dailyActiveUsers: 342,
      monthlyActiveUsers: 1250,
      newRegistrations: 45,
      userRetentionRate: '78%'
    },
    status: 'active'
  },
  {
    id: 3,
    title: 'Listing Quality Report',
    type: 'listings',
    date: '2025-01-13',
    description: 'Analysis of listing quality and verification status',
    data: {
      totalListings: 450,
      verifiedListings: 380,
      pendingVerification: 45,
      rejectedListings: 25,
      averageRating: 4.6
    },
    status: 'active'
  },
  {
    id: 4,
    title: 'Revenue & Transactions Report',
    type: 'revenue',
    date: '2025-01-12',
    description: 'Platform revenue and transaction statistics',
    data: {
      totalRevenue: 1250000,
      commissionEarned: 125000,
      totalTransactions: 234,
      averageTransactionValue: 5341
    },
    status: 'active'
  },
  {
    id: 5,
    title: 'Security & Compliance Report',
    type: 'security',
    date: '2025-01-11',
    description: 'Security incidents and compliance status',
    data: {
      securityIncidents: 2,
      resolvedIssues: 2,
      complianceScore: '98%',
      dataBreaches: 0
    },
    status: 'active'
  },
  {
    id: 6,
    title: 'Monthly Platform Report',
    type: 'monthly',
    date: '2024-12-31',
    description: 'Complete monthly platform performance summary',
    data: {
      newUsers: 234,
      newListings: 67,
      totalBookings: 189,
      platformGrowth: '15%'
    },
    status: 'archived'
  }
];

export const userDummyData = {
  recentActivity: [
    { id: 1, action: 'Viewed property', property: 'Modern 3 BHK Apartment', time: '2 hours ago' },
    { id: 2, action: 'Added to favorites', property: 'Luxury Villa with Garden', time: '5 hours ago' },
    { id: 3, action: 'Sent inquiry', property: 'Cozy 1 BHK for Rent', time: '1 day ago' },
    { id: 4, action: 'Viewed property', property: 'Premium 2 BHK Apartment', time: '2 days ago' }
  ],
  savedSearches: [
    { id: 1, name: 'Chennai Apartments', criteria: '2-3 BHK, ₹20k-30k', results: 12, lastSearch: '2025-01-15' },
    { id: 2, name: 'Coimbatore Houses', criteria: '3-4 BHK, ₹30k-50k', results: 8, lastSearch: '2025-01-14' },
    { id: 3, name: 'Bangalore Studios', criteria: '1 BHK, Under ₹15k', results: 5, lastSearch: '2025-01-13' }
  ],
  recommendations: [
    { id: 1, property: 'Spacious 4 BHK House', reason: 'Matches your saved search criteria', price: 55000 },
    { id: 2, property: 'Modern 1 BHK Apartment', reason: 'Based on your viewing history', price: 18000 },
    { id: 3, property: 'Luxury 3 BHK Penthouse', reason: 'Similar to your favorites', price: 80000 }
  ]
};

export const ownerDummyData = {
  recentInquiries: [
    { id: 1, property: 'Modern 3 BHK Apartment', user: 'John Doe', time: '1 hour ago', status: 'new' },
    { id: 2, property: 'Luxury Villa with Garden', user: 'Priya Sharma', time: '3 hours ago', status: 'responded' },
    { id: 3, property: 'Cozy 1 BHK for Rent', user: 'Amit Patel', time: '1 day ago', status: 'pending' }
  ],
  topPerformingProperties: [
    { id: 1, property: 'Modern 3 BHK Apartment', views: 245, inquiries: 12, conversion: '4.9%' },
    { id: 2, property: 'Luxury Villa with Garden', views: 189, inquiries: 8, conversion: '4.2%' },
    { id: 3, property: 'Premium 2 BHK Apartment', views: 156, inquiries: 6, conversion: '3.8%' }
  ],
  monthlyStats: {
    revenue: 240000,
    bookings: 4,
    inquiries: 34,
    views: 1245
  }
};

export const adminDummyData = {
  systemHealth: {
    uptime: '99.9%',
    responseTime: '120ms',
    errorRate: '0.1%',
    activeUsers: 342
  },
  recentActivities: [
    { id: 1, action: 'New user registered', user: 'Rajesh Kumar', time: '30 minutes ago' },
    { id: 2, action: 'Property verified', property: 'Modern 3 BHK Apartment', time: '1 hour ago' },
    { id: 3, action: 'Listing reported', property: 'Cozy 1 BHK', time: '2 hours ago', status: 'pending' },
    { id: 4, action: 'User banned', user: 'Spam User', reason: 'Violation of terms', time: '3 hours ago' }
  ],
  platformMetrics: {
    totalUsers: 1250,
    totalOwners: 180,
    totalListings: 450,
    activeBookings: 89,
    dailyRevenue: 45000
  }
};

