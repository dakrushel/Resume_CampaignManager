import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

export default function CampaignList() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    const userId = window.localStorage.getItem("userId")

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const token = await getAccessTokenSilently({ audience: "https://campaignapi.com"});
                const response = await fetch("http://localhost:5050/campaigns", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error fetching campaigns: ${response.statusText}`);
                }

                const data = await response.json();
                setCampaigns(data);
            } catch (err) {
                console.error("Failed to fetch campaigns:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, [getAccessTokenSilently]);

    const handleCreateCampaign = async () => {
        navigate("/campaigns/new");
    };

    if (loading) return (<div className="mt-16 flex flex-col justify-center items-center"><img src="/loader.gif" height="256" width="256"/><p className="text-lg text-brown">Loading campaigns...</p></div>);
    if (error)
        return (
            <div className="mt-16 bg-light-tan text-lg text-red-800 p-2 rounded">
                <p>Error: {error}. Sorry!</p>
            </div>
        );

    // console.log("CampaignList - campaignlist did stuff")

    return (
        <div className="flex-1 flex-col justify-center max-w-6xl min-w-96 rounded-lg p-2 bg-cream mt-16 shadow-md shadow-amber-800">
            {campaigns.length === 0 ? (
                <div className="text-center">
                    <p className="text-lg">No campaigns available.</p>
                    <button onClick={handleCreateCampaign} className="mt-2 bg-goblin-green text-gold px-4 py-2 rounded shadow-sm shadow-amber-800 button">
                        Create One
                    </button>
                </div>
            ) : (
                campaigns.map((campaign) => (
                    <div key={campaign._id} className="p-2 border-b border-brown rounded">
                        <Link to={`/campaigns/${campaign._id}`} 
                        className="text-xl text-brown font-bold hover:underline"
                        onClick={()=> this.forceUpdate()}>
                            {campaign.title}
                        </Link>
                    </div>
                ))
            )}
            <button onClick={handleCreateCampaign} className="mt-2 bg-goblin-green text-xl text-gold px-4 py-2 rounded-full shadow-sm shadow-amber-800 button">
                +
            </button>
        </div>
    );
}
