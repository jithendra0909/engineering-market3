import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Listing, Vendor, OrderItem, INITIAL_USER, MOCK_LISTINGS, MOCK_VENDORS, INITIAL_ORDERS } from '../mock/data';

interface AppContextProps {
  currentUser: User | null;
  isLoggedIn: boolean;
  listings: Listing[];
  vendors: Vendor[];
  orders: OrderItem[];
  savedListingIds: string[];
  cartOrPrintJob: any | null;
  login: (email: string) => boolean;
  signup: (userData: Partial<User>) => void;
  logout: () => void;
  setVerificationStatus: (status: User['verificationStatus']) => void;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'sellerId' | 'sellerName' | 'sellerVerificationStatus' | 'whatsappLink'>) => void;
  addOrder: (order: OrderItem) => void;
  updateOrder: (orderId: string, updates: Partial<OrderItem>) => void;
  toggleSaveListing: (listingId: string) => void;
  updateWalletBalance: (amount: number) => void;
  updateProfile: (updates: Partial<User>) => void;
  setCartOrPrintJob: (job: any) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('em_currentUser');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('em_isLoggedIn');
    return saved ? JSON.parse(saved) : true; // Default logged in as Arjun for a smooth initial review
  });

  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('em_listings');
    return saved ? JSON.parse(saved) : MOCK_LISTINGS;
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('em_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('em_savedListingIds');
    return saved ? JSON.parse(saved) : ["lst_2"]; // Casio fx-991 Calculator pre-saved as in 2.png stats (8 items or so, but let's pre-seed some)
  });

  const [cartOrPrintJob, setCartOrPrintJob] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem('em_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('em_isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('em_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('em_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('em_savedListingIds', JSON.stringify(savedListingIds));
  }, [savedListingIds]);

  const login = (email: string): boolean => {
    setIsLoggedIn(true);
    // Find or create user
    if (currentUser && currentUser.email === email) {
      // Keep current
      return true;
    } else {
      // Mock switch or mock restore
      const newUser: User = {
        ...INITIAL_USER,
        email: email,
        fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
        verificationStatus: email.includes('.edu') ? 'verified' : 'pending'
      };
      setCurrentUser(newUser);
    }
    return true;
  };

  const signup = (userData: Partial<User>) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      fullName: userData.fullName || "New Student",
      email: userData.email || "",
      whatsappNumber: userData.whatsappNumber || "",
      collegeId: userData.collegeId || "",
      collegeName: userData.collegeName || "Vignan Institute of Information Technology",
      registrationNumber: userData.registrationNumber || "",
      department: userData.department || "Computer Science Engineering",
      yearOfStudy: userData.yearOfStudy || "1st Year",
      idCardImageUrl: userData.idCardImageUrl || "",
      profilePhotoUrl: userData.profilePhotoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200",
      verificationStatus: "pending",
      role: "student",
      walletBalance: 0
    };
    setCurrentUser(newUser);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const setVerificationStatus = (status: User['verificationStatus']) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        verificationStatus: status
      });
    }
  };

  const addListing = (listing: Omit<Listing, 'id' | 'createdAt' | 'sellerId' | 'sellerName' | 'sellerVerificationStatus' | 'whatsappLink'>) => {
    if (!currentUser) return;
    const newId = `lst_${Date.now()}`;
    const newListing: Listing = {
      ...listing,
      id: newId,
      createdAt: new Date().toISOString(),
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerVerificationStatus: currentUser.verificationStatus,
      whatsappLink: `https://wa.me/${currentUser.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(currentUser.fullName)}%2C%20I%20am%20interested%20in%20your%20listing%20${encodeURIComponent(listing.title)}%20on%20Engineering%20Market.`
    };
    setListings([newListing, ...listings]);
  };

  const addOrder = (order: OrderItem) => {
    setOrders([order, ...orders]);
  };

  const updateOrder = (orderId: string, updates: Partial<OrderItem>) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  const toggleSaveListing = (listingId: string) => {
    setSavedListingIds(prev => 
      prev.includes(listingId) ? prev.filter(id => id !== listingId) : [...prev, listingId]
    );
  };

  const updateWalletBalance = (amount: number) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        walletBalance: currentUser.walletBalance + amount
      });
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        ...updates
      });
    }
  };

  const clearCart = () => {
    setCartOrPrintJob(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      isLoggedIn,
      listings,
      vendors: MOCK_VENDORS,
      orders,
      savedListingIds,
      cartOrPrintJob,
      login,
      signup,
      logout,
      setVerificationStatus,
      addListing,
      addOrder,
      updateOrder,
      toggleSaveListing,
      updateWalletBalance,
      updateProfile,
      setCartOrPrintJob,
      clearCart
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
