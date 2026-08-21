const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
};

const files = walk('frontend/src');

files.forEach(file => {
  if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
  if (file.includes('AuthContext')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace fetch with api.get
  content = content.replace(/fetch\(\`\/chatbot\/\$\{barbearia_id\}\/info\`\)/g, 'api.get(`/chatbot/${barbearia_id}/info`)');
  content = content.replace(/if \(!response.ok\) throw new Error\('Falha ao buscar dados'\);\n\s*const data = await response.json\(\);\n\s*setInfo\(data\);/g, 'setInfo(response.data);');

  // Fix image URLs that became `${b.foto_url}` or similar due to powershell substitution bug
  // We will prepend `api.defaults.baseURL` to these image urls, but wait, we need to import api if it's not imported.
  // Actually, wait, it's easier to just use `import.meta.env.PROD ? '/api' : 'http://localhost:3333'` directly.
  const prefix = "${import.meta.env.PROD ? '/api' : 'http://localhost:3333'}";
  
  content = content.replace(/src=\{\`\$\{config\.logo_url\}\`\}/g, `src={\`${prefix}\${config.logo_url}\`}`);
  content = content.replace(/src=\{\`\$\{b\.foto_url\}\`\}/g, `src={\`${prefix}\${b.foto_url}\`}`);
  content = content.replace(/src=\{\`\$\{data\.logo_url\}\`\}/g, `src={\`${prefix}\${data.logo_url}\`}`);
  content = content.replace(/src=\{\`\$\{membro\.foto_url\}\`\}/g, `src={\`${prefix}\${membro.foto_url}\`}`);
  content = content.replace(/src=\{\`\$\{currentFotoUrl\}\`\}/g, `src={\`${prefix}\${currentFotoUrl}\`}`);
  content = content.replace(/logoSrc = barbearia\.logo_url \? \`\$\{barbearia\.logo_url\}\` : null/g, `logoSrc = barbearia.logo_url ? \`${prefix}\${barbearia.logo_url}\` : null`);
  content = content.replace(/src=\{\`\$\{barbeiro\.foto_url\}\`\}/g, `src={\`${prefix}\${barbeiro.foto_url}\`}`);
  content = content.replace(/src=\{\`\$\{item\.imagem_url\}\`\}/g, `src={\`${prefix}\${item.imagem_url}\`}`);
  content = content.replace(/src=\{\`\$\{foto\.imagem_url\}\`\}/g, `src={\`${prefix}\${foto.imagem_url}\`}`);
  content = content.replace(/src=\{\`\$\{barbearia\.logo_url\}\`\}/g, `src={\`${prefix}\${barbearia.logo_url}\`}`);

  if (content !== original) {
    // Check if api is imported if we replaced api.get
    if (content.includes('api.get(') && !content.includes("import { api }")) {
      content = "import { api } from '../contexts/AuthContext';\n" + content;
    }
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
