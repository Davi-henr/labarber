const fs = require('fs');

let content = fs.readFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\pages\\Equipe.tsx', 'utf8');

content = content.replace(
  '<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">',
  '<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">'
);

content = content.replace(
  '<form onSubmit={handleCreateBarbeiro} className="p-6 space-y-5">',
  '<form onSubmit={handleCreateBarbeiro} className="p-6 space-y-5 overflow-y-auto">'
);

fs.writeFileSync('C:\\Users\\davih\\LaBarber\\frontend\\src\\pages\\Equipe.tsx', content);
