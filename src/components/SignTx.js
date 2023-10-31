import { useState } from "react";
import useMint from "../UseMint";
import { Button, DropdownButton } from "react-bootstrap";
import { downloadJsonFile, onFiletSelected } from "../utils";

const SignTx = () => {
    const { txInfo, setTxInfo, signTx } = useMint();

    const onScriptSelected = (data) => {
        const _tx = JSON.parse(data);
        setTxInfo(_tx);
    }

    const _signTx = async () => {
        try {
            const tx = await signTx(txInfo.tx, true);
            setTxInfo({ tx });
        } catch (e) {
            console.log('Error', e);
        }
    }

    // const rebuildTx = async () => {
    //     const response = await fetch('http://localhost:8000/signTx', {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(txInfo),
    //     });
    //     const { tx } = await response.json();
    //     setSignedTx(tx);
    // }

    return (
        <>
            <div className="mb-3">
                <label htmlFor="txInfo" className="form-label">Import Tx</label>
                <input type="file" className="form-control" id="txInfo"
                    onChange={(e) => onFiletSelected(e, onScriptSelected)} />
            </div>
            <Button className="btn-primary mb-2" onClick={_signTx}>Sign</Button>
            {/* <div style={{ display: 'flex', 'justifyContent': 'space-evenly' }}>

                {
                    scriptRef.current.signers.map((signer, i) => {
                        return (
                            <div key={`signer-${i}`}>
                                <DropdownButton title="Sign">
                                    {supportedWalletsRef.current.map(w => {
                                        return (
                                            <Dropdown.Item onClick={() => _signTx(w, signer)} key={w.code}>{w.code}</Dropdown.Item>
                                        )
                                    })}
                                </DropdownButton>
                                <p>{signed[signer] ? '✅' : '⛔'}</p>
                            </div>
                        )
                    })
                }
            </div> */}
            <div className="mb-3">
                <label htmlFor="exampleFormControlTextarea1" className="form-label">Tx Info</label>
                <button type="button" className="btn btn-success m-1 p-1 pb-0 pt-0" onClick={() => downloadJsonFile(txInfo, 'tx-info')}>
                    <i className="bi bi-arrow-down-circle"></i>
                </button>
                <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" disabled={true} value={JSON.stringify(txInfo, null, 2)} style={{ 'minHeight': '400px', 'maxHeight': '600px' }}></textarea>
            </div>
        </>
    )
}

export default SignTx;