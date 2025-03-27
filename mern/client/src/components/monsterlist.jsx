import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import MonsterItem from "./monsteritem"
import { useAuth0 } from "@auth0/auth0-react";

export default function MonstersList({ parentLocationID, campaignID }) {
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLookup, setShowLookup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  const fetchMonsters = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:5050/monsters/location/${parentLocationID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch monsters.");

      const data = await response.json();
      setMonsters(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonsters();
  }, [parentLocationID]);

  const handleRemove = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch(`http://localhost:5050/monsters/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMonsters();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMonster = async (newMonster) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch("http://localhost:5050/monsters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignID,
          parentLocationID,
          monsterReference: newMonster.index, // Store 5eAPI reference
        }),
      });
      fetchMonsters();
      setShowLookup(false);
    } catch (err) {
      setError(err.message);
    }
  };

  //Monster Lookup
  const searchMonsters = async () => {
    try {
      setSearchResults([]);
      const response = await fetch(`https://www.dnd5eapi.co/api/monsters?name=${searchTerm.toLowerCase()}`);
      if (!response.ok) throw new Error("Monster not found");

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading monsters...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (monsters.length == 0) {
    return (
      <div className="bg-light-tan text-brown rounded-lg p-4">

        {!showLookup && <div><p className="text-lg">There aren't any monsters here. Want to add some?</p>
        <button className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full button shadow-sm shadow-amber-800"
        onClick={() => {setShowLookup(true)}}>+</button></div>}
        {showLookup && (
          <div className="monster-lookup">
            <h3 className="text-xl font-bold">Monster Lookup</h3>
            <input
              type="text"
              placeholder="Enter monster name"
              value={searchTerm}
              className="mt-2 rounded px-2 py-2 text-left placeholder:text-yellow-700 bg-cream border border-brown "
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="space-x-2 mt-2">
              <button onClick={searchMonsters}
                className="font-bold mt-2 mr-2 button bg-goblin-green text-gold px-3 py-1 rounded hover:shadow-sm hover:shadow-amber-800">Search</button>
              <button onClick={() => setShowLookup(false)}
                className="font-bold bg-cancel-red button ml-2 hover:shadow-sm hover:shadow-amber-800 text-gold px-3 py-1 rounded ">Close</button>
            </div>

            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            <ul className="flex flex-col items-center">
              {searchResults.map((monster) => (
                <li key={monster.index}
                className="bg-cream border border-brown shadow-sm shadow-amber-800 rounded flex w-80 mt-2 p-4 items-center relative">
                  <img src={monster.image}/>
                  <span>{monster.name}</span>
                  <button 
                  className="absolute right-2 top-1 font-bold mt-2 mr-2 button bg-goblin-green text-gold px-3 py-1 rounded hover:shadow-sm hover:shadow-amber-800"
                  onClick={() => handleAddMonster(monster)}>Add</button>
                </li>
              ))}
            </ul>
          </div>
          )}
      </div>
    )
  } else {
  return (
      <div className="bg-light-tan text-brown rounded-lg p-4">
        <ul className="mb-2">
          {monsters.map((monster) => (
            <MonsterItem key={monster._id} id={monster._id} monsterName={monster.monsterReference} onRemove={handleRemove} />
          ))}
        </ul>
        {!showLookup && <button
            onClick={() => {setShowLookup(true)}}
            className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"
        >
            +
        </button>}
        {showLookup && (
          <div className="monster-lookup">
            <h3 className="text-xl font-bold">Monster Lookup</h3>
            <input
              type="text"
              placeholder="Enter monster name"
              value={searchTerm}
              className="mt-2 rounded px-2 py-2 text-left placeholder:text-yellow-700 bg-cream border border-brown "
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="space-x-2 mt-2">
              <button onClick={searchMonsters}
                className="font-bold mt-2 mr-2 button bg-goblin-green text-gold px-3 py-1 rounded hover:shadow-sm hover:shadow-amber-800">Search</button>
              <button onClick={() => setShowLookup(false)}
                className="font-bold bg-cancel-red button ml-2 hover:shadow-sm hover:shadow-amber-800 text-gold px-3 py-1 rounded ">Close</button>
            </div>

            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            <ul className="flex flex-col items-center">
              {searchResults.map((monster) => (
                <li key={monster.index}
                className="bg-cream border border-brown shadow-sm shadow-amber-800 rounded flex w-80 mt-2 p-4 items-center relative">
                  <img src={monster.image}/>
                  <span>{monster.name}</span>
                  <button 
                  className="absolute right-2 top-1 font-bold mt-2 mr-2 button bg-goblin-green text-gold px-3 py-1 rounded hover:shadow-sm hover:shadow-amber-800"
                  onClick={() => handleAddMonster(monster)}>Add</button>
                </li>
              ))}
            </ul>
          </div>
          )}
      </div>   
    )
  }
}

MonstersList.propTypes = {
  parentLocationID: PropTypes.string.isRequired,
  campaignID: PropTypes.string.isRequired,
};