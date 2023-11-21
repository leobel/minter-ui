import { useState } from "react";
import { useWizard } from 'react-use-wizard';
import useMint from "../UseMint";
import { downloadJsonFile } from "../utils";

const UpdateToken = () => {
    const { nextStep } = useWizard();
    const { wallet, txInfo, setTxInfo, updateToken } = useMint();

    const [script, setScript] = useState(null);
    const [tokens, setTokens] = useState([{ asset_name: '', metadata: null }]);

    const onFiletSelected = (e, cb) => {
        const file = e.target.files[0];
        var reader = new FileReader();
        reader.addEventListener('load', function (e) {
            cb(e.target.result);
        });

        reader.readAsText(file);
    }

    const onScriptSelected = (data) => {
        const { policy_id, policy, signers, reference_address, reference } = JSON.parse(data);
        const _script = { policy_id, policy, signers, reference_address, reference };
        setScript(_script);
    }

    const onTokenSelected = (i, asset_name) => {
        return (data) => {
            const metadata = JSON.parse(data);
            const _tokens = [...tokens];
            _tokens[i] = { asset_name, metadata };
            setTokens(_tokens);
        }
    }

    const onAssetChange = (e, i) => {
        const asset_name = e.target.value;
        setTokens(tokens.map((t, index) => index == i ? { ...t, asset_name } : t));
    }

    const addToken = () => {
        setTokens(tokens.concat([{ asset_name: '', metadata: null }]));
    }

    const removeToken = (i) => {
        setTokens(tokens.slice(0, i).concat(tokens.slice(i + 1)));
    }

    const onUpdateToken = async () => {
        const tx = await updateToken(script, tokens);
        setTxInfo({ tx });
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
                                <label className="input-group-text">Asset</label>
                                <input type="text" className="form-control" placeholder='asset...' value={t.asset_name} onChange={(e) => onAssetChange(e, i)} />
                                <input type="file" className="form-control" onChange={(e) => onFiletSelected(e, onTokenSelected(i, t.asset_name))} />
                                <button type="button" className="btn btn-danger p-3 pb-0 pt-0" onClick={() => removeToken(i)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                            <div className="col-2">
                            </div>
                        </div>
                    )
                })}
                {/* TODO: allow update multiple tokens at once */}
                {/* <button type="button" className="btn btn-link p-0" onClick={addToken}>
                    <i className='bi bi-plus-circle-fill'></i>
                    Add more
                </button> */}
            </div>

            <button className='btn btn-primary mt-4 mb-4' onClick={onUpdateToken} disabled={!wallet || (tokens.length == 0 || tokens.some(t => (!t.asset_name || !t.metadata))) || !script}>BuildTx</button>

            <div className="mb-3">
                <label htmlFor="exampleFormControlTextarea1" className="form-label">Tx Info </label>
                <button type="button" className="btn btn-success m-1 p-1 pb-0 pt-0" onClick={() => downloadJsonFile(txInfo, 'tx-info')}>
                    <i className="bi bi-arrow-down-circle"></i>
                </button>
                <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" disabled={true} value={JSON.stringify(txInfo, null, 2)} style={{ 'minHeight': '300px', 'maxHeight': '400px' }}></textarea>
            </div>
        </>
    )
}

export default UpdateToken;