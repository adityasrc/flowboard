"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Pencil, Search, Plus, MoreVertical, 
  Clock, Trash2, LogOut, Grid, List 
} from "lucide-react";

/* ─── Mock Data for Boards ─── */
const mockBoards = [
  { id: 1, title: "System Architecture v1", date: "2 mins ago", thumbnail: "/api/placeholder/400/320" },
  { id: 2, title: "Q3 Roadmap Ideation", date: "2 days ago", thumbnail: "/api/placeholder/400/320" },
  { id: 3, title: "Database Schema Draft", date: "5 days ago", thumbnail: "/api/placeholder/400/320" },
];

export default function Dashboard() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* ─── Background Grid ─── */}
      <div className="fixed inset-0 pointer-events-none" 
           style={{
             backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
             backgroundSize: "24px 24px",
           }} 
      />

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900">
             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
              <Pencil size={18} strokeWidth={2.5} />
            </div>
            <span>Flowboard</span>
          </Link>

          {/* Right Side: User Profile & Logout */}
          <div className="flex items-center gap-4">
             {/* Search Bar (Hidden on Mobile) */}
            <div className="hidden md:flex items-center relative">
                <Search size={16} className="absolute left-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search boards..." 
                    className="pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                />
            </div>

            <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                <LogOut size={18} />
                <span className="hidden sm:inline">Log out</span>
            </button>
            
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                AD
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="relative max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">My Boards</h1>
                <p className="text-gray-500 mt-1">Manage your drawings and collaborations.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button 
                    onClick={() => setView("grid")}
                    className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Grid size={18} />
                </button>
                <button 
                    onClick={() => setView("list")}
                    className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <List size={18} />
                </button>
            </div>
        </div>

        {/* ─── Boards Grid ─── */}
        <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            
            {/* 1. Create New Board Card */}
            <button className="group relative flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300">
                <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                    <Plus size={28} />
                </div>
                <span className="font-bold text-gray-900 text-lg">Create New Board</span>
                <span className="text-sm text-gray-500 mt-1">Start from scratch</span>
            </button>

            {/* 2. Existing Mock Boards */}
            {mockBoards.map((board) => (
                <div key={board.id} className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-64">
                    
                    {/* Thumbnail Mockup */}
                    <div className="flex-1 bg-gray-50 relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                            <Grid size={64} className="text-gray-400" />
                        </div>
                        {/* Overlay Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <button className="px-6 py-2 bg-white text-gray-900 font-bold rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                                Open Board
                            </button>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-5 border-t border-gray-100 bg-white z-10 relative">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 truncate pr-4">{board.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <Clock size={12} />
                                    <span>Edited {board.date}</span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-900 p-1 rounded-md hover:bg-gray-100 transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

        </div>
      </main>
    </div>
  );
}