function Button({ action, text, className }) {

    function handleClick(e) {
        e.preventDefault()

        action()
    }

    return (
        <button className={`btn mx-auto my-0 ${className}`} onClick={ (e)=>handleClick(e) }>{ text }</button>
    )
}

export default Button