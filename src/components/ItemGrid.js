import 'bootstrap/dist/css/bootstrap.css';
function ItemGrid({ data, elementSupplier, elementPerRow}) {
    if(elementPerRow == null) {
        elementPerRow = 6
    }
    var partitioned = partition(data, elementPerRow)
    
    return <div class='container-fluid'>
            {partitioned.map(part => <div class='row'>
                {part.map(e => <div style={{'flex-grow':0, 'flex-shrink':0, 'flex-basis':'auto', width: "" + (100.0 / elementPerRow) + "%"}}>{elementSupplier(e)}</div>)}
            </div>)}
        </div>
}

function partition(array, len) {
    var newarr = []
    var partition = []
    var ps = 0
    var pe = len
    var i = 0
    while (i < array.length) {
        if (i >= ps && i < pe) {
            partition.push(array[i])
            i++
        } else {
            ps += len
            pe += len
            newarr.push(partition)
            partition = []
        }
    }
    if (partition.length > 0) newarr.push(partition)
    return newarr;
}
export default ItemGrid;