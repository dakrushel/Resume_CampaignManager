import { useState } from "react";

export default function RulesLookup() {
    const [searchTerm, setSearchTerm] = useState("");
    const [rule, setRule] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const fetchRule = async () => {
        if (!searchTerm.trim()) return;
        
        setLoading(true);
        setError(null);
        setRule(null);

        const formattedSearchTerm = searchTerm.trim().toLowerCase().replace(/\s+/g, "-"); // Replace spaces with dashes

        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        try {
            const response = await fetch(`https://www.dnd5eapi.co/api/rule-sections/${formattedSearchTerm}`, requestOptions);
            if (!response.ok) {
                throw new Error("Rule not found.");
            }
            
            const data = await response.json();
            setRule(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Function to format response text (basic Markdown conversion)
    const formatText = (text) => {
        return text
            .replace(/### /g, "<h3 class='text-lg font-semibold mt-2'>")
            .replace(/## /g, "<h2 class='text-xl font-bold mt-2'>")
            .replace(/#### /g, "<h4 class='text-md font-semibold mt-2'>")
            .replace(/\n/g, "<br />");
    };

    return (
        <div className="p-4 bg-light-tan border border-brown rounded-md mt-16">
            <h2 className="text-xl font-bold">Rules Lookup</h2>
            <input 
                type="text" 
                placeholder="Enter rule index..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 rounded w-full"
            />
            <button 
                onClick={fetchRule} 
                className="mt-2 bg-dark-green text-gold px-4 py-2 rounded">
                Search
            </button>
            
            {loading && <p>Loading rule...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
            {rule && (
                <div className="mt-4 p-3 bg-cream rounded-md border border-brown">
                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                    <p dangerouslySetInnerHTML={{ __html: formatText(rule.desc) }}></p>
                </div>
            )}
        </div>
    );
}
