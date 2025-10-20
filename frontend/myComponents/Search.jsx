import React from 'react'
import { useState } from 'react'
import { SearchIcon } from '../src/assets'


const Search = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false)

  const getChannels = () => {

  }
  const onSearch = (event)=> {
    event.preventDefault(); 
    setLoading(true);
    setQuery(event.target.value);
    getChannels(event.target.value);
  }
  return (
    <>
      <div >
        <span className=' flex text-white text-xl font-bold border-b-1 border-blue-600 w-full h-12 items-center pl-3 '>Profile</span>  
        <div className='mt-2'>
          <div className='flex items-center border border-gray-300 rounded-lg pl-2'>
            <SearchIcon/>
            <input 
            className="w-full max-w-sm px-2 py-1  focus:outline-none focus:placeholder-transparent"
            placeholder='Search'
            type='text'
            value={query}
            onChange={onSearch}
             />
          </div>
        </div>
      </div>
    </>
  )
}

export default Search