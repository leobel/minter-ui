import { Dropdown, DropdownButton, Offcanvas } from "react-bootstrap";
import { toAda } from "../utils";
import { wallets } from '../wallets';
import useMint from "../UseMint";
import { useState } from "react";

const WalletConnector = () => {
    const { wallet, setWallet } = useMint();

    const [show, setShow] = useState(false);


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const onSelectWallet = async (wallet) => {
        setWallet(wallet);
        handleClose();
    }

    const supportedWallets = (wallets) => {
        if (typeof window.cardano === 'undefined') {
          return [];
        }
        const supportedWallets = wallets.filter(w => window.cardano[w.code]).map(w => ({ code: w.code, icon: w.icon, ...window.cardano[w.code] }));
        // supportedWalletsRef.current = supportedWallets;
        return supportedWallets;
      }

    return (
        <>
            <div style={{ position: 'fixed', top: 10, right: 10 }}>
                {wallet && (
                    <DropdownButton id="dropdown-basic-button" title={`₳ ${Math.round(toAda(wallet.balance[0]))}`}>
                        <Dropdown.Item onClick={handleShow}>Switch Wallet</Dropdown.Item>
                    </DropdownButton>
                )
                }
                {!wallet && <button className='btn btn-warning' onClick={handleShow}>Connect Wallet</button>}
            </div>
            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Connect Wallet</Offcanvas.Title>
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
        </>
    )
}

export default WalletConnector;