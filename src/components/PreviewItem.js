function PreviewItem({ item }) {
    return <div class={!item.missing ? "card bg-light" : "card text-white bg-danger"}>
          <div class="card-header">{item.displayname}</div>
        <img src={item.icon} class="card-img-top" alt="..."  onError={(props) => props.currentTarget.src = `icons/${item.item_name.replace(":","_")}_${item.meta}_tag_null.png`}/>
        <div class="card-body" style={{ display: 'flex', flexDirection:'column', justifyContent: 'space-between' }}>
            <p class="card-text">present: {item.numberPresent}</p>
            <p class="card-text">toCraft: {item.numberRemainingToCraft}</p>
            {!item.missing ? <></> : <p>missing: {item.missing}</p>}
        </div>
    </div>
}
export default PreviewItem;