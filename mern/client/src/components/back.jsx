
export default function BackButton(){
    return(
        // this needs to be fixed to also clear the saved campaign but it works for now
        <button className="absolute top-24 right-12 button bg-goblin-green text-xl text-gold text-center px-6 py-4 rounded-full shadow-sm shadow-amber-800"
        onClick = {() => history.back()}>◀</button>
    )
}