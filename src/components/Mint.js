import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import MintContext from "../MintContext";
import Cardano from "../serialization";
import { cborDecode, cborEncode, getAddress, getSignersCollateral, getSignersUtxos, rebuildTx, toLovelace } from "../utils";

function Mint({ children }) {
    const [wallet, setCurrentWallet] = useState(null);
    const [txInfo, setTxInfo] = useState({ tx: '' });
    const cardanoRef = useRef(null);

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
        return rebuildTx(cardanoRef.current, tx, signature)
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
                const tx = await signTx(_txInfo.tx);
                return tx;
            } else {
                console.log('Error', _txInfo);
                return '';
            }
        } catch (error) {
            console.log('Error', error);
            return '';
        }
    }, [wallet]);

    const createScript = useCallback(async (label, network, signers) => {
        try {
            const response = await fetch('http://localhost:8000/createScript', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    label,
                    network,
                    signers: signers.map(s => s.address)
                }),
            });
            const script = await response.json();
            return script;
        } catch (error) {
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
        txInfo,
        setWallet,
        setTxInfo,
        buildTx,
        signTx,
        createScript
    }), [wallet, txInfo, setWallet, setTxInfo, buildTx, signTx, createScript])

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