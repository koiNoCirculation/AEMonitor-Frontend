import 'bootstrap/dist/css/bootstrap.css';
function ItemViewCard({ name, unlocalized_name, icon, meta, count, onclick }) {
    return <div class="card" onClick={onclick !== null ? onclick : () => { }}>
        <div class="card-header"><h6 class="card-title">{name}:{count}</h6></div>
        <img src={icon} class="card-img" alt="..." onError={(props) => props.currentTarget.src = `icons/${unlocalized_name.replace(":","_")}_${meta}_tag_null.png`}/>
    </div>
}
export default ItemViewCard;