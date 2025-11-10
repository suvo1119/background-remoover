import { useState } from 'react'


import ImageBackgroundRemover from './components/ImageBackgroundRemover'
import BackgroundColorChanger from './components/BackgroundColorChanger'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      
        <ImageBackgroundRemover />
        

        
    
    </div>
  )
  
}

export default App
