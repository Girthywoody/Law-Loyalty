import LoyaltyApp from './components/LoyaltyApp'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <LoyaltyApp />
    </AuthProvider>
  )
}

export default App