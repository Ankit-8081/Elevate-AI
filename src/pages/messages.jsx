import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Search, MoreVertical, Paperclip, Smile, 
  ChevronLeft, CheckCheck, SearchIcon, Filter, Plus
} from 'lucide-react';
import Sidebar from '../components/sidebar';
import { Users } from "lucide-react";
import { Check, X } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;
const EMOJIS = [
  "😀","😂","🤣","😍","❤️",
  "🔥","👍","👏","😎","💯",
  "😅","🥲","😭","😢","😡",
  "🤔","🤯","🙏","😴","😇"
];
const THEMES = {
  dark: {
    name: "Dark",
    bg: "bg-[#0b141a]",
    panel: "bg-[#1f2937]",
    sidebar: "bg-[#050b14]",
    text: "text-slate-300"
  },

  ocean: {
    name: "Ocean",
    bg: "bg-[#0a192f]",
    panel: "bg-[#112240]",
    sidebar: "bg-[#020c1b]",
    text: "text-blue-200"
  },

  midnight: {
    name: "Midnight",
    bg: "bg-[#020617]",
    panel: "bg-[#0f172a]",
    sidebar: "bg-[#020617]",
    text: "text-indigo-200"
  },

  crimson: {
  name: "Crimson",
  bg: "bg-[#1a0f0f]",
  panel: "bg-[#2a1515]",
  sidebar: "bg-[#120909]",
  text: "text-red-300"
},
  neon: {
    name: "Neon",
    bg: "bg-black",
    panel: "bg-[#111827]",
    sidebar: "bg-black",
    text: "text-green-400"
  },
  aurora: {
  name: "Aurora",
  bg: "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]",
  panel: "bg-[#1e293b]/80 backdrop-blur-md",
  sidebar: "bg-[#020617]",
  text: "text-purple-200"
},
matcha: {
  name: "Matcha",
  bg: "bg-[#0f1f17]",
  panel: "bg-[#1a2e23]",
  sidebar: "bg-[#0a140f]",
  text: "text-emerald-200"
}
};
const formatTime = (ts) => {
  if (!ts) return "";

  const safeTs = ts.endsWith("Z") ? ts : ts + "Z";

  return new Date(safeTs).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const FriendsPopup = ({ onClose, navigate }) => {
  const popupRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchFriends();
  }, []);
  useEffect(() => {
  const handleClick = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      onClose();
    }
  };

  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);

  const fetchRequests = async () => {
    const res = await axios.get(`${API}/friends/requests`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setRequests(res.data);
  };

  const fetchFriends = async () => {
    const res = await axios.get(`${API}/friends`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setFriends(res.data);
  };
const respond = async (id, action) => {
  setRequests(prev => prev.filter(r => r.id !== id));

  try {
    await axios.post(`${API}/friends/respond/${id}?action=${action}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    fetchFriends();
  } catch (err) {
    console.error(err);
    fetchRequests();
  }
};

  return (
<motion.div
  ref={popupRef}
  initial={{ opacity: 0, scale: 0.95, y: -10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  className="absolute top-16 right-4 w-[340px] 
  bg-[#0f172a]/95 backdrop-blur-xl 
  border border-slate-700/60 
  rounded-2xl shadow-2xl z-50 p-4"
>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
  Requests
</h3>

{requests.length === 0 && (
  <p className="text-xs text-gray-500">No pending requests</p>
)}

{requests.map(r => (
  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
  {r.profile_image ? (
    <img
      src={`${API}${r.profile_image}`}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  ) : (
    <span className="text-xs font-bold text-white">
      {r.name?.charAt(0)}
    </span>
  )}
</div>
      <span className="text-sm text-white">{r.name}</span>
    </div>

    <div className="flex gap-1">
     <div className="flex gap-2">
  <button
    onClick={() => respond(r.id, "accept")}
    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 
    border border-emerald-500/20 hover:border-emerald-400/40 
    text-emerald-400 transition-all backdrop-blur-sm"
  >
    <Check size={16} strokeWidth={2.5} />
  </button>

  <button
    onClick={() => respond(r.id, "reject")}
    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 
    border border-red-500/20 hover:border-red-400/40 
    text-red-400 transition-all backdrop-blur-sm"
  >
    <X size={16} strokeWidth={2.5} />
  </button>
</div>
    </div>
  </div>
))}
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-4 mb-2">
  Friends
</h3>

{friends.length === 0 && (
  <p className="text-xs text-gray-500">No friends yet</p>
)}

{friends.map(f => (
  <div 
    key={f.id} 
    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition"
  >
    {/* LEFT */}
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
        {f.profile_image ? (
          <img
            src={`${API}${f.profile_image}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-white font-bold">
            {f.name?.charAt(0)}
          </span>
        )}
      </div>

      <span className="text-sm text-slate-300">{f.name}</span>
    </div>

    <button
      onClick={() => {
        onClose();
        navigate(`/chat/${f.id}`);
      }}
      className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 
      border border-indigo-500/20 hover:border-indigo-400/40 
      text-indigo-400 transition-all"
    >
      <Send size={16} />
    </button>
  </div>
))}
    </motion.div>
  );
};
const MessageBubble = ({ message, isMe, onDelete, searchQuery, theme, navigate }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
   <motion.div
  initial={{ opacity: 0, y: 10, scale: 0.96 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  className={`flex w-full mb-2 gap-2 ${
    isMe ? "justify-end" : "justify-start"
  }`}
>
  {/* 👤 Avatar */}
{!isMe && (
  <div
    onClick={() => navigate(`/profile/${message.sender_id}`)}
    className="w-9 h-9 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center cursor-pointer"
  >
    {message.profile_image ? (
     <img
  src={`${API}${message.profile_image}`}
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.style.display = "none";
  }}
/>
    ) : (
      <span className="text-xs text-white font-bold">
        {message.sender_name?.charAt(0) || "U"}
      </span>
    )}
  </div>
)}
      <div
  className={`group relative max-w-[65%] md:max-w-[55%] lg:max-w-[48%] px-4 py-2.5 shadow-sm transition-all duration-200 ${
          isMe
            ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
            : `${theme.panel} ${theme.text} rounded-2xl rounded-bl-sm border border-slate-700/50`
        }`}
      >
        {/* 🔥 TOP RIGHT MENU */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-black/10"
          >
        
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-28 bg-[#111827] border border-slate-700 rounded-lg shadow-lg z-50">
              <button
                onClick={() => onDelete(message.id, isMe)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 text-red-400"
              >
                Delete
              </button>
            </div>
          )}
        </div>
        {message.message && (
          <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">
 {searchQuery
  ? (() => {
      const safeQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      return message.message
        ?.split(new RegExp(`(${safeQuery})`, "gi"))
        .map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <span key={i} className="bg-yellow-400/40 rounded px-1">
              {part}
            </span>
          ) : (
            part
          )
        );
    })()
  : message.message}
</p>
        )}
        {message.file_url && (
          <div className="mt-2">
            {message.file_type?.startsWith("image") && (
              <img
                src={
                  message.file_url.startsWith("blob:")
                    ? message.file_url
                    : `${API}${message.file_url}`
                }
                className="rounded-lg max-w-[200px]"
              />
            )}

            {message.file_type?.startsWith("video") && (
              <video
                controls
                className="rounded-lg max-w-[220px]"
                src={
                  message.file_url.startsWith("blob:")
                    ? message.file_url
                    : `${API}${message.file_url}`
                }
              />
            )}

            {message.file_type?.startsWith("audio") && (
              <audio
                controls
                src={
                  message.file_url.startsWith("blob:")
                    ? message.file_url
                    : `${API}${message.file_url}`
                }
              />
            )}

            {!message.file_type?.startsWith("image") &&
              !message.file_type?.startsWith("video") &&
              !message.file_type?.startsWith("audio") && (
               <a
  href={`${API}${message.file_url}`}
  target="_blank"
  rel="noreferrer"
  className="flex items-center gap-2 bg-black/20 hover:bg-black/30 transition px-2 py-1 rounded-md text-xs text-blue-300 w-fit max-w-[200px]"
>
  <Paperclip size={12} />
  <span className="truncate">
    {message.file_name || message.file_url.split("/").pop()}
  </span>
</a>
              )}
          </div>
        )}

        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
            isMe ? "text-indigo-200" : "text-slate-500"
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>

          {/* ✔ ticks */}
          {isMe && (
            <CheckCheck
              size={14}
              className="text-emerald-400 opacity-80"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};


const ContactItem = ({
  chat,
  isActive,
  onClick,
  currentUserId,
  navigate,
  menuOpen,
  setMenuOpen,
  onDeleteConversation
}) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 border-b border-slate-800/40
      ${isActive ? 'bg-slate-800/60 border-l-4 border-l-blue-500' : 'hover:bg-slate-800/30'}`}
  >
    <div className="relative">
      <div
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/profile/${chat.user_id}`);
  }}
  className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center cursor-pointer"
