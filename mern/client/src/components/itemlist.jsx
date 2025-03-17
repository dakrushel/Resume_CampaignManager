import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Item from "./item";
import { useAuth0 } from "@auth0/auth0-react";

export default function ItemList({ parentLocationID, campaignID }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLookup, setShowLookup] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const { getAccessTokenSilently } = useAuth0();

    const fetchItems = async () => {
        try {
            setLoading(true);
            const token = await getAccessTokenSilently();
            const response = await fetch(`http://localhost:5050/items/location/${parentLocationID}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch items.");

            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [parentLocationID]);

    const handleAddItem = async (newItem) => {
        try {
            const token = await getAccessTokenSilently();
            await fetch ("http://localhost:5050/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    campaignID,
                    parentLocationID,
                    itemReference: newItem.index,
                }),
            });
            fetchItems();
            setShowLookup(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemove = async (id) => {
        try {
            const token = await getAccessTokenSilently();
            await fetch(`http://localhost:5050/items/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchItems();
        } catch (err) {
            setError(err.message);
        }
    };

    const searchItems = async () => {
        try {
            setSearchResults([]);
            const response = await fetch (`https://www.dnd5eapi.co/api/equipment?name=${searchTerm.toLowerCase()}`);
            if (!response.ok) throw new Error("Monster not found");

            const data = await response.json();
            setSearchResults(data.results || [])
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading items...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <ul>
                {items.map((item) => (
                    <Item key={item._id} id={item._id} parentLocationID={parentLocationID} campaignID={campaignID} itemName={item.itemReference} onRemove={handleRemove} />
                ))}
            </ul>
            <button
                onClick={() => setShowLookup(true)}
                className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"
            >
                +
            </button>
            {showLookup && (
                <div className="item-lookup">
                    <input
                        type="text"
                        placeholder="Enter item name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={searchItems}>Search</button>
                    <button onClick={() => setShowLookup(false)}>Close</button>
                    {error && <p style={{color: "red" }}>Error: {error}</p>}
                    <ul>
                        {searchResults.map((item) => (
                            <li key={item.index}>
                                <span>{item.name}</span>
                                <button onClick={() => handleAddItem(item)}>Add</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

ItemList.propTypes = {
    parentLocationID: PropTypes.string.isRequired,
    campaignID: PropTypes.string.isRequired,
};
