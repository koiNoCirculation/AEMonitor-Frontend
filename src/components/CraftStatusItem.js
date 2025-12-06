function CraftStatusItem({item}) {
    return <div class="container" style={{backgroundColor: 'white'}}> 
        <div class="row">
            <img src={item.icon} alt='...'  onError={(props) => props.currentTarget.src = `icons/${item.item_name.replace(":","_")}_${item.meta}_tag_null.png`}/>
            <div style={{display:'flex', flexDirection:'column', backgroundColor: item.isCrafting ? 'green': 'gray'}}>
                <b>{item.displayname}</b>
                <p>Present:{item.numberPresent}</p>
                <p>Sent:{item.numberSent}</p>
                <p>ToCraft:{item.numberRemainingToCraft}</p>
            </div>
        </div>
    </div>
}
export default CraftStatusItem;