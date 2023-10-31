import logo from './logo.svg';
import './App.css';

import { Wizard, useWizard } from 'react-use-wizard';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Popover from 'react-bootstrap/Popover';
import { cborDecode, cborEncode, cborEncodeV2, getAddress } from './utils';
import Cardano from "./serialization";
import BuildTx from './components/BuildTx';
import WalletConnector from './components/WalletConnector';
import Mint from './components/Mint';
import SignTx from './components/SignTx';


const MintContext = createContext({});

function App() {
  const [wallet, setWallet] = useState(null);
  const cardanoRef = useRef(null);
  const apiRef = useRef(null);
  const supportedWalletsRef = useRef(null);
  const scriptRef = useRef(null);
  const tokensRef = useRef([]);
  const paymentsRef = useRef([]);
  const collateralsRef = useRef([]);
  const changeAddressRef = useRef(null);
  const txInfoRef = useRef(null);
  const signaturesRef = useRef([]);

  async function loadCardano() {
    await Cardano.load();
    const instance = Cardano.instance;
    cardanoRef.current = instance;
  }

  const getBalance = async (wallet) => {
    return cborDecode(await wallet.getBalance());
  }

  const getChangeAddress = async (wallet) => {
    const hex = await wallet.getChangeAddress();
    return getAddress(cardanoRef.current, hex);
  }

  useEffect(() => {
    loadCardano();
  }, []);

  return (
    <MintContext.Provider value={{
      cardanoRef,
      apiRef,
      supportedWalletsRef,
      scriptRef,
      tokensRef,
      paymentsRef,
      collateralsRef,
      changeAddressRef,
      txInfoRef,
      signaturesRef
    }}>,
      <Mint>
        <div className='container'>
          <WalletConnector></WalletConnector>
          <div className="main-content">
            <div className='row justify-content-center' style={{ height: '100vh' }}>
              <div style={{ display: 'flex', 'flexDirection': 'column' }}>
                <Wizard
                  header={<Header />}
                  footer={<Footer />}
                  wrapper={<Wrapper />}
                >
                  {/* <CreateScript /> */}
                  <BuildTx />
                  <SignTx />
                </Wizard>
              </div>
            </div>
          </div>
        </div>
      </Mint>
    </MintContext.Provider>
  )
}

const steps = [
  // {
  //   title: 'Create script'
  // },
  {
    title: 'Build Tx'
  },
  {
    title: 'Sign Tx'
  }
]


const Header = () => {
  const { activeStep } = useWizard();

  return (
    <div className="wizard-form py-4 my-2">
      <ul id="progressBar" className="progressbar justify-content-center">
        {
          steps.map((s, i) => (<li id="progressList-1" className={`d-inline-block fw-bold w-25 position-relative text-center float-start progressbar-list ${i <= activeStep ? "active" : ""}`} key={i}>{s.title}</li>))
        }
      </ul>
    </div>
  )
};

const Wrapper = ({ children }) => <div className='step-container'>{children}</div>
const Footer = () => {
  const { previousStep, nextStep } = useWizard();

  return (
    <div className='footer pb-5'>
      <Button onClick={previousStep} className='btn-secondary'>Previous</Button>
      <Button onClick={nextStep} className='btn-success m-1'>Next</Button>
      {/* <button onClick={() => nextStep()}>Next ⏭</button> */}
    </div>
  )
}



export default App;
