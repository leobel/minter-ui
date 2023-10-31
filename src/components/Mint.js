import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import MintContext from "../MintContext";
import Cardano from "../serialization";
import { cborDecode, cborEncode, getAddress, getSignersCollateral, getSignersUtxos, rebuildTx, toLovelace } from "../utils";

function Mint({ children }) {
    const [wallet, setCurrentWallet] = useState(null);
    const cardanoRef = useRef(null);
    const scriptSigners = useRef(new Set());
    const inputSigners = useRef(new Set());
    const tx = useRef(null);

    const setScriptSigners = useCallback((signers) => {
        const set = new Set();
        console.log('Script Signers:', signers);
        for (const signer of signers) {
            set.add(signer);
        }
        scriptSigners.current = set;
        tx.current = null;
        console.log('Tx Script Signers', scriptSigners.current);
    }, []);

    const setInputSigners = (signers) => {
        const set = new Set();
        console.log('Inputs Signers:', signers);
        for (const signer of signers) {
            set.add(signer);
        }
        inputSigners.current = set;
        console.log('Tx Inputs Signers', inputSigners.current);
    };


    const setWallet = useCallback(async (wallet) => {
        try {
            const api = await wallet.enable();

            // get balance
            const balance = cborDecode(await api.getBalance());

            // get wallet 
            const hex = await api.getChangeAddress();
            const address = getAddress(cardanoRef.current, hex);

            setCurrentWallet({ ...wallet, api, balance, address });
        } catch (e) {
            console.log('setWallet error:', e);
        }
    }, []);

    const signTx = useCallback(async (tx, partial = true) => {
        const signature = await wallet.api.signTx(tx, partial);
        return rebuildTx(cardanoRef.current, tx, signature, (scriptSigners.current.size == 0 ? null : scriptSigners.current))
    }, [wallet]);

    const buildTx = useCallback(async (script, tokens) => {
        try {
            const payments = await getUtxos(wallet, tokens.length);
            const collaterals = await getCollateral(wallet);
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
                    change_address: wallet.address
                }),
            });
            const _txInfo = await response.json();
            if (_txInfo && !_txInfo.error) {
                tx.current = await signTx(_txInfo.tx);
                return { tx: tx.current };
            } else {
                console.log('Error', _txInfo);
                return null;
            }
        } catch (error) {
            console.log('Error', error);
            return null
        }
    }, [wallet]);

    const getUtxos = async (wallet, tokensLength) => {
        const amount = toLovelace(tokensLength * 5);
        const encode = cborEncode(cardanoRef.current, amount);
        const utxos = await wallet.api.getUtxos(encode);
        return utxos;
    };

    const getCollateral = async (wallet) => {
        const amount = toLovelace(5);
        const api = wallet.api.getCollateral ? wallet.api : wallet.api.experimental;
        const collaterals = await api.getCollateral(cborEncode(cardanoRef.current, amount));
        return collaterals;
    };


    const mintValue = useMemo(() => ({
        wallet,
        setWallet,
        buildTx,
        signTx,
    }), [wallet, setWallet, buildTx, signTx])

    async function loadCardano() {
        await Cardano.load();
        const instance = Cardano.instance;
        cardanoRef.current = instance;
    }

    useEffect(() => {
        loadCardano();
    }, []);

    const reactChild = useMemo(() => {
        const childrenComponent = Children.toArray(children);
        return childrenComponent[0];
    }, [])

    return (
        <MintContext.Provider value={mintValue}>
            {reactChild}
        </MintContext.Provider>
    )
}

export default Mint;