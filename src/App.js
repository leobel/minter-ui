import './App.css';

import { Wizard, useWizard } from 'react-use-wizard';
import Button from 'react-bootstrap/Button';
import MintToken from './components/MintToken';
import WalletConnector from './components/WalletConnector';
import Mint from './components/Mint';
import SignTx from './components/SignTx';
import CreateScript from './components/CreateScript';
import SetUp from './components/Setup';
import UpdateToken from './components/UpdateToken';



function App() {
  return (
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
                <SetUp />
                <CreateScript />
                <MintToken />
                <UpdateToken />
                <SignTx />
              </Wizard>
            </div>
          </div>
        </div>
      </div>
    </Mint>
  )
}

const steps = [
  {
    title: 'Setup'
  },
  {
    title: 'Create script'
  },
  {
    title: 'Mint NFT'
  },
  {
    title: 'Update NFT'
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
  const { isFirstStep, previousStep, nextStep } = useWizard();

  return (
    <>
      {!isFirstStep && <div className='footer pb-5'>
        <Button onClick={previousStep} className='btn-secondary'>Previous</Button>
        <Button onClick={nextStep} className='btn-primary m-1'>Next</Button>
      </div>}
    </>
  )
}



export default App;
