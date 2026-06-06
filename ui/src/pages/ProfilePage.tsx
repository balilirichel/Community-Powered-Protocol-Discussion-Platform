import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, MessageSquare, Star, LogOut, AlertTriangle } from 'lucide-react';
//import { Settings, BookOpen, MessageSquare, Star, Edit2, LogOut, AlertTriangle } from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
import DesktopSidebar from '../components/layout/DesktopSidebar';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { CardList } from '../components/ui';
import ProtocolCard from '../components/protocol/ProtocolCard';
// import ReviewCard from '../components/protocol/ReviewCard';
import ThreadCard from '../components/protocol/ThreadCard';
import { authService } from '../api/authService';
import useProtocolSearch from '../hooks/useProtocolSearch';
import useThreadSearch from '../hooks/useThreadSearch';
import { useAppSelector } from '../store/hooks';
import type { User } from '../types/auth';
import type { Protocol } from '../types/protocol';
//import type { Review } from '../types/review';
import type { Thread } from '../types/thread';

const PROFILE_TABS = ['Protocols', 'Threads'] as const;
type ProfileTab = typeof PROFILE_TABS[number];

interface ProtocolWithMetadata extends Protocol {
  gradientIndex?: number;
  slug?: string;
  votes?: number;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Protocols');
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user from Redux auth store
  const currentUser = useAppSelector((s) => s.auth.user);
  const userId = currentUser?.id;

