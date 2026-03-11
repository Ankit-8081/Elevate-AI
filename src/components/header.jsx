import React, { useEffect, useState } from "react";
import { Search, Bell, User } from "lucide-react";
import axios from "axios";

const Header = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if(token){
      axios.get("http://127.0.0.1:8000/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch(err => {
        console.log(err);
      });
    }

  }, []);

  return (
    <header className="h-20 border-b border-white/5 flex items-center px-8 sticky top-0 bg-[#050b14]/80 backdrop-blur-md z-20">

  <div className="flex items-center gap-6 ml-auto">
    
    <div className="relative cursor-pointer hover:scale-110 transition-transform">
      <Bell className="w-5 h-5 text-slate-400" />
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_cyan]" />
    </div>

    <div className="flex items-center gap-3 pl-6 border-l border-white/10">
      <div className="text-right">

        <p className="text-sm font-semibold text-white">
          {user ? user.name : "Guest"}
        </p>

        <p className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">
          Pro Member
        </p>

      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 p-[2px]">
        <div className="w-full h-full rounded-full bg-[#050b14] flex items-center justify-center">
          <User className="w-6 h-6 text-slate-300" />
        </div>
      </div>

    </div>

  </div>

</header>
  );
};

export default Header;