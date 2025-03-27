import NpcList from "./NPCList";

export default function NonPlayerCharacters() {

    return(
        <div className="p-8 bg-cream rounded-lg shadow-md shadow-amber-800 mt-16 text-brown">
            <h2 className="text-3xl sancreek-regular">Your Characters</h2>
            <p>This area of the site is under construction</p>
            <NpcList campaignID={window.localStorage.getItem("selectedCampaign")}/>
        </div>
    )
}