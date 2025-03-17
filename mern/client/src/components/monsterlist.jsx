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

  return (
    <div>
      <ul>
        {monsters.map((monster) => (
          <MonsterItem key={monster._id} id={monster._id} monsterName={monster.monsterReference} onRemove={handleRemove} />
        ))}
      </ul>
      <button
          onClick={() => {setShowLookup(true)}}
          className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"
      >
          +
      </button>
      {showLookup && (
        <div className="monster-lookup">
          <h3>Monster Lookup</h3>
          <input
            type="text"
            placeholder="Enter monster name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={searchMonsters}>Search</button>
          <button onClick={() => setShowLookup(false)}>Close</button>

          {error && <p style={{ color: "red" }}>Error: {error}</p>}

          <ul>
            {searchResults.map((monster) => (
              <li key={monster.index}>
                <span>{monster.name}</span>
                <button onClick={() => handleAddMonster(monster)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
        )}
    </div>   
  )
}

MonstersList.propTypes = {
  parentLocationID: PropTypes.string.isRequired,
  campaignID: PropTypes.string.isRequired,
};