  // ────────────────────────────────────────────────────────────────────────────
  // Fetch user profile data once on mount
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    authService
      .getUser()
      .then((data) => {
        if (isMounted) {
          setUserData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed fetching profile:', err);
          setError('Could not retrieve user data.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // Fetch Protocols via Typesense (filtered by user_id)
  // ────────────────────────────────────────────────────────────────────────────
  const userProtocolFilter = useMemo(
    () => (userId ? `user_id:=${userId}` : undefined),
    [userId],
  );

  const {
    protocolHits,
    isLoading: protocolsLoading,
    error: protocolsError,
  } = useProtocolSearch({
    query: '',
    sortOption: 'Newest',
    tagFilter: undefined,
    perPage: 20,
    filterBy: userProtocolFilter,
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Fetch Threads via Typesense (filtered by user_id)
  // ────────────────────────────────────────────────────────────────────────────
  const userThreadFilter = useMemo(() => (userId ? `user_id:=${userId}` : undefined), [userId]);

  const {
    threadHits,
    isLoading: threadsLoading,
    error: threadsError,
  } = useThreadSearch({
    query: '',
    sortOption: 'Newest',
    perPage: 20,
    filterBy: userThreadFilter,
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Fetch Reviews via Backend API (Typesense has no index reviews)
  // ────────────────────────────────────────────────────────────────────────────
  // const [reviews, setReviews] = useState<Review[]>([]);
  // const [reviewsLoading, setReviewsLoading] = useState(false);
  // const [reviewsError, setReviewsError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!userId) return;

  //   let isMounted = true;
  //   setReviewsLoading(true);
  //   setReviewsError(null);

  //   // Fallback approach: fetch all user data from a hypothetical /user/:id/reviews endpoint
  //   // or iterate through user's protocols and fetch reviews. For now, we'll mock it with an empty state.
  //   // In production, you'd implement /api/users/:id/reviews or similar.
  //   Promise.resolve([])
  //     .then((data) => {
  //       if (isMounted) {
  //         setReviews(data);
  //       }
  //     })
  //     .catch((err) => {
  //       if (isMounted) {
  //         console.error('Failed fetching reviews:', err);
  //         setReviewsError('Could not retrieve reviews.');
  //       }
  //     })
  //     .finally(() => {
  //       if (isMounted) {
  //         setReviewsLoading(false);
  //       }
  //     });

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [userId]);

  // ────────────────────────────────────────────────────────────────────────────
  // Transform Typesense protocol hits into card props
  // ────────────────────────────────────────────────────────────────────────────
  const protocolsData = useMemo<ProtocolWithMetadata[]>(() => {
    return protocolHits.map((hit, index) => ({
      id: Number(hit.id),
      title: hit.title,
      content: '',
      tags: hit.tags ?? [],
      rating: hit.rating ?? 0,
      reviews_count: hit.reviews_count ?? 0,
      votes: hit.votes ?? 0,
      threads_count: 0,
      author: { id: Number(hit.user_id ?? 0), name: userData?.name ?? 'Unknown' },
      user_id: Number(hit.user_id ?? 0),
      created_at: new Date(hit.created_at * 1000).toISOString(),
      updated_at: new Date(hit.created_at * 1000).toISOString(),
      gradientIndex: index,
      slug: hit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }, [protocolHits, userData?.name]);

  // ────────────────────────────────────────────────────────────────────────────
  // Transform Typesense thread hits into card props
  // ────────────────────────────────────────────────────────────────────────────
  const threadsData = useMemo<Thread[]>(() => {
    return threadHits.map((hit) => ({
      id: Number(hit.id),
      title: hit.title,
      body: hit.body,
      protocol: { id: Number(hit.protocol_id ?? 0), title: '' },
      author: { id: Number(hit.user_id ?? 0), name: userData?.name ?? 'Unknown' },
      user: { id: Number(hit.user_id ?? 0), name: userData?.name ?? 'Unknown' },
      comments_count: hit.comments_count ?? 0,
      upvotes_count: hit.votes ?? 0,
      downvotes_count: 0,
      created_at: new Date(hit.created_at * 1000).toISOString(),
      updated_at: new Date(hit.created_at * 1000).toISOString(),
    }));
  }, [threadHits, userData?.name]);

  // ────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  const getJoinedYear = useCallback((dateString?: string) => {
    if (!dateString) return '2026';
    try {
      return new Date(dateString).getFullYear().toString();
    } catch {
      return '2026';
    }
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center font-['Satoshi',_Helvetica,_sans-serif]">
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading profile…</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center font-['Satoshi',_Helvetica,_sans-serif]">
        <div className="text-center">
          <p className="text-sm font-semibold text-rose-500">{error || 'Unable to load profile.'}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Profile hero */}
        <div className="bg-gradient-to-br from-[#118451] to-[#18ac6a] px-4 pt-10 pb-6">
          <div className="flex items-end justify-between">
            <Avatar name={userData.name} size="lg" />
            <div className="flex gap-2">
                {/* Sign out */}
              <Button
                variant="ghost"
                fullWidth
                icon={<LogOut size={16} />}
                className="text-rose-200 hover:bg-rose-50 hover:text-rose-500"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
        
              {/* <button
                id="edit-profile-btn"
                className="flex items-center gap-1.5 px-3 py-2 rounded-[2rem] bg-white/20 text-white text-sm font-semibold hover:bg-white/30 cursor-pointer transition-colors"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                id="settings-btn"
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 cursor-pointer transition-colors"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button> */}
            </div>
          </div>
          <div className="mt-3">
            <h1 className="text-xl font-extrabold text-white">{userData.name}</h1>
            {userData.bio && <p className="text-sm text-white/80 mt-1 leading-relaxed">{userData.bio}</p>}
            <p className="text-xs text-white/60 mt-2">Member since {getJoinedYear(userData.created_at)}</p>
          </div>

          {/* Stats strip */}
          <div className="flex gap-6 mt-4">
            {[
              { label: 'Protocols', value: userData.protocols_count ?? 0, icon: BookOpen },
              { label: 'Reviews', value: userData.reviews_count ?? 0, icon: Star },
              { label: 'Threads', value: userData.threads_count ?? 0, icon: MessageSquare },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-xl font-extrabold text-white tabular-nums">{value}</span>
                <span className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                  <Icon size={11} />
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab nav */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab}
              id={`profile-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={[
                'flex-1 py-3 text-sm font-semibold cursor-pointer transition-colors border-b-2',
                activeTab === tab
                  ? 'border-[#118451] text-[#118451]'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-4 py-4 pb-24 lg:pb-8">
          {activeTab === 'Protocols' && (
            <div className="space-y-3">
              {protocolsError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4"
                >
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800">Error loading protocols</p>
                    <p className="text-xs text-amber-600 mt-0.5">{protocolsError}</p>
                  </div>
                </div>
              )}

              {protocolsLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 animate-pulse">Loading protocols…</p>
                </div>
              ) : protocolsData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-semibold text-gray-700 mb-1">No protocols yet</p>
                  <p className="text-xs text-gray-400">Start creating protocols to see them here.</p>
                </div>
              ) : (
                <CardList className="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {protocolsData.map((protocol) => (
                    <ProtocolCard
                      key={protocol.id}
                      id={protocol.id}
                      title={protocol.title}
                      description={protocol.content}
                      author={protocol.author?.name ?? 'Unknown'}
                      category={protocol.tags?.[0] ?? 'General'}
                      rating={protocol.rating ?? 0}
                      reviews={protocol.reviews_count ?? 0}
                      comments={protocol.threads_count ?? 0}
                      upvotes={protocol.votes ?? 0}
                      steps={protocol.tags?.length || 1}
                      gradientIndex={protocol.gradientIndex ?? 0}
                      slug={protocol.slug ?? ''}
                    />
                  ))}
                </CardList>
              )}
            </div>
          )}

          {/* {activeTab === 'Reviews' && (
            <div className="space-y-3">
              {reviewsError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4"
                >
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800">Error loading reviews</p>
                    <p className="text-xs text-amber-600 mt-0.5">{reviewsError}</p>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 animate-pulse">Loading reviews…</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-semibold text-gray-700 mb-1">No reviews yet</p>
                  <p className="text-xs text-gray-400">Leave a review on a protocol to see it here.</p>
                </div>
              ) : (
                <CardList>
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </CardList>
              )}
            </div>
          )} */}

          {activeTab === 'Threads' && (
            <div className="space-y-3">
              {threadsError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4"
                >
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800">Error loading threads</p>
                    <p className="text-xs text-amber-600 mt-0.5">{threadsError}</p>
                  </div>
                </div>
              )}

              {threadsLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 animate-pulse">Loading threads…</p>
                </div>
              ) : threadsData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-semibold text-gray-700 mb-1">No threads yet</p>
                  <p className="text-xs text-gray-400">Start a discussion to see it here.</p>
                </div>
              ) : (
                <CardList className="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {threadsData.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      protocolId={thread.protocol.id}
                    />
                  ))}
                </CardList>
              )}
            </div>
          )}
        </div>

      
      </main>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;
