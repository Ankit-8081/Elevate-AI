import React, { useState } from 'react';
import { 
  LayoutDashboard, MessageSquare, Briefcase, Settings, 
  Flame, ShieldCheck, Zap, MoreHorizontal, Heart, 
  Share2, Bookmark, Send, Sparkles, TrendingUp, Search
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import axios from "axios";
import { useEffect } from "react";
import { useRef } from "react";


const API = import.meta.env.VITE_API_BASE_URL;

// --- Sub-Components ---


const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-white/5 text-gray-400'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);
const FeedCard = ({ post, setPosts, user }) => {
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [showMenu, setShowMenu] = useState(false);


const handleLike = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.post(`${API}/feed/like/${post.id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? {
              ...p,
              likes: res.data.likes,
              liked: res.data.liked
            }
          : p
      )
    );

  } catch (err) {
    console.log(err);
  }
};
const fetchComments = async () => {
  try {
    const res = await axios.get(`${API}/feed/comments/${post.id}`);
    setComments(res.data.comments);
  } catch (err) {
    console.log(err);
  }
};

const addComment = async () => {
  const token = localStorage.getItem("token");

  if (!commentText.trim()) return; 

  try {
    await axios.post(`${API}/feed/comment/${post.id}`, {
      comment: commentText
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setCommentText("");

    fetchComments();

    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, comments: (p.comments || 0) + 1 }
          : p
      )
    );

  } catch (err) {
    console.log(err);
  }
};
useEffect(() => {
  if (showComments) {
    fetchComments();
  }
}, [showComments]);

const deletePost = async () => {
  const token = localStorage.getItem("token");

  if (!window.confirm("Delete this post?")) return;

  // 🔥 Optimistic UI (instant remove)
  setPosts(prev => prev.filter(p => p.id !== post.id));
  setShowMenu(false);

  try {
    await axios.delete(`${API}/feed/post/${post.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (err) {
    console.log("DELETE ERROR:", err.response?.data || err);
  }
};

const deleteComment = async (commentId) => {
  const token = localStorage.getItem("token");

  if (!window.confirm("Delete this comment?")) return;

  try {
    await axios.delete(`${API}/feed/comment/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // remove comment from UI
    setComments(prev => prev.filter(c => c.id !== commentId));

    // update comment count
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, comments: Math.max((p.comments || 1) - 1, 0) }
          : p
      )
    );

  } catch (err) {
    console.log(err);
  }
};

  return (
 <div className={`rounded-2xl p-5 mb-6 backdrop-blur-md border transition-all group
  ${post.author.email === user?.email
    ? "bg-gradient-to-br from-indigo-600/20 to-cyan-500/10 border-indigo-400/40"
    : "bg-white/5 border-white/10 hover:border-white/20"
  }
`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-3">
       <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-xl">
  {post.author.avatar && post.author.avatar?.startsWith("/images") ? (
    <img
      src={`${API}${post.author.avatar}`}
      alt="profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <span>{post.author.avatar || "👤"}</span>
  )}
</div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-gray-100">{post.author.name}</h4>
            {post.author.badge && (
              <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                <Sparkles size={10} /> {post.author.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{post.author.role || '2h ago'}</p>
        </div>
      </div>
      <div className="relative">
  {user && post.author.email === user.email && (
  <MoreHorizontal 
    onClick={() => setShowMenu(!showMenu)}
    className="text-gray-500 cursor-pointer hover:text-white"
    size={18}
  />
)}

{showMenu && post.author.email === user?.email && (
  <div className="absolute right-0 mt-2 bg-[#111] border border-white/10 rounded-lg shadow-lg z-10">
    
    <button
      onClick={deletePost}
      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
    >
      Delete Post
    </button>

  </div>
)}
</div>
    </div>

    <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
    {post.image && (
  <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
    <img
      src={`${API}${post.image}`}
      className="w-full object-cover"
    />
  </div>
)}

    {post.progress && (
      <div className="mb-4 bg-white/5 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full" style={{ width: `${post.progress}%` }} />
      </div>
    )}

    {post.preview && (
      <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
        <img src={post.preview} alt="Project" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
    )}

    {post.insight && (
      <div className="bg-indigo-500/10 border-l-2 border-indigo-500 p-3 rounded-r-lg mb-4 italic text-sm text-indigo-200">
        "{post.insight}"
      </div>
    )}

    <div className="flex flex-wrap gap-2 mb-4">
      {post.tags.map(tag => (
        <span key={tag} className="text-xs text-indigo-400 font-mono">{tag}</span>
      ))}
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-white/5 text-gray-500">
      <div className="flex space-x-6">
       <button 
  onClick={handleLike}
  className="flex items-center space-x-2 hover:text-rose-400 transition-colors"
>
  <Heart
  size={18}
  fill={post.liked ? "currentColor" : "none"}
/>
  <span className="text-xs">{post.likes || 0}</span>
</button>
        <button 
  onClick={() => setShowComments(!showComments)}
  className="flex items-center space-x-2 hover:text-indigo-400 transition-colors"
><MessageSquare size={18} /> <span className="text-xs">{post.comments || 0}</span></button>
      </div>
    </div>
    {showComments && (
  <div className="mt-4 space-y-3">

    {/* Input */}
    <div className="flex gap-2">
      <input
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 bg-white/5 px-3 py-2 rounded-lg text-sm outline-none"
      />
      <button 
        onClick={addComment}
        className="text-indigo-400 text-sm"
      >
        Post
      </button>
    </div>

    {comments.map(c => (
  <div key={c.id} className="flex justify-between items-center text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
    
    <div>
      <b>{c.name}</b>: {c.comment}
    </div>

    {c.user_email === user?.email && (
  <button 
    onClick={() => deleteComment(c.id)}
    className="text-red-400 text-xs hover:underline"
  >
    Delete
  </button>
)}

  </div>
))}

  </div>
)}
  </div>

);
};

// --- Main Page Component ---

export default function ElevateFeed() {

  const [posts, setPosts] = useState([]);
  const fileInputRef = useRef(null);
  const [newPost, setNewPost] = useState("");
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
  const token = localStorage.getItem("token");

  // fetch feed
  axios.get(`${API}/feed`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => setPosts(res.data.posts))
  .catch(err => console.log(err));

  axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => setUser(res.data))
  .catch(err => console.log(err));

}, []);
  const createPost = async () => {
  if (!newPost.trim() && !selectedImage) return;

  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("content", newPost);
  formData.append("tags", JSON.stringify([]));

  if (selectedImage) {
    formData.append("file", selectedImage);
  }

  try {
    await axios.post(`${API}/feed/create`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    setNewPost("");
    setSelectedImage(null);

    const res = await axios.get(`${API}/feed`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setPosts(res.data.posts);

  } catch (err) {
    console.log(err);
  }
};
  return (
   <div className="min-h-screen bg-[#09090b] text-gray-200 flex font-sans selection:bg-indigo-500/30">

  <Sidebar />

  <main
    style={{ marginLeft: "var(--sidebar-width)" }}
    className="flex-1 flex flex-col overflow-hidden"
  >
    <div className="flex-1 overflow-y-auto max-w-[1400px] mx-auto w-full px-6 md:px-10 py-6">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
        {/* Main Feed */}
        <section className="lg:col-span-8 lg:col-start-3 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
  {user?.profile_image ? (
    <img
      src={`${API}${user.profile_image}`}
      alt="profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-sm">
      👤
    </div>
  )}
</div>
             <input 
  type="text"
  value={newPost}
  onChange={(e) => setNewPost(e.target.value)}
  placeholder="Share your progress..." 
  className="bg-transparent w-full focus:outline-none text-gray-100"
/>
<div className="flex items-center gap-2 mt-2">
  
  <button
  onClick={() => fileInputRef.current.click()}
  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-300"
>
  📎
</button>
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={(e) => setSelectedImage(e.target.files[0])}
    className="hidden"
  />

</div>

{selectedImage && (
  <img
    src={URL.createObjectURL(selectedImage)}
    className="w-32 mt-2 rounded-lg"
  />
)}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
             <button 
  onClick={createPost}
  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
>
  <Send size={16} /> Post
</button>
            </div>
          </div>

      {posts.map(post => (
  <FeedCard key={post.id} post={post} setPosts={setPosts} user={user} />
))}
          
          <div className="py-4 text-center">
             <button className="text-indigo-400 text-sm font-medium hover:underline flex items-center justify-center gap-2 mx-auto">
               Load more activity <TrendingUp size={14} />
             </button>
          </div>
        </section>
    </div> 
    </div>
  </main>
  </div>
  );
};