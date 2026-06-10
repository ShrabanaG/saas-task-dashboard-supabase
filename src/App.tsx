import { supabase } from './lib/supabase';
import './App.css'

function App() {
  console.log(supabase);
  return (
    <div className="text-2xl font-bold text-center">Welcome to Vite + React</div>
  )
}

export default App
