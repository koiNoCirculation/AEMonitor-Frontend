import PreviewItem from "./PreviewItem";
import ItemGrid from "./ItemGrid";
function CraftPreview({previewData, itemsToCraft}) {
    function supplyItem(e) {
        return <PreviewItem item={e} />
    }
    return <ItemGrid data={previewData} elementSupplier={supplyItem} elementPerRow={4}></ItemGrid>
}
export default CraftPreview;