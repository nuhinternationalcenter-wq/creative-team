const fs = require('fs');
let code = fs.readFileSync('src/context/WorkContext.tsx', 'utf8');

code = code.replace(
  'const [toast, setToast] = useState<ToastNotification | null>(null);',
  'const [toast, setToast] = useState<ToastNotification | null>(null);\n  const lastServerStateRef = React.useRef<any>(null);'
);

fs.writeFileSync('src/context/WorkContext.tsx', code);
