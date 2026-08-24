"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const MEMBERS = [
  { id: 'ALL', label: 'ALL' },
  { id: 'RUKA', label: 'RUKA 🦥' },
  { id: 'PHARITA', label: 'PHARITA 🦌' },
  { id: 'AHYEON', label: 'AHYEON 🦋' },
  { id: 'ASA', label: 'ASA 🐰' },
  { id: 'RAMI', label: 'RAMI 🐬' },
  { id: 'RORA', label: 'RORA 🐼' },
  { id: 'CHIQUITA', label: 'CHIQUITA 🐈‍⬛' }
];

const MEDIA_FILTERS = [
  { id: 'ALL', label: '全部' },
  { id: 'IMAGE', label: '📷 图片' },
  { id: 'VIDEO', label: '🎬 视频' }
];

// 🌟 全屏灯箱 (Lightbox) 保持不变
function Lightbox({ post, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const mediaCount = post.media.length;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaCount - 1 : prev - 1));
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % mediaCount);
  };

  const currentMedia = post.media[currentIndex];
  const isVideo = currentMedia.type === 'video';
  const cleanContent = post.content.split('|||')[0].trim();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev(e);
      if (e.key === 'ArrowRight') handleNext(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {mediaCount > 1 && (
        <>
          <button onClick={handlePrev} className="absolute left-4 md:left-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all z-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={handleNext} className="absolute right-4 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all z-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </>
      )}

      <div 
        className="relative w-full h-full max-w-5xl max-h-[100vh] flex flex-col items-center justify-center p-4 md:p-10" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 w-full flex items-center justify-center min-h-0">
          {isVideo ? (
            <video src={currentMedia.url} controls autoPlay className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          ) : (
            <img src={currentMedia.url} alt="Lightbox media" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          )}
          
          {mediaCount > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
              {currentIndex + 1} / {mediaCount}
            </div>
          )}
        </div>

        <div className="mt-6 w-full max-w-3xl text-center flex flex-col items-center pb-4">
          <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-5 leading-relaxed">{cleanContent}</p>
          
          <a 
            href={`https://x.com/i/web/status/${post.id.split('_')[0]}`} 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            在 X (Twitter) 查看原帖
          </a>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const timerRef = useRef(null);
  const videoRefs = useRef([]); 

  const mediaCount = post.media.length;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (mediaCount > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % mediaCount);
      }, 1200);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentIndex(0);
  };

  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (vid) {
        vid.muted = true; 
        if (isHovered && idx === currentIndex) {
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } else {
          vid.pause();
        }
      }
    });
  }, [isHovered, currentIndex]);

  const cleanContent = post.content.split('|||')[0].trim();

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(post)} 
      className="relative group rounded-xl overflow-hidden bg-[#111] border border-gray-900 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 h-full flex flex-col min-h-[220px]"
    >
      <div 
        className="flex w-full transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {post.media.map((item, index) => {
          let thumbnailUrl = null;
          if (item.type === 'video' && post.content.includes('|||')) {
             const parts = post.content.split('|||');
             thumbnailUrl = parts[1].trim();
          }

          return item.type === 'video' ? (
            <div key={`${item.url}-${index}`} className="relative w-full h-full shrink-0 bg-black overflow-hidden">
               <img 
                 src={thumbnailUrl || item.url} 
                 className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none"
                 alt=""
               />
               <img 
                 src={thumbnailUrl || item.url} 
                 alt="video thumbnail"
                 className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isHovered ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}
                 onError={(e) => { e.target.style.display = 'none'; }} 
               />
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={item.url} 
                preload="none" 
                loop
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-contain ${isHovered ? 'z-10' : 'z-0'}`}
              />
            </div>
          ) : (
            <div key={`${item.url}-${index}`} className="relative w-full h-full shrink-0 bg-black overflow-hidden">
               <img 
                 src={item.url} 
                 className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-125 pointer-events-none"
                 alt=""
               />
               <img
                 src={item.url}
                 alt={`${cleanContent} - part ${index + 1}`}
                 className="relative z-10 w-full h-full object-contain"
                 loading="lazy"
               />
            </div>
          )
        })}
      </div>

      {!isHovered && post.media[0]?.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none text-white/90 drop-shadow-lg transition-opacity duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {mediaCount > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm shadow-lg pointer-events-none z-30 transition-opacity duration-300">
          {currentIndex + 1} / {mediaCount}
        </div>
      )}

      {post.media[0]?.type === 'video' && (
        <div className="absolute top-3 left-3 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm shadow-lg pointer-events-none z-30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 1.818a1.5 1.5 0 01.06 2.122l-1.408 1.564 1.408 1.564a1.5 1.5 0 11-2.224 2.004l-2.096-2.327a1.5 1.5 0 010-2.004l2.096-2.327a1.5 1.5 0 012.164-.596z" />
            <path d="M19.94 10.818a1.5 1.5 0 01.06 2.122l-1.408 1.564 1.408 1.564a1.5 1.5 0 11-2.224 2.004l-2.096-2.327a1.5 1.5 0 010-2.004l2.096-2.327a1.5 1.5 0 012.164-.596z" />
            <path d="M15.75 11.25v1.5a.75.75 0 001.28.53l3.47-3.47a.75.75 0 000-1.06l-3.47-3.47a.75.75 0 00-1.28.53v1.5H15.75z" clipRule="evenodd" fillRule="evenodd" />
          </svg>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pointer-events-none z-30">
        <p className="text-sm md:text-sm text-gray-200 p-5 line-clamp-3 leading-relaxed drop-shadow-md">
          {cleanContent}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeMediaFilter, setActiveMediaFilter] = useState('ALL');
  const [selectedPost, setSelectedPost] = useState(null);

  // 🌟 新增：无限滚动所需的页码和每页数量
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 15;
  const loaderRef = useRef(null);

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedPost]);

  useEffect(() => {
    async function fetchImages() {
      // 🌟 这里就是我们修改的重点：按倒序抓取最新的 3000 条数据！
      const { data: records, error } = await supabase
        .from('asa_gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3000);

      if (!error && records) {
        const groupedPostsMap = new Map();
        
        records.forEach((record) => {
          const baseId = record.tweet_id.split('_')[0];
          if (!groupedPostsMap.has(baseId)) {
            groupedPostsMap.set(baseId, {
              id: record.tweet_id, 
              content: record.content,
              member: record.member,
              media: [], 
            });
          }
          groupedPostsMap.get(baseId).media.push({
            url: record.image_url,
            type: record.media_type || 'image' 
          });
        });

        const sortedPosts = Array.from(groupedPostsMap.values()).sort((a, b) => {
          const idA = BigInt(a.id.split('_')[0]);
          const idB = BigInt(b.id.split('_')[0]);
          if (idB > idA) return 1;
          if (idB < idA) return -1;
          return 0;
        });

        setPosts(sortedPosts);
      }
      setLoading(false);
    }

    fetchImages();
  }, []);

  // 🌟 当用户切换分类或搜索时，把页码重置为 1
  useEffect(() => {
    setPage(1);
  }, [activeTab, activeMediaFilter, activeSearch]);

  const filteredPosts = posts.filter(post => {
    const cleanPostContent = post.content.split('|||')[0].toLowerCase();
    const matchesSearch = cleanPostContent.includes(activeSearch.toLowerCase());
    const matchesTab = activeTab === 'ALL' || post.member === activeTab;
    
    let matchesMedia = true;
    if (activeMediaFilter === 'IMAGE') {
      matchesMedia = post.media.some(m => m.type === 'image');
    } else if (activeMediaFilter === 'VIDEO') {
      matchesMedia = post.media.some(m => m.type === 'video');
    }

    return matchesSearch && matchesTab && matchesMedia;
  });

  // 🌟 核心：只截取当前页码需要显示的帖子数量
  const currentDisplayedPosts = filteredPosts.slice(0, page * POSTS_PER_PAGE);

  // 🌟 核心：监听滚动，当底部的 loaderRef 进入视口时，页码 +1
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    }, { threshold: 0.1 });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [currentDisplayedPosts]); // 当显示的帖子变化时重新绑定监听器

  const triggerSearch = () => {
    setActiveSearch(searchInput);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold tracking-[0.3em] animate-pulse">
        LOADING BABYMONSTER...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-10 font-sans selection:bg-gray-700 pb-20 relative">
      
      <header className="mb-8 text-center mt-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] mb-4 cursor-default">
          BABYMONSTER GALLERY
        </h1>
        <p className="text-gray-400 text-sm md:text-base italic cursor-default">
          Monsters in the making.
        </p>
      </header>

      <div className="max-w-md mx-auto mb-6">
        <div className="flex items-center w-full bg-[#111] border border-gray-800 rounded-full px-6 py-2 transition-colors focus-within:border-gray-500 shadow-inner">
          <input
            type="text"
            placeholder="搜索关键字..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') triggerSearch();
            }}
            className="flex-1 bg-transparent text-gray-200 py-1 focus:outline-none placeholder-gray-600"
          />
          <button 
            onClick={triggerSearch}
            className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer p-1 ml-2 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {MEDIA_FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveMediaFilter(filter.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeMediaFilter === filter.id
                ? 'bg-gray-800 text-white'
                : 'bg-transparent text-gray-500 hover:text-gray-300 border border-gray-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-nowrap justify-start md:justify-center gap-2 md:gap-3 mb-12 max-w-5xl mx-auto px-4 overflow-x-auto no-scrollbar py-4 -my-4">
        {MEMBERS.map((member) => (
          <button
            key={member.id}
            onClick={() => setActiveTab(member.id)}
            className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wider transition-all duration-300 flex-shrink-0 ${
              activeTab === member.id
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                : 'bg-[#111] text-gray-400 border border-gray-800 hover:text-white hover:border-gray-500 hover:scale-105'
            }`}
          >
            {member.label}
          </button>
        ))}
      </div>

      {filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
            {/* 🌟 渲染限制数量的帖子 */}
            {currentDisplayedPosts.map((post) => (
              <PostCard key={post.id} post={post} onClick={(clickedPost) => setSelectedPost(clickedPost)} />
            ))}
          </div>

          {/* 🌟 加载指示器与触发器：只要显示的还没达到总数，就显示这个等待触发的加载圈 */}
          {currentDisplayedPosts.length < filteredPosts.length && (
            <div ref={loaderRef} className="w-full flex justify-center py-10 mt-6">
              <div className="w-8 h-8 border-4 border-gray-800 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500 space-y-4 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="tracking-widest text-sm uppercase">目前没有相关的更新</p>
        </div>
      )}

      {selectedPost && (
        <Lightbox post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

    </main>
  );
}