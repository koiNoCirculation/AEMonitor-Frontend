import { useState, useEffect } from "react";
import ItemGrid from "../components/ItemGrid";
import ItemViewCard from "../components/ItemViewCard";
import { Modal, Button, Toast, Dropdown, Form, ToastContainer } from "react-bootstrap";
import CraftPreview from "../components/CraftPreview";
function ItemListTab({ owner, network }) {
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [selected, setSelected] = useState({ name: 'a' })
    const [craftCount, setCraftCount] = useState(0)
    const [showDialogCraft, setShowDialogCraft] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [canSubmitCraft, setCanSubmitCraft] = useState(true)
    const [previewReady, setPreviewReady] = useState(true)
    const [previewData, setPreviewData] = useState([])
    const [errorMessagePreview, setErrorMessagePreview] = useState("Fetching craft preview........")
    const [toastContent, setToastContent] = useState("")
    const [showToast, setShowToast] = useState(false)
    const [availCraftCpus, setAvailCraftCpus] = useState([])
    const [selectedCpuToCraft, setSelectedCpuToCraft] = useState(null)
    const [allowMissing, setAllowMissing] = useState(false)
    const [searchKeyWord, setSearchKeyword] = useState("")
    const [searchDebounce, setSearchDebounce] = useState(null)
    const [onlyShowCraftable, setOnlyShowCraftable] = useState(false)
    useEffect(() => {
        console.log(network, owner)
        if (network == null) return;
        const f = async () => {
            setShowToast(true)
            setToastContent("Fetching item list....")
            await fetchItemInfo()
            setShowToast(false)
        }
        f()
        const id = setInterval(async () => {
            fetchItemInfo()
        }, 5000)
        return () => clearInterval(id)
    }, [network])

    useEffect(() => {
        if (searchDebounce != null) clearTimeout(searchDebounce)
        setSearchDebounce(setTimeout(() => filterItems(), 1000));
    }, [data, searchKeyWord, onlyShowCraftable])
    async function fetchItemInfo() {
        try {
            const url = `/AE2/getItemsNoSSE?ownerUUID=${owner}&dimid=${network.dimid}&x=${network.x}&y=${network.y}&z=${network.z}&craftableOnly=false`
            const d = await (await fetch(url)).json()
            setData(d.body)
        } catch (e) {
            setToastContent("Error fetching items")
            setShowToast(true)
            await sleep(5000)
            setShowToast(false)
        }
    }
    function filterItems() {
        setFilteredData(data.filter(
            item => item.displayname.includes(searchKeyWord) && (!onlyShowCraftable || item.craftable))
        )
    }
    function handleClose() {
        setShowDialogCraft(false);
    }
    function getElement(e) {
        function onClick() {
            if (e.craftable) {
                setSelected(e)
                setCraftCount(0)
                setPreviewData([])
                setPreviewReady(false)
                setAvailCraftCpus([])
                setSelectedCpuToCraft(null)
                setShowDialogCraft(true);
            }
        }
        return <ItemViewCard name={e.displayname} unlocalized_name={e.item_name} icon={e.icon} meta={e.meta} count={e.count} onclick={onClick} />
    }
    async function getCpuList(bytesUsed) {
        const url = `/AE2/getCraftingCpuInfoNoSSE?ownerUUID=${owner}&dimid=${network.dimid}&x=${network.x}&y=${network.y}&z=${network.z}`
        try {
            var cpus = (await (await fetch(url)).json()).body
            if (cpus !== undefined) {
                cpus = cpus.filter(cpu => cpu.storage >= bytesUsed && cpu.item == null)
                setAvailCraftCpus(cpus)
                if (cpus.length > 0) {
                    setSelectedCpuToCraft(0)
                } else {
                    setCanSubmitCraft(false)
                }
            }
        } catch (e) {
            setShowToast(true)
            setToastContent("Error fetching crafting cpus.")
            await sleep(5000)
        }
    }
    async function handleGetCraftPreview() {
        try {
            setPreviewReady(false)
            setShowPreview(true)
            var url = `/AE2/generateCraftingPlanNoSSE?ownerUUID=${owner}&dimid=${network.dimid}&x=${network.x}&y=${network.y}&z=${network.z}&item=${selected.item_name}&meta=${selected.meta}&count=${craftCount}`
            if (selected.nbt != null) {
                url += `&nbt=${selected.nbt}`
            }

            var resp = await (await fetch(url, {
                method: "POST",
            })).json()
            var plan = resp.body
            setShowDialogCraft(false)

            setPreviewData(plan)
            setCanSubmitCraft(true)
            for (var i = 0; i < plan.plan.length; i++) {
                var item = plan.plan[i]
                if (item.missing > 0) {
                    setCanSubmitCraft(false)
                    break;
                }
            }
            await getCpuList(plan.bytesUsed)
            setPreviewReady(true)
        } catch (e) {
            setShowDialogCraft(false)
            setErrorMessagePreview(e.message)
        }
    }
    function sleep(time) {
        return new Promise(resolve => setTimeout(() => { console.log('slept for ' + time); resolve() }, time))
    }
    async function handleSubmitCraft() {
        var url = `/AE2/startCraftingJob?ownerUUID=${owner}&dimid=${network.dimid}&x=${network.x}&y=${network.y}&z=${network.z}&item=${selected.item_name}&meta=${selected.meta}&count=${craftCount}&cpuId=${availCraftCpus[selectedCpuToCraft].idx}&allowMissing=${allowMissing}`
        if (selected.nbt != null) {
            url += `&nbt=${selected.nbt}`
        }
        try {
            setShowPreview(false)
            setShowToast(true)
            setToastContent("Submitting craft task")
            var resp = await (await fetch(url, {
                method: 'POST'
            })).json()
            if (resp.succeed) {
                setToastContent("Successfully submitted")
            } else {
                setToastContent("Error: " + resp.message)
                await sleep(5000)
            }
        } catch (e) {
            setToastContent("Network timed out.")
            await sleep(5000)
        } finally {
            setShowToast(false)
        }


    }
    return <div class="position-relative">
        <ToastContainer style={{ zIndex: 1 }} position="middle-center">
            <Toast bg='primary' className="col-4 offset-md-4" show={showToast}>
                <Toast.Header>
                    <h1 className="me-auto">Note</h1>
                </Toast.Header>
                <Toast.Body className="Primary"><h3>{toastContent}</h3></Toast.Body>
            </Toast>
        </ToastContainer>


        <Modal size='xl' show={showPreview} onHide={() => setShowPreview(false)}>
            <Modal.Header closeButton>
                <Modal.Title className="container-fluid">
                    {previewReady ? 
                    <div class='row'>
                        <div class='col-5'>
                            {craftCount} X <img src={selected.icon} width={32} height={32} alt='...'  onError={(props) => props.currentTarget.src = `icon/${selected.item_name.replace(":","_")}_${selected.meta}_tag_null.png`}></img>, {previewData.bytesUsed} bytes
                        </div>
                        <div class='col-3'>
                            <Form>
                                <Form.Check type='switch' id='allow-missing' value={allowMissing} onChange={(ev) => setAllowMissing(ev.target.checked)} label='Allow Missing' />
                            </Form>
                        </div>
                        <div class='col-3'>
                            {canSubmitCraft ? <Dropdown >
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    {selectedCpuToCraft != null ? `CPU #${availCraftCpus[selectedCpuToCraft].idx} ${availCraftCpus[selectedCpuToCraft].parallelism} cores ${availCraftCpus[selectedCpuToCraft].storage} bytes of memory` : <></>}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {availCraftCpus.map((cpu, i, a) => <Dropdown.Item eventKey={i} onClick={() => setSelectedCpuToCraft(i)}>{`CPU #${cpu.idx} ${cpu.parallelism} cores ${cpu.storage} bytes of memory`}</Dropdown.Item>)}
                                </Dropdown.Menu>
                            </Dropdown> : <></>}
                        </div>
                    </div> : <></>
                    }
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {previewReady ?
                    <CraftPreview previewData={previewData.plan} itemsToCraft={selected} /> :
                    <div>
                        <div class="spinner-border" role="status">
                        </div>
                        <span>{errorMessagePreview}</span>
                    </div>}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {
                    setShowPreview(false)
                    setAllowMissing(false)
                }}>
                    Close
                </Button>
                {canSubmitCraft && previewReady ? <Button variant="primary" onClick={handleSubmitCraft}>
                    Submit
                </Button> : <Button variant="primary" onClick={handleSubmitCraft} disabled>
                    Submit
                </Button>}
            </Modal.Footer>
        </Modal >
        <Modal show={showDialogCraft} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Craft: {selected.displayname}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <input type="number" value={craftCount} onChange={(v) => setCraftCount(parseInt(v.target.value))} placeholder="enter the number of items" />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleGetCraftPreview}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
        <div class="container-fluid">
            <div class='row' style={{ display: "flex", flexDirection: "row", marginTop: '5px', marginBottom: '5px'  }}>
                <Form className='col-9' style={{ display: "flex", flexDirection: "row"}}>
                    <Form.Check // prettier-ignore
                        type="switch"
                        id="craftable-switch"
                        value = {onlyShowCraftable}
                        onChange = {(e) => setOnlyShowCraftable(e.target.checked)}
                        label="Show craftable items only"
                        style={{ marginRight: '5px' }}

                    />
                </Form>
                <input
                    type="text"
                    class='col-3'
                    value={searchKeyWord}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search Items"
                    aria-label="searck-keyword"
                />
            </div>
        </div>


        <ItemGrid data={filteredData} elementSupplier={getElement} />
    </div>

}

export default ItemListTab;