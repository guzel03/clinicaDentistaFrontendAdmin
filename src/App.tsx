import Administrador from './pages/Administrador'
import { ContactoProvider } from './contactConfig'
import './App.css'

function App() {
  return (
    <ContactoProvider>
      <Administrador />
    </ContactoProvider>
  )
}

export default App