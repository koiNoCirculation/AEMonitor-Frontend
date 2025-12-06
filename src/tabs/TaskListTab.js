import { Nav, Toast, Button, ToastContainer } from "react-bootstrap";
import { useEffect, useState } from "react";
import ItemGrid from "../components/ItemGrid";
import CraftStatusItem from "../components/CraftStatusItem";
function TaskListTab({ owner, network }) {
    const [cpulist, setCpuList] = useState([]);
    const [showToast, setShowToast] = useState(false)
    const [toastContent, setToastContent] = useState("")
    const [selectedCPU, setSelectedCPU] = useState(null)
    const [craftDetails, setCraftDetails] = useState([])
    async function sleep(time) {
        return new Promise(resolve => setTimeout(resolve, time))
    }
    async function getCpuList() {
        const url = `/AE2/getCraftingCpuInfoNoSSE?ownerUUID=${owner}&dimid=${network.dimid}&x=${network.x}&y=${network.y}&z=${network.z}`
        try {
            const cpus = (await (await fetch(url)).json()).body
            if (cpus !== undefined) {
                setCpuList(cpus)
                if (cpus.length > 0) {
                    setSelectedCPU(cpus[0].idx)
                }
            }
        } catch (e) {
            setShowToast(true)
            setToastContent("Error fetching crafting cpus.")
            await sleep(5000)
            setShowToast(false)
        }
    }
    function selectCPU(evk) {
        setSelectedCPU(parseInt(evk))
    }
    async function getCraftingDetails() {
        if (network == null || selectedCPU == null) return
        const url = `/AE2/getCraftingDetailsNoSSE?ownerUUID=${owner}&dimid=${network.dimid}&x=${network.x}&y=${network.y}&z=${network.z}&cpuid=${selectedCPU}`
        try {
            const details = (await (await fetch(url)).json()).body
            if (details.length === 0) {
                cpulist[selectedCPU].item = null;
            } else if(cpulist[selectedCPU].item == null) {
                await getCpuList()
            }
            setCraftDetails(details)
        } catch (e) {
            setShowToast(true)
            setToastContent("Error fetching crafting details.")
            await sleep(5000)
            setShowToast(false)
        }
    }
    useEffect(() => {
        if (network == null) return;
        const f = async () => {
            setShowToast(true)
            setToastContent('Getting craft cpu info...')
            await getCpuList()
            setShowToast(false)
        }
        f()
    }, [network])
    useEffect(() => {
        const f = async() => {
            setShowToast(true)
            setToastContent("Fetching crafting details on CPU #" + cpulist[selectCPU].idx)
            await getCraftingDetails()
            setToastContent(false)
        }
        const id = setInterval(() => {
            getCraftingDetails()
        }, 2000)
        return () => {
            setCraftDetails([])
            clearInterval(id)
        }
    }, [selectedCPU])
    async function cancelTask(cpu) {
        const url = `/AE2/cancelTask?ownerUUID=${owner}&dimid=${network.dimid}&x=${network.x}&y=${network.y}&z=${network.z}&cpuid=${cpu.idx}`
        setShowToast(true)
        setToastContent("Cancelling task")
        try {
            const resp = await ((await fetch(url, { method: 'post' })).json())
            if (resp.succeed) {
                setToastContent('Successfully canceled Task');
                cpu.icon = null
                cpu.item = null
            }
        } catch (e) {
            setToastContent(e.message)
            await sleep(5000)
        }
        setShowToast(false)

    }
    return <div class="container-fluid">
        <ToastContainer style={{ zIndex: 1 }} position="middle-center">
            <Toast bg='primary' className="col-4 offset-md-4" show={showToast}>
                <Toast.Header>
                    <strong className="me-auto">Note</strong>
                </Toast.Header>
                <Toast.Body className="Primary">{toastContent}</Toast.Body>
            </Toast>
        </ToastContainer>
        {cpulist.length > 0 ?
            <div class="row">
                <div class="col-2">
                    <Nav defaultActiveKey={`/tasklist/${cpulist[0].idx}`} activeKey={selectedCPU} onSelect={selectCPU} className="flex-column">
                        {cpulist.map(cpu =>
                            <Nav.Item>
                                <div class="row" style={{ display: "flex", flexDirection: 'row', marginTop: '2.5px', marginBottom: '2.5px' }}>
                                    <Nav.Link style={{ display: "flex", flexDirection: 'row' }} className={selectedCPU === cpu.idx ? 'col-8 nav-link bg-light text-black' : 'col-8 nav-link bg-dark text-white'} eventKey={cpu.idx} href="#">
                                        {cpu.icon != null ? <img src={cpu.icon} height={24} width={24} alt='...' onError={(props) => props.currentTarget.src = `icons/${cpu.item.replace(":","_")}_${cpu.meta}_tag_null.png`}/> : <></>}
                                        <p>CPU #{cpu.idx}</p>
                                    </Nav.Link>
                                    <Button className='col-4' disabled={cpu.item == null} onClick={() => cancelTask(cpu)} variant='primary'>Cancel</Button>
                                </div>
                            </Nav.Item>)}
                    </Nav>
                </div>
                <div class="col-10">
                    <div class="container-fluid">
                        <ItemGrid data={craftDetails} elementSupplier={(el) => <CraftStatusItem item={el} />} elementPerRow={6} />
                    </div>
                </div>
            </div> : <></>}
    </div>


}
export default TaskListTab;