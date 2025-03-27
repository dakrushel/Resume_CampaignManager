import CharacterList from "./characterlist"


export default function PlayerCharacters() {

    return(
        <div className="p-8 bg-cream rounded-lg shadow-md shadow-amber-800 mt-16 text-brown">
            <h2 className="text-3xl sancreek-regular">Your Party</h2>
            <CharacterList campaignID={window.localStorage.getItem("selectedCampaign")}/>
        </div>
    )
}