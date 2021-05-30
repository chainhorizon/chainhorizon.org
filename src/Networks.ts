interface Network {
    name: string;
    currency: string;
    rpc: string;
    blockExplorer?: string;
    mass: string;
}

export default {

    97: {
        rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        currency: "BNB",
        name: "Binance Smart Chain - Testnet",
        blockExplorer: "https://testnet.bscscan.com",
        mass: "0x66b8C28dC28CC3067d5451581F029ce7467713d0"
    },

    80001: {
        name: "Mumbai - Matic Testnet",
        currency: "MATIC",
        rpc: "https://rpc-mumbai.matic.today",
        blockExplorer: "https://explorer-mumbai.maticvigil.com",
        mass: "0xed2197401639713680C6099cF72B38b3249D562b"
    }

} as { [chainId: number]: Network };