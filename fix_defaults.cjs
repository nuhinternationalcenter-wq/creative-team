const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

code = code.replace(
  /customLogo: data\.customLogo,/g,
  "customLogo: data.customLogo !== undefined ? data.customLogo : '',"
);

code = code.replace(
  /themeColor: data\.themeColor/g,
  "themeColor: data.themeColor !== undefined ? data.themeColor : 'slate'"
);

fs.writeFileSync('src/context/WorkContext.tsx', code);
