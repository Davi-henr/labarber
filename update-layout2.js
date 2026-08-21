const fs = require('fs');

let content = fs.readFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\layouts\\DashboardLayout.tsx', 'utf8');

// Update Interface
if (!content.includes('cor_primaria')) {
  content = content.replace("logo_url: string | null;", "logo_url: string | null;\n  cor_primaria: string | null;");
}

content = content.replace(/bg-slate-900 text-white/g, 'text-white');
content = content.replace(/`}>/, '`}\n      style={{ backgroundColor: config?.cor_primaria || \'#0f172a\' }}>');

fs.writeFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\layouts\\DashboardLayout.tsx', content);
