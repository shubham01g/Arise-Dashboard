'use client';

export default function TopNav({ title = 'Overview', searchPlaceholder = 'Search analytics...' }) {
  return (
    <header
      className="fixed top-0 right-0 h-16 z-40 flex justify-between items-center px-8"
      style={{
        width: 'calc(100% - 16rem)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 10px 30px rgba(42,47,50,0.06)',
      }}
    >
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#73777b' }}>search</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 transition-all outline-none"
            style={{
              backgroundColor: '#dde3e8',
            }}
          />
        </div>
        {/* Tabs */}
        <nav className="flex gap-6 font-body text-sm font-medium">
          <a href="#" className="pb-1" style={{ color: '#2a4bd9', borderBottom: '2px solid #2a4bd9' }}>{title}</a>
          <a href="#" className="text-[#a9aeb1] hover:text-[#2a4bd9] transition-colors">Analytics</a>
          <a href="#" className="text-[#a9aeb1] hover:text-[#2a4bd9] transition-colors">Reports</a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center text-[#575c60] hover:bg-[#e3e9ee] rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-[#575c60] hover:bg-[#e3e9ee] rounded-full transition-colors">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
        <div className="flex items-center gap-3 pl-4 ml-4" style={{ borderLeft: '1px solid #e3e9ee' }}>
          <div className="text-right">
            <p className="text-sm font-bold leading-tight" style={{ color: '#2a2f32' }}>Arise Admin</p>
            <p className="text-[10px]" style={{ color: '#575c60' }}>Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full kinetic-gradient flex items-center justify-center text-white font-bold text-sm">A</div>
        </div>
      </div>
    </header>
  );
}
