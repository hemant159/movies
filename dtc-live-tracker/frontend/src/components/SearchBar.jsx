import React, { useState } from 'react';

const SearchBar = ({ setSelectedBusId }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    setSelectedBusId(inputValue.trim());
  };

  return (
    <div style={{ padding: '10px' }}>
      <input
        type="text"
        placeholder="Enter Vehicle ID"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ padding: '5px', width: '200px' }}
      />
      <button onClick={handleSearch} style={{ padding: '5px', marginLeft: '5px' }}>
        Search
      </button>
    </div>
  );
};

export default SearchBar;