>
 {chat.profile_image && chat.profile_image !== "null" ? (
  <img
    src={`${API}${chat.profile_image}`}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.target.style.display = "none";
    }}
  />
) : (
  <span className="text-white font-semibold">
    {chat.name?.charAt(0) || "?"}
  </span>
)}
</div>
      {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050b14] rounded-full" />}
    </div>
    <div className="flex-1 min-w-0">
     <div className="flex justify-between items-center">
  {/* LEFT: name + unread dot */}
  <div className="flex items-center gap-2 min-w-0">
    <h3 className="text-sm font-semibold text-slate-200 truncate">
      {chat.name}
    </h3>

    {chat.unread_count > 0 && (
      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
    )}
  </div>

  {/* RIGHT: menu */}
  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setMenuOpen();
      }}
      className="p-1 hover:bg-slate-700 rounded"
    >
      <MoreVertical size={14} />
    </button>
  <AnimatePresence>
    {menuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -5, scale: 0.95 }}
        className="absolute right-0 mt-2 w-32 bg-[#111827] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteConversation(chat.user_id);
          }}
          className="w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 text-red-400 transition"
        >
          Delete Chat
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>
</div>
<p
  className={`text-xs truncate mt-0.5 transition-all ${
    chat.unread_count > 0
      ? "text-white font-semibold"
      : "text-slate-500"
  }`}
>
  {chat.last_sender_id === currentUserId ? "You: " : ""}
  {chat.last_message || "No messages yet"}
</p>
    </div>
  </div>
);

// --- Main Component ---

export default function ElevateAIChat() {

    const [theme, setTheme] = useState(() => {
  return localStorage.getItem("chat-theme") || "dark";
});

useEffect(() => {
  localStorage.setItem("chat-theme", theme);
}, [theme]);

useEffect(() => {
  const handleClickOutside = () => {
    setOpenMenuId(null);
    setChatMenuOpen(false);
  };

  window.addEventListener("click", handleClickOutside);
  return () => window.removeEventListener("click", handleClickOutside);
}, []);

const currentTheme = THEMES[theme] || THEMES.dark;
  const { receiver_id } = useParams();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const scrollRef = useRef(null);
  const [showFriends, setShowFriends] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;
  const token = localStorage.getItem("token");

  useEffect(() => {
  const fetchRequestsCount = async () => {
    try {
      const res = await axios.get(`${API}/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequestCount(res.data.length);
    } catch (err) {
      console.error("Request count error", err);
    }
  };

  fetchRequestsCount();

  const interval = setInterval(fetchRequestsCount, 5000);
  return () => clearInterval(interval);
}, [token]);
useEffect(() => {
  if (!token) {
    navigate("/login");
  }
}, [token]);

  
  const deleteConversation = async (userId) => {
  try {
    await axios.delete(`${API}/messages/conversation/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setInbox(prev => prev.filter(c => c.user_id !== userId));
    setOpenMenuId(null);

    if (String(receiver_id) === String(userId)) {
      navigate("/messages");
    }

  } catch (err) {
    console.error("Delete conversation error", err);
  }
};
  useEffect(() => {
  if (!receiver_id || !currentUserId) return;

  if (String(receiver_id) === String(currentUserId)) {
    alert("You can't message yourself 😅");
    navigate("/messages"); 
  }
}, [receiver_id, currentUserId, navigate]);

useEffect(() => {
  const handleClick = () => setShowEmoji(false);
  if (showEmoji) window.addEventListener("click", handleClick);
  return () => window.removeEventListener("click", handleClick);
}, [showEmoji]);

useEffect(() => {
  return () => {
    messages.forEach(msg => {
      if (msg.file_url?.startsWith("blob:")) {
        URL.revokeObjectURL(msg.file_url);
      }
    });
  };
}, [messages]);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await axios.get(`${API}/messages/inbox`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInbox(res.data);
      } catch (err) { console.error("Inbox error", err); }
    };
    fetchInbox();
    const inv = setInterval(fetchInbox, 5000);
    return () => clearInterval(inv);
  }, [token]);

  useEffect(() => {
  if (!receiver_id) return;

  
const fetchUser = async () => {
  try {
    const res = await axios.get(`${API}/user/${receiver_id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setReceiver(res.data);
  } catch (err) {
    console.error("User fetch error", err);
  }
};
  fetchUser();
}, [receiver_id]);

  // Fetch Messages
  useEffect(() => {
    if (!receiver_id) return;
    const fetchChat = async () => {
  try {
    if (!receiver_id || receiver_id === String(currentUserId)) return;

    const res = await axios.get(`${API}/messages/${receiver_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMessages(
      res.data.map(m => ({
        ...m,
        timestamp: m.created_at
      }))
    );

  } catch (err) {
    console.error("Fetch error", err);
  }
};
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [receiver_id, token]);

 useEffect(() => {
  if (messages.length > 0) {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages.length]);
const handleDelete = async (id, isMe) => {
  try {
    await axios.delete(`${API}/messages/${id}`, {
      params: {
        delete_for_everyone: isMe === true
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    setMessages(prev => prev.filter(m => m.id !== id));
  } catch (err) {
    console.error(err);
  }
};
  const handleSend = async (e) => {
  e.preventDefault();

  // 🚫 prevent empty send
  if (!inputText.trim() && !selectedFile) return;

  // 🚫 invalid file check
  if (selectedFile && selectedFile.size === 0) {
    alert("Invalid file");
    return;
  }

  // 📦 create temp message (instant UI)
  const tempMsg = {
    id: "temp-" + Date.now(),
    sender_id: currentUserId,
    message: inputText,
    file_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
    file_type: selectedFile?.type,
    timestamp: new Date().toISOString(),
  };

  // ⚡ instant UI update
  setMessages((prev) => [...prev, tempMsg]);
  setInputText("");

  const formData = new FormData();
  formData.append("receiver_id", String(receiver_id));

  // 🧠 only send message if exists
  if (tempMsg.message) {
    formData.append("message", tempMsg.message);
  }

  // 📎 attach file if present
  if (selectedFile) {
    formData.append("file", selectedFile);
  }

  try {
  if (!token) {
  alert("Not authenticated. Please login again.");
  return;
}

await axios.post(
  `${API}/messages/send`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
    // 🧼 reset file
    setSelectedFile(null);

    // 🔥 refresh messages instantly (no delay feeling)
    const resChat = await axios.get(
      `${API}/messages/${receiver_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setMessages(
      resChat.data.map((m) => ({
        ...m,
        timestamp: m.created_at,
      }))
    );

    // 🔄 refresh inbox
    const resInbox = await axios.get(
      `${API}/messages/inbox`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setInbox(resInbox.data);

  } catch (err) {
    console.error("Send error", err);
  }
};

const filteredMessages = messages.filter((msg) => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();

  return (
    (msg.message || "").toLowerCase().includes(query) ||
    (msg.file_name || "").toLowerCase().includes(query)
  );
});

  return (
    <div className={`flex h-screen transition-colors duration-300 ${currentTheme.bg} ${currentTheme.text}`}>
      <Sidebar />

      {/* Main Container */}
      <div 
        style={{ marginLeft: "var(--sidebar-width)" }} 
        className="flex-1 flex w-full h-full border-l border-slate-800/50"
      >
        
        {/* LEFT COLUMN: Inbox List (Always visible on desktop) */}
        <aside className={`relative w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-slate-800/60 ${currentTheme.sidebar} ${receiver_id ? 'hidden md:flex' : 'flex'}`}>
          <header className={`p-4 flex flex-col gap-4 ${currentTheme.bg}`}>
           {showFriends && (
  <FriendsPopup 
    onClose={() => setShowFriends(false)} 
    navigate={navigate}
  />
)} 
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">Chats</h1>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
  <div 
    className="relative cursor-pointer"
    onClick={() => {
      setShowFriends(true);
      // optional: remove this if you don’t want reset
      // setRequestCount(0);
    }}
  >
    <Users size={20} />

    {requestCount > 0 && (
  <motion.span
    key={requestCount}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold"
  >
    +{requestCount}
  </motion.span>
)}
  </div>
</button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search messages..."
               className={`w-full ${currentTheme.panel} border-none rounded-lg py-2 pl-10 pr-4 text-sm`}
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {inbox.map(chat => (
             <ContactItem 
  key={chat.user_id}
  chat={chat}
  isActive={receiver_id === String(chat.user_id)}
  onClick={() => navigate(`/chat/${chat.user_id}`)}
  currentUserId={currentUserId}
  navigate={navigate}
  menuOpen={openMenuId === chat.user_id}
  setMenuOpen={() =>
    setOpenMenuId(prev => prev === chat.user_id ? null : chat.user_id)
  }
  onDeleteConversation={deleteConversation}
/>
            ))}
          </div>
        </aside>

        {/* RIGHT COLUMN: Chat Window */}
        <main className={`flex-1 flex flex-col ${currentTheme.bg} relative ${!receiver_id ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {receiver_id ? (
            <>
              {/* Chat Header */}
              <header className={`h-16 flex items-center justify-between px-4 ${currentTheme.panel} bg-opacity-50 backdrop-blur-md border-b border-slate-800/50 z-30`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/messages')} className="md:hidden p-1 text-slate-400"><ChevronLeft /></button>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
  {receiver?.profile_image && receiver.profile_image !== "null" ? (
    <img
      src={`${API}${receiver.profile_image}`}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
        e.target.parentNode.innerHTML = `<span class="text-white font-bold">
          ${receiver?.name?.charAt(0) || "U"}
        </span>`;
      }}
    />
  ) : (
    <span className="text-white font-bold">
      {receiver?.name?.charAt(0) || "U"}
    </span>
  )}
</div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">{receiver?.name || `User ${receiver_id}`}</h2>
                    <span className="text-[11px] text-emerald-500 font-medium">online</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
  {showSearch ? (
    <input
      autoFocus
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search in chat..."
      className="bg-[#2a3942] px-3 py-1 rounded-md text-sm outline-none text-white"
    />
  ) : (
    <SearchIcon
      size={18}
      className="cursor-pointer text-slate-400 hover:text-white"
      onClick={() => setShowSearch(true)}
    />
  )}

  {showSearch && (
    <button
      onClick={() => {
        setShowSearch(false);
        setSearchQuery("");
      }}
      className="text-xs text-slate-400 hover:text-white"
    >
      ✕
    </button>
  )}

      <div className="relative">
  <button
    onClick={() => setThemeMenuOpen(prev => !prev)}
    className="flex items-center gap-2 px-3 py-1.5 rounded-lg 
    bg-[#111827] border border-slate-700 hover:border-indigo-500 
    text-xs text-white transition-all shadow-sm hover:shadow-indigo-500/20"
  >
    🎨 <span>{THEMES[theme]?.name}</span>
  </button>

  {themeMenuOpen && (
    <div className="absolute right-0 mt-2 w-40 bg-[#0f172a] border border-slate-700 rounded-xl shadow-xl z-50 p-1 backdrop-blur-md">
      {Object.entries(THEMES).map(([key, t]) => (
        <button
          key={key}
          onClick={() => {
            setTheme(key);
            setThemeMenuOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition
            hover:bg-slate-800 ${
              theme === key ? "bg-slate-800 text-indigo-400" : "text-slate-300"
            }`}
        >
          <span>{t.name}</span>
          <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
        </button>
      ))}
    </div>
  )}
</div>

  <div className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation();
      setChatMenuOpen(prev => !prev);
    }}
    className="cursor-pointer text-slate-400 hover:text-white"
  >
    <MoreVertical size={18} />
  </button>

  <AnimatePresence>
    {chatMenuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -5, scale: 0.95 }}
        className="absolute right-0 mt-2 w-40 bg-[#111827] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteConversation(receiver_id);
            setChatMenuOpen(false);
          }}
          className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/10 text-red-400"
        >
          Delete Chat
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>
</div>
              </header>

              {/* Message Area */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-1 ${currentTheme.bg} bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-blend-soft-light bg-repeat`}>
                <AnimatePresence initial={false}>
              {filteredMessages.map((msg, index) => (
  <MessageBubble 
    key={msg.id ? `msg-${msg.id}` : `temp-${index}`}
    message={msg}
    isMe={msg.sender_id === currentUserId}
    onDelete={handleDelete}
    searchQuery={searchQuery}
    theme={currentTheme}
    navigate={navigate}
  />
))}
                </AnimatePresence>
                <div ref={scrollRef} className="h-2" />
              </div>

              {/* Input Area */}
              <footer className={`p-3 ${currentTheme.panel}/30 border-t border-slate-800/50`}>
                <form onSubmit={handleSend} className="max-w-6xl mx-auto flex items-center gap-2">
                    <input
  id="fileInput"
  type="file"
  hidden
  onChange={(e) => setSelectedFile(e.target.files[0])}
/>
                  <div className="flex gap-1 text-slate-400">
                    <div className="relative">
  <button
    type="button"
    onClick={(e) => {
  e.stopPropagation();
  setShowEmoji(prev => !prev);
}}
    className="p-2 hover:text-white"
  >
    <Smile size={24} />
  </button>

  {showEmoji && (
    <div className="absolute bottom-12 left-0 bg-[#111827] border border-slate-700 rounded-lg p-2 flex gap-2 flex-wrap w-[220px] z-50 shadow-lg">
      {EMOJIS.map((emoji, i) => (
        <button
          key={i}
          onClick={() => {
            setInputText(prev => prev + emoji);
            setShowEmoji(false);
          }}
          className="text-lg hover:scale-125 transition"
        >
          {emoji}
        </button>
      ))}
    </div>
  )}
</div>
                    <button 
  type="button" 
  onClick={() => document.getElementById("fileInput").click()}
  className="p-2 hover:text-white"
>
  <Paperclip size={24} />
</button>
                  </div>
                  {selectedFile && (
  <div className="text-xs text-slate-400 px-2">
    📎 {selectedFile.name} 
<span className="text-[10px] text-slate-500 ml-1">
  ({Math.round(selectedFile.size / 1024)} KB)
</span>
  </div>
)}
                  <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message" 
                    className="flex-1 bg-[#2a3942] border-none rounded-xl py-2.5 px-4 text-sm focus:ring-0 text-white placeholder:text-slate-500"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() && !selectedFile}
                    className="bg-indigo-600 hover:bg-indigo-500 p-2.5 rounded-full text-white transition-transform active:scale-90 disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                <Send size={40} className="text-slate-600 -rotate-12" />
              </div>
              <h2 className="text-xl font-light text-slate-400">Select a conversation to start messaging</h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}