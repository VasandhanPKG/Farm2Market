
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Marketplace from './components/Marketplace';
import FarmerOrderManager from './components/FarmerOrderManager';
import Dashboard from './components/Dashboard';
import CreateListing from './components/CreateListing';
import LoginPage from './components/LoginPage';
import BidRoom from './components/BidRoom';
import DemandSection from './components/DemandSection';
import { User, UserRole, CropListing, Order, OrderStatus, Bid, BidStatus, Rating, BuyerDemand } from './types';
import { Language, translations } from './translations';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, doc, setDoc, addDoc, updateDoc, where, orderBy } from 'firebase/firestore';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('en');
  const [listings, setListings] = useState<CropListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [demands, setDemands] = useState<BuyerDemand[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role and details from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setUser({ ...snapshot.data(), id: snapshot.id } as User);
            setIsLoggedIn(true);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Listeners for Global Data
  useEffect(() => {
    if (!isLoggedIn) return;

    const listingsQuery = query(collection(db, 'listings'));
    const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
      setListings(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CropListing)));
    });

    const bidsQuery = query(collection(db, 'bids'), orderBy('timestamp', 'desc'));
    const unsubscribeBids = onSnapshot(bidsQuery, (snapshot) => {
      setBids(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Bid)));
    });

    const ordersQuery = query(collection(db, 'orders'), orderBy('id', 'desc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
    });

    const demandsQuery = query(collection(db, 'demands'));
    const unsubscribeDemands = onSnapshot(demandsQuery, (snapshot) => {
      setDemands(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as BuyerDemand)));
    });

    return () => {
      unsubscribeListings();
      unsubscribeBids();
      unsubscribeOrders();
      unsubscribeDemands();
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('dashboard');
  };

  const handleCreateListing = async (data: any) => {
    if (!user) return;
    const newListing = {
      farmerId: user.id,
      farmerName: user.name,
      name: data.cropType,
      totalQuantity: data.quantity,
      availableQuantity: data.quantity,
      unit: data.unit,
      basePrice: data.basePrice || data.pricePerUnit * 0.8,
      fixedPrice: data.pricePerUnit,
      moq: data.moq || 1,
      harvestDate: data.deliveryDate,
      location: data.location,
      image: `https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80`,
      description: data.description
    };
    await addDoc(collection(db, 'listings'), newListing);
    setActiveTab('my-listings');
  };

  const handleAddDemand = async (data: any) => {
    if (!user) return;
    const newDemand = {
      buyerId: user.id,
      buyerName: user.name,
      cropType: data.cropType,
      quantity: data.quantity,
      unit: data.unit,
      targetPrice: data.targetPrice,
      deliveryMonth: data.deliveryMonth,
      status: 'OPEN',
      description: data.description
    };
    await addDoc(collection(db, 'demands'), newDemand);
  };

  const handlePlaceOrder = async (listingId: string, quantity: number, type: 'RETAIL' | 'WHOLESALE', price?: number) => {
    if (!user) return;
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    if (type === 'WHOLESALE' && price !== undefined) {
      const newBid = {
        listingId,
        buyerId: user.id,
        buyerName: user.name,
        price,
        quantity,
        status: BidStatus.PENDING,
        timestamp: Date.now(),
      };
      await addDoc(collection(db, 'bids'), newBid);
    } else {
      const finalPrice = price || listing.fixedPrice;
      const productCost = finalPrice * quantity;
      const deliveryCost = type === 'RETAIL' ? 120 : 1500;
      
      const newOrder = {
        listingId,
        cropName: listing.name,
        buyerId: user.id,
        buyerName: user.name,
        farmerId: listing.farmerId,
        quantity,
        totalProductCost: productCost,
        deliveryCost,
        totalAmount: productCost + deliveryCost,
        type,
        status: OrderStatus.PLACED,
      };

      await addDoc(collection(db, 'orders'), newOrder);
      await updateDoc(doc(db, 'listings', listingId), {
        availableQuantity: listing.availableQuantity - quantity
      });
      setActiveTab('orders');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
  };

  const handleAcceptBid = async (bidId: string) => {
    const bid = bids.find(b => b.id === bidId);
    if (!bid) return;
    await updateDoc(doc(db, 'bids', bidId), { status: BidStatus.ACCEPTED });
    handlePlaceOrder(bid.listingId, bid.quantity, 'WHOLESALE', bid.price);
  };

  const handleRateTransaction = async (orderId: string, score: number, comment: string) => {
    if (!user) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const isFarmer = user.role === UserRole.FARMER;
    const toUserId = isFarmer ? order.buyerId : order.farmerId;

    const ratingData = {
      orderId,
      fromUserId: user.id,
      toUserId: toUserId,
      score,
      comment,
      timestamp: Date.now(),
    };

    await addDoc(collection(db, 'ratings'), ratingData);
    const updateField = isFarmer ? { isRatedByFarmer: true } : { isRatedByBuyer: true };
    await updateDoc(doc(db, 'orders', orderId), updateField);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <LoginPage language={language} setLanguage={setLanguage} />;
  }

  const isBuyer = user.role === UserRole.RETAIL_BUYER || user.role === UserRole.WHOLESALE_BUYER;

  return (
    <Layout 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      language={language}
      setLanguage={setLanguage}
    >
      <div className="flex justify-end mb-4">
        <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-slate-600">
          Logout Session
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <Dashboard 
          user={user} 
          orders={orders.filter(o => o.farmerId === user.id || o.buyerId === user.id)} 
          listings={listings.filter(l => l.farmerId === user.id)}
          language={language}
        />
      )}

      {activeTab === 'marketplace' && (
        <Marketplace user={user} listings={listings} onPlaceOrder={handlePlaceOrder} language={language} />
      )}

      {activeTab === 'bid-room' && isBuyer && (
        <BidRoom 
          user={user} 
          listings={listings} 
          bids={bids}
          onPlaceOrder={handlePlaceOrder} 
          language={language} 
        />
      )}

      {activeTab === 'demand-section' && (
        <DemandSection 
          user={user} 
          demands={demands} 
          onAddDemand={handleAddDemand} 
          language={language} 
        />
      )}

      {activeTab === 'orders' && (
        <FarmerOrderManager 
          orders={orders.filter(o => user.role === UserRole.FARMER ? o.farmerId === user.id : o.buyerId === user.id)}
          onUpdateStatus={handleUpdateOrderStatus}
          onRateTransaction={handleRateTransaction}
          currentUser={user}
          language={language}
        />
      )}

      {activeTab === 'my-listings' && user.role === UserRole.FARMER && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div>
               <h2 className="text-xl font-bold text-slate-800">Your Crop Listings</h2>
               <p className="text-sm text-slate-500">Manage your active marketplace inventory.</p>
             </div>
             <button onClick={() => setActiveTab('create-listing')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold">
               + Post New Crop
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.filter(l => l.farmerId === user.id).map(l => (
              <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between mb-4">
                   <h3 className="font-bold text-slate-800">{l.name}</h3>
                   <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold">Active</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-slate-500">Inventory:</span>
                  <span className="font-bold">{l.availableQuantity} / {l.totalQuantity} {l.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create-listing' && user.role === UserRole.FARMER && (
        <CreateListing onSubmit={handleCreateListing} />
      )}

      {activeTab === 'bids' && user.role === UserRole.FARMER && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold mb-4">Pending Wholesale Bids</h2>
          <div className="space-y-4">
            {bids.filter(b => b.status === BidStatus.PENDING).map(bid => (
              <div key={bid.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">₹{bid.price} / unit</p>
                  <p className="text-xs text-slate-500">{bid.quantity} units requested by {bid.buyerName}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAcceptBid(bid.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Accept Bid</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
