import { createRoot } from 'react-dom/client'
import '@fontsource-variable/figtree'
import { StoreProvider } from './store.jsx'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
)
