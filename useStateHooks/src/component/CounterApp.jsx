import { useState } from 'react'

const CounterApp = () => {
  const [count, setCount] = useState(0)

  const inc = () => setCount((count) => count + 1)
  const dec = () => setCount((count) => count - 1)

  return (
    <div
      style={{
        backgroundColor: 'black',
        border: '2px solid yellow',
        height: '120px',
        width: '300px',
        textAlign: 'center',
        margin: 'auto',
        padding: '10px',  
      }}
    >
      <h3>Counter</h3>
      <button type="button" onClick={dec}>SUB -</button>
      <span style={{ margin: '0 10px' }}>Count: {count}</span>
      <button type="button" onClick={inc}>ADD +</button>
    </div>
  )
}

export default CounterApp