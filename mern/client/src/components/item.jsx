import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuth0 } from "@auth0/auth0-react";

export default function Item({ id, parentLocationID, campaignID, itemName, onRemove }) {
    const [expanded, setExpanded] = useState(false);
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                setLoading(true);
                setError(null);
    
                itemName = itemName.replaceAll(" ", " -");
                
                const token = await getAccessTokenSilently();
                const response = await fetch(`https://www.dnd5eapi.co/api/equipment/${itemName}`,{
                    hearders: { Authorization: `Bearer ${token}`},
                });
                
                if (!response.ok) throw new Error(`Failed to fetch items: ${response.statusText}`)
    
                const data = await response.json();
                setItem(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchItemDetails();
    }, [parentLocationID]);

    // const toggleDetails = () => {
    //     setExpanded(!expanded);
    // }

    if (loading) return <li>Loading {itemName}...</li>;
    if (error) return <li>Error loading {itemName}: {error}</li>;

    return (
        <li className="bg-cream p-3 rounded-md shadow-md shadow-amber-800">
            <div className="flex flex-col items-center justify-center gap-2">
                <button onClick={() => setExpanded(!expanded)} className="text-lg font-semibold flex items-center">
                    {expanded ? "▲" : "▼"} {item?.name || "Unknown"}
                </button>
                <button onClick={() => onRemove(id)} className="mt-2 bg-cancel-red button font-bold text-gold px-3 py-1 rounded">
                    Remove
                </button>
            </div>
            {expanded && item && (
                <div className="mt-2 p-2 bg-light-tan rounded-md">
                    <p><strong>Category:</strong> {item.equipment_category?.name || "Unknown"}</p>
                    <p><strong>Cost:</strong> {item.cost.quantity} {item.cost.unit}</p>
                    <p><strong>Weight:</strong> {item.weight || "N/A"} lbs</p>
                    {item.damage && (
                        <p><strong>Damage:</strong> {item.damage.damage_dice} ({item.damage.damage_type?.name})</p>
                    )}
                    {item.properties?.length > 0 && (
                        <div>
                            <strong>Properties:</strong>
                            <ul>
                                {item.properties.map((prop, index) => (
                                    <li key={index}>{prop.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </li>
    );
}

Item.propTypes = {
    itemName: PropTypes.string.isRequired,
    onRemove: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
};
