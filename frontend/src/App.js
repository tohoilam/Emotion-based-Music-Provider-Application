import React, { useState, useEffect } from 'react'

import { MainPage } from './Components/MainPage/MainPage'

function App() {
  const [data, setData] = useState([{}])

  useEffect(() => {
    fetch("/members").then(
      res => {
        if (res.status === 200) {
          return res.json();
        }
      }
    ).then(
      data => {
        setData(data)
      }
    )
  }, [])

  return (
    <div>
      {(typeof data.members === 'undefined') ? (
        <p>Loading...</p>
      ): (
        <MainPage data={data}/>
      )}
    </div>
  )
}

export default App