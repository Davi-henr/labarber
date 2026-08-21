const fs = require('fs');

let content = fs.readFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\layouts\\DashboardLayout.tsx', 'utf8');

// Update Interface
content = content.replace("logo_url: string | null;", "logo_url: string | null;\n  cor_primaria: string | null;");

// Update linkClass
content = content.replace(
  "const linkClass = (path: string) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(path) ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`;",
  "const linkClass = (path: string) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(path) ? 'bg-black/20 text-white font-medium' : 'text-white/70 hover:bg-black/10 hover:text-white'}`;"
);

// Update aside background
content = content.replace(
  "      {/* Sidebar */}\n      <aside className={`\n        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out\n        md:relative md:translate-x-0\n        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\n      `}>",
  "      {/* Sidebar */}\n      <aside className={`\n        fixed inset-y-0 left-0 z-50 w-64 text-white flex flex-col transform transition-transform duration-300 ease-in-out\n        md:relative md:translate-x-0\n        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\n      `}\n      style={{ backgroundColor: config?.cor_primaria || '#0f172a' }}>"
);

// Update borders inside aside
content = content.replace(/border-slate-800/g, 'border-black/10');

// Update bottom profile area
content = content.replace('bg-slate-700', 'bg-black/20');
content = content.replace('text-slate-400', 'text-white/70');
content = content.replace('hover:bg-slate-800 text-red-400', 'hover:bg-black/20 text-red-300');
content = content.replace('text-red-400 hover:bg-slate-800', 'text-red-300 hover:bg-black/20');

// Mobile header button text
content = content.replace('<button \n            className="md:hidden text-slate-400 hover:text-white"', '<button \n            className="md:hidden text-white/70 hover:text-white"');

fs.writeFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\layouts\\DashboardLayout.tsx', content);
