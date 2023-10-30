import * as CBOR from "cbor-js";

export function strToBuffer(hexString) {
    // ensure even number of characters
    if (hexString.length % 2 != 0) {
       
    }

    // check for some non-hex characters
    var bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
        throw new Error('ERROR: found non-hex characters');
    }

    // split the string into pairs of octets
    var pairs = hexString.match(/[\dA-F]{2}/gi);

    if (!pairs) {
        throw new Error("ERROR: invalid hex pairs");
    }
    // convert the octets to integers
    var integers = pairs.map(function (s) {
        return parseInt(s, 16);
    });

    return new Uint8Array(integers);
}

export function bufferToStr(buffer) {
    return Array.from(buffer).map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

export function cborDecode(value) {
    const data = strToBuffer(value);
    return CBOR.decode(data.buffer);
}

export function cborEncodeV2(amount) {
    const data = CBOR.encode(amount);
    return bufferToStr(data);
}

export function cborEncode(CardanoWasm, amount) {
    if (Array.isArray(amount)) { // format [ada, assets]
        const [ada, assets] = amount;
        return CardanoWasm.Value.from_json(JSON.stringify({
            coin: Number(ada).toString(),
            multiasset: Object.entries(assets).reduce((dict, [policy_id, tokens]) => ({...dict, [policy_id]: Object.entries(tokens).reduce((d, [asset_name, quantity]) => ({...d, [asset_name]: quantity.toString()}), {})}), {})
        })).to_hex();
    } else {
        return CardanoWasm.Value.new(toBigNum(CardanoWasm, amount)).to_hex();
    }
}

export function getAddress(CardanoWasm, hex) {
    return CardanoWasm.Address.from_bytes(
        fromHex(hex)
      ).to_bech32()
}

export const fromHex = (hex) => Buffer?.from(hex, "hex");

export function toBigNum(Cardano, quantity) {
    return Cardano.BigNum.from_str(quantity.toString());
}