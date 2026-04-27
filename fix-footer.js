const fs = require('fs');
const filePath = 'src/components/layout/Footer.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix HUB HUB IME
content = content.replace(/<span className="font-bukra font-black text-xl text-white leading-tight">HUB IME<\/span>/g, '<span className="font-bukra font-black text-xl text-white leading-tight">IME</span>');

// Fix IF references
content = content.replace(/O Grande Colisor do IF/g, 'O Grande Colisor do IME');

// Double check Adrian Raposo
content = content.replace(/João Stangorlini/g, 'Adrian Raposo');
content = content.replace(/joaopaulostangorlini@usp.br/g, 'andyraposo@usp.br');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Footer.tsx');
