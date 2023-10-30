import { Children, useMemo, useState } from "react";
import MintContext from "../MintContext";

function Mint({ children }) {
    const [wallet, setWallet] = useState(null);
    const mintValue = useMemo(() => ({
            wallet,
            setWallet
        }),
        [wallet, setWallet]
    )
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