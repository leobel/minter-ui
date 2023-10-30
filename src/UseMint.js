import { useContext } from "react";
import MintContext from "./MintContext";

const useMint = () => {
    const context = useContext(MintContext);
    return context;
}

export default useMint;