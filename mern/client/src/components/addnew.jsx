import PropTypes from "prop-types";

export default function AddNew({functionsList}){
    return(
        <div className="w-12 h-12 rounded-full overflow-hidden absolute bottom-5 right-5 border-2 justify-center"
        style={{borderColor: "#193E19"}}>
            <button type="button" 
                className="text-2xl w-full h-full leading-none drop-shadow-sm"
                style={{color: "#FFB325", background: "#105b10"}}
                onClick = {() => functionsList(true)}>+</button>
        </div>
    )
}

AddNew.propTypes = {
    functionsList: PropTypes.func.isRequired,
}