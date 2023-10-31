import { useState } from "react";
import { Button, ButtonToolbar, Dropdown, DropdownButton, Form } from "react-bootstrap";
import { useWizard } from "react-use-wizard";
import useMint from "../UseMint";
import { downloadJsonFile } from "../utils";

const CreateScript = () => {
    const { nextStep } = useWizard();
    const { createScript } = useMint()
    const [label, setLabel] = useState('444');
    const [network, setNetwork] = useState('mainnet');
    const [signers, setSigners] = useState([{ address: '' }]);

    const onAddressChange = (e, i) => {
        const addr = e.target.value;
        setSigners(signers.map((t, index) => index == i ? { ...t, address: addr } : t));
    }

    const addAddress = () => {
        setSigners(signers.concat([{ address: '', token: null }]));
    }

    const removeAddress = (i) => {
        setSigners(signers.slice(0, i).concat(signers.slice(i + 1)));
    }

    const handleLabel = (e) => {
        setLabel(e.target.value);
    }

    const handleNetwork = (e) => {
        setNetwork(e.target.value);
    }

    const generateScript = async () => {
        const script = await createScript(label, network, signers);
        downloadJsonFile(script, `script-${label}-${network}`);
    }

    return (
        <>
            <label>NFT Type</label>
            <Form.Select onChange={handleLabel} className="mb-3">
                <option value="444">CIP68 - 444</option>
            </Form.Select>

            <label>Blockchain Network</label>
            <Form.Select onChange={handleNetwork} className="mb-3">
                <option value="mainnet">Mainnet</option>
                <option value="preprod">Preprod</option>
            </Form.Select>
            <legend>Signers</legend>
            <div>
                {signers.map((s, i) => {
                    return (
                        <div className='row' key={i}>
                            <div className="col-12 input-group mb-3">
                                <label className="input-group-text">Address</label>
                                <input type="text" className="form-control" placeholder='addr...' value={s.address} onChange={(e) => onAddressChange(e, i)} />
                                <button type="button" className="btn btn-danger p-3 pb-0 pt-0" onClick={() => removeAddress(i)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                            <div className="col-2">
                            </div>
                        </div>
                    )
                })}
                <button type="button" className="btn btn-link p-0" onClick={addAddress}>
                    <i className='bi bi-plus-circle-fill'></i>
                    Add more
                </button>
            </div>

            <Button className="mt-2" onClick={generateScript}>Create Script</Button>
        </>
    );
};

export default CreateScript;