import { useState } from "react";
import { useWizard } from 'react-use-wizard';
import useMint from "../UseMint";
import { downloadJsonFile } from "../utils";

const BuildTx = () => {
    const { nextStep } = useWizard();
    const { wallet, buildTx } = useMint();

    const [script, setScript] = useState(null);
    const [tokens, setTokens] = useState([{ address: '', token: null }]);
    const [txInfo, setTxInfo] = useState({ tx: ''});

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
        const _txInfo = await buildTx(script, tokens);
        setTxInfo(_txInfo);
    }

    return (
        <>
            <div className="mb-3">
                <label htmlFor="script" className="form-label">Import Script</label>
                <input type="file" className="form-control" id="script"
                    onChange={(e) => onFiletSelected(e, onScriptSelected)} />
            </div>
            <legend>Tokens</legend>
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

            <button className='btn btn-primary mt-4 mb-4' onClick={onBuildTx} disabled={!wallet || (tokens.length == 0 || tokens.some(t => (!t.address || !t.token))) || !script}>BuildTx</button>

            <div className="mb-3">
                <label htmlFor="exampleFormControlTextarea1" className="form-label">Tx Info </label>
                <button type="button" className="btn btn-success m-1 p-1 pb-0 pt-0" onClick={() => downloadJsonFile(txInfo, 'tx-info')}>
                    <i className="bi bi-arrow-down-circle"></i>
                </button>
                <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" disabled={true} value={JSON.stringify(txInfo, null, 2)} style={{ 'minHeight': '400px', 'maxHeight': '600px' }}></textarea>
            </div>
        </>
    )
}

export default BuildTx;