import React from 'react'

const TeamChannelList = ({children, error = false, loading, type}) => {
  if(error) {
    return (
        <>
            <div>
                <span>
                    { type === 'team' ? 'Channels' : 'Messages' } error
                </span>
            </div>
        </>
    )
  }

  if(loading) {
     return (
        <>
            <div>
                <span>
                    { type === 'team' ? 'Channels' : 'Messages' } Loading....
                </span>
            </div>
        </>
    )
  }
    return (
    <div>
        <div>
            <span> { type === 'team' ? 'Channels' : 'Direct Messages' }</span>
        </div>
        {children}
    </div>
  )
}

export default TeamChannelList