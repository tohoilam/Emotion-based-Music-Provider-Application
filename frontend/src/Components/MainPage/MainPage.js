import React from 'react'

export const MainPage = ({data}) => {
  return (
    <div>
      <div>MainPage</div>
      {
        (data)
          ? data.members.map((member, i) => (<p key={i}>{member}</p>))
          : ''
      }
    </div>
  )
}