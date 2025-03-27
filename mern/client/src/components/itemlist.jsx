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
        <div className="bg-light-tan text-brown rounded-lg p-4">
            {items.length == 0 && !showLookup && <p className="text-lg">No items found here. How about adding some?</p>}
            <ul>
                {items.map((item) => (
                    <Item key={item._id} id={item._id} parentLocationID={parentLocationID} campaignID={campaignID} itemName={item.itemReference} onRemove={handleRemove} />
                ))}
            </ul>
            {!showLookup && <button
                onClick={() => setShowLookup(true)}
                className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800"
            >
                +
            </button>}
            {showLookup && (
                <div className="item-lookup">
                    <h3 className="text-xl font-bold">Item Lookup</h3>
                    <input
                        type="text"
                        placeholder="Enter item name"
                        value={searchTerm}
                        className="mt-2 rounded px-2 py-2 text-left placeholder:text-yellow-700 bg-cream border border-brown "
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="space-x-2">
                        <button onClick={searchItems}
                        className="font-bold mt-2 mr-2 button bg-goblin-green text-gold px-3 py-1 rounded hover:shadow-sm hover:shadow-amber-800">Search</button>
                        <button onClick={() => setShowLookup(false)}
                        className="font-bold bg-cancel-red button ml-2 hover:shadow-sm hover:shadow-amber-800 text-gold px-3 py-1 rounded ">Close</button>
                    </div>
                    {error && <p style={{color: "red" }}>Error: {error}</p>}
                    <ul className="flex flex-col items-center">
                        {searchResults.map((item) => (
                            <li key={item.index}
                                className="bg-cream border border-brown shadow-sm shadow-amber-800 rounded flex w-80 mt-2 p-4 items-center relative">
                                <span>{item.name}</span>
                                <button className="absolute right-2 top-1 font-bold mt-2 mr-2 button bg-goblin-green text-gold px-3 py-1 rounded hover:shadow-sm hover:shadow-amber-800"
                                onClick={() => handleAddItem(item)}>Add</button>
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
