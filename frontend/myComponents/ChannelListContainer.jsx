import React from 'react'

import Search from './Search'
import IconBar from '../src/components/IconBar'

const ChannelListContainer = () => {
  return (
    <>  
        <div className='flex'>
            <IconBar/>
            <div className='bg-amber-300 md:w-50'>
                <Search/>
            </div>
            
        </div>
        
    </>
  )
}

export default ChannelListContainer