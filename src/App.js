
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import ItemListTab from './tabs/ItemListTab';
import TaskListTab from './tabs/TaskListTab';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { useEffect, useState } from 'react';
function App() {
  const [showInitialSetting, setShowInitialSetting] = useState(false)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [networks, setNetworks] = useState([])
  const [showError, setShowError] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState(-1)
  const [mspt, setmspt] = useState([50, 50, 50])
  useEffect(() => {
    if (token === null) {
      setShowInitialSetting(true);

    } else {
      getAvailNetworks()
    }
    const msptsrc = new EventSource("/api/serverMSPT");
    msptsrc.onmessage = function (message) {
      setmspt(message.data.split(",").map(e => parseFloat(e)))
    }
    msptsrc.onopen = () => { console.log("open") }
  }, [])

  async function getAvailNetworks() {
    try {
      setShowInitialSetting(false)
      var res = await (await fetch("/AE2/getNetworks?ownerUUID=" + token)).json()
      setNetworks(res.body)
      localStorage.setItem("token", token)
      var selectednet = localStorage.getItem('selected')
      console.log("net = " + selectednet)
      if (selectednet === null) selectednet = -1
      else selectednet = parseInt(selectednet)
      setSelectedNetwork(selectednet)
    } catch (e) {
      setShowError(true)
    }
  }
  function getNetworkString(network) {
    return `x=${network.x},y=${network.y},z=${network.z},dimension=${network.dimid}`
  }
  return (
    <>
      <Modal show={showError} onHide={() => setShowInitialSetting(true)}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>Connection timed out!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowError(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showInitialSetting}>
        <Modal.Header closeButton>
          <Modal.Title>Set token</Modal.Title>
        </Modal.Header>
        <Modal.Body><input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder='enter the password given by aemonitor block' /></Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={getAvailNetworks}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <div class='container-fluid p-5 my-5 text-white' style={{ backgroundImage: 'url(/gtnhloadingscreen.png)', width: '100vw', height: '100vh', overflow: 'auto' }}>
        <div class='row'>
          <h3 style={{paddingLeft:0}} class='text-white col-6 pb-3'>Applied Energetics Monitoring and Task Management</h3>

        </div>
        <div class='row'>
          <Router>
            <nav class='navbar nav-pills nav-fill navbar-expand-sm bg-dark col-1'>
              <ul class='navbar-nav'>
                <li class='nav-item ms-1 me-1 '>
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? "bg-success" : ""}  text-white`} to="/itemlist">ItemList</NavLink>
                </li>
                <li class='nav-item ms-1 me-1 '>
                  <NavLink className={({ isActive }) => `nav-link ${isActive ? "bg-success" : ""}  text-white`} to="/tasklist">TaskList</NavLink>
                </li>
              </ul>
            </nav>
            <div class="col-4 offset-md-7" style={{ display: "flex", flexDirection: "row" }}>
              <p class={`d-inline p-2 ${mspt[2] <= 50 ? 'bg-success' : 'bg-danger'} text-white ms-1 me-1`}>Server mspt: {`${mspt[0].toFixed(1)}, ${mspt[1].toFixed(1)}, ${mspt[2].toFixed(1)}`}</p>
              <p class='d-inline p-2 bg-success text-white ms-1 me-1'>Network:</p>
              <Dropdown >
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {selectedNetwork === -1 || networks.length == 0 ? "No network selected" : getNetworkString(networks[selectedNetwork])}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {networks.map((n, i, a) => <Dropdown.Item eventKey={i} onClick={() => { setSelectedNetwork(i); localStorage.setItem("selected", i) }}>{getNetworkString(n)}</Dropdown.Item>)}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <Routes>
              <Route path="/itemlist" element={<ItemListTab network={selectedNetwork !== -1 ? networks[selectedNetwork] : null} owner={token} />}></Route>
              <Route path="/tasklist" element={<TaskListTab network={selectedNetwork !== -1 ? networks[selectedNetwork] : null} owner={token} />}></Route>
              <Route path="/" element={<Navigate to="/itemlist" replace />}></Route>
            </Routes>
          </Router>
        </div>
      </div>
    </>
  );
}

export default App;
