import React, { useState, useEffect } from 'react'

import { MainPage } from './Components/MainPage/MainPage'

function App() {
  const [data, setData] = useState([{}])
  // const domain = "https://ebmp-api.herokuapp.com/"
  const domain = "http://localhost:5000/"

  useEffect(() => {
    fetch(domain + "members").then(
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