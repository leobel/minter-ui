import logo from './logo.svg';
import './App.css';

import { Wizard, useWizard } from 'react-use-wizard';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { wallets } from './wallets';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Popover from 'react-bootstrap/Popover';
import { cborDecode, cborEncode, cborEncodeV2, getAddress } from './utils';
import Cardano from "./serialization";


const MintContext = createContext({});

function App() {
  const [show, setShow] = useState(false);
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

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  async function loadCardano() {
    await Cardano.load();
    const instance = Cardano.instance;
    cardanoRef.current = instance;
  }

  const onSelectWallet = async (wallet) => {
    apiRef.current = await wallet.enable();
    const [balance, changeAddress] = await Promise.all([getBalance(apiRef.current), getChangeAddress(apiRef.current)]);
    console.log('changeAddress', changeAddress);
    changeAddressRef.current = changeAddress;
    setWallet({ ...wallet, balance });
    handleClose();
  }

  const getBalance = async (wallet) => {
    return cborDecode(await wallet.getBalance());
  }

  const getChangeAddress = async (wallet) => {
    const hex = await wallet.getChangeAddress();
    return getAddress(cardanoRef.current, hex);
  }

  const supportedWallets = (wallets) => {
    if (typeof window.cardano === 'undefined') {
      return [];
    }
    const supportedWallets = wallets.filter(w => window.cardano[w.code]).map(w => ({ code: w.code, icon: w.icon, ...window.cardano[w.code] }));
    supportedWalletsRef.current = supportedWallets;
    return supportedWallets;
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
      <div className='container'>
        <div style={{ position: 'fixed', top: 10, right: 10 }}>
          {wallet && (
            <DropdownButton id="dropdown-basic-button" title={`₳ ${Math.round(wallet.balance[0] / 1000000)}`}>
              <Dropdown.Item onClick={handleShow}>Switch Wallet</Dropdown.Item>
            </DropdownButton>
          )
          }
          {!wallet && <button className='btn btn-warning' onClick={handleShow}>Connect Wallet</button>}
        </div>
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
        <Offcanvas show={show} onHide={handleClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Offcanvas</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div style={{ display: 'flex', 'flexDirection': 'column' }}>
              {supportedWallets(wallets).map(w => {
                return (
                  <button className='btn btn-outline-dark mb-2' key={w.code} onClick={() => onSelectWallet(w)}>
                    {w.code}
                  </button>
                )
              })}
            </div>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
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

const BuildTx = () => {
  const { nextStep } = useWizard();
  const { cardanoRef, apiRef, scriptRef, changeAddressRef, txInfoRef, signaturesRef } = useContext(MintContext);
  const [script, setScript] = useState(null);
  const [tokens, setTokens] = useState([{ address: '', token: null }]);

  const onFiletSelected = (e, cb) => {
    const file = e.target.files[0];
    var reader = new FileReader();
    reader.addEventListener('load', function (e) {
      cb(e.target.result);
    });

    reader.readAsText(file);
  }

  const onScriptSelected = (data) => {
    const { policy_id, policy, signers, reference_address, mint } = JSON.parse(data);
    const _script = { policy_id, policy, signers, reference_address, mint };
    scriptRef.current = _script;
    setScript(_script);
  }

  const onTokenSelected = (i, address) => {
    return (data) => {
      const token = JSON.parse(data);
      const _tokens = [...tokens];
      _tokens[i] = { address, token };
      setTokens(_tokens);
    }
  }

  const onAddressChange = (e, i) => {
    const addr = e.target.value;
    setTokens(tokens.map((t, index) => index == i ? { ...t, address: addr } : t));
  }

  const addToken = () => {
    setTokens(tokens.concat([{ address: '', token: null }]));
  }

  const removeToken = (i) => {
    setTokens(tokens.slice(0, i).concat(tokens.slice(i + 1)));
  }

  const onBuildTx = async () => {
    try {
      const amount = Math.max(5, tokens.length * 5) * 1000000;
      const encode = cborEncode(cardanoRef.current, amount);
      const payments = await apiRef.current.getUtxos(encode);
      const api = apiRef.current.getCollateral ? apiRef.current : apiRef.current.experimental
      const collaterals = await api.getCollateral(cborEncode(cardanoRef.current, 5 * 1000000));
      const response = await fetch('http://localhost:8000/buildTx', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script,
          tokens: tokens.reduce((dict, { address, token }) => ({ ...dict, [address]: (dict[address] || []).concat([token]) }), {}),
          payments,
          collaterals,
          change_address: changeAddressRef.current
        }),
      });
      const txInfo = await response.json();
      if (txInfo && !txInfo.error) {
        txInfoRef.current = {tx: txInfo.tx, multi: txInfo.multi};
        const signature = await apiRef.current.signTx(txInfo.tx, true);
        signaturesRef.current.push(signature);
        nextStep();
      } else {
        console.log('Error', txInfo);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  return (
    <>
      <div className="mb-3">
        <label htmlFor="script" className="form-label">Import Script</label>
        <input type="file" className="form-control" id="script"
          onChange={(e) => onFiletSelected(e, onScriptSelected)} />
      </div>
      <legend>Add Tokens</legend>
      <div>
        {tokens.map((t, i) => {
          return (
            <div className='row' key={i}>
              <div className="col-12 input-group mb-3">
                <label className="input-group-text">Address</label>
                <input type="text" className="form-control" placeholder='addr...' value={t.address} onChange={(e) => onAddressChange(e, i)} />
                <input type="file" className="form-control" onChange={(e) => onFiletSelected(e, onTokenSelected(i, t.address))} />
                <button type="button" className="btn btn-danger p-3 pb-0 pt-0" onClick={() => removeToken(i)}>
                  <i className="bi bi-trash"></i>
                </button>
              </div>
              <div className="col-2">
              </div>
            </div>
          )
        })}
        <button type="button" className="btn btn-link p-0" onClick={addToken}>
          <i className='bi bi-plus-circle-fill'></i>
          Add more
        </button>
      </div>

      <button className='btn btn-primary mt-4' onClick={onBuildTx} disabled={!apiRef.current || (tokens.length == 0 || tokens.some(t => (!t.address || !t.token))) || !script }>BuildTx</button>
    </>
  )
}
const SignTx = () => {
  const { cardanoRef, apiRef, supportedWalletsRef, scriptRef, changeAddressRef, txInfoRef, signaturesRef } = useContext(MintContext);
  const [signed, setSigned] = useState({});
  const [signedTx, setSignedTx] = useState('');

  const signTx = async (wallet, signer) => {
    try {
      const api = await wallet.enable();
      const { tx } = txInfoRef.current;
      const signature = await api.signTx(tx, true);
      signaturesRef.current.push(signature);
      console.log('Signatures:', signaturesRef.current);
      setSigned({ ...signed, [signer]: true });
    } catch (e) {
      console.log('Error', e);
    }
  }

  const rebuildTx = async () => {
    const response = await fetch('http://localhost:8000/signTx', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signatures: signaturesRef.current,
        ...txInfoRef.current
      }),
    });
    const { tx } = await response.json();
    setSignedTx(tx);
  }

  return (
    <>
      <legend className='text-center' >Script Signers</legend>
      <div style={{ display: 'flex', 'justifyContent': 'space-evenly' }}>
        {
          scriptRef.current.signers.map((signer, i) => {
            return (
              <div key={`signer-${i}`}>
                <DropdownButton title="Sign">
                  {supportedWalletsRef.current.map(w => {
                    return (
                      <Dropdown.Item onClick={() => signTx(w, signer)} key={w.code}>{w.code}</Dropdown.Item>
                    )
                  })}
                </DropdownButton>
                <p>{signed[signer] ? '✅' : '⛔'}</p>
              </div>
            )
          })
        }
      </div>
      <Button onClick={rebuildTx}>Finish Tx</Button>
      <div className="mb-3">
        <label htmlFor="exampleFormControlTextarea1" className="form-label">Tx</label>
        <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" disabled={true} value={signedTx}></textarea>
      </div>
    </>
  )
}

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
  const { previousStep  } = useWizard();

  return (
    <div className='footer pb-5'>
      <Button onClick={previousStep} className='btn-secondary'>Previous</Button>
      {/* <button onClick={() => nextStep()}>Next ⏭</button> */}
    </div>
  )
}



export default App;
