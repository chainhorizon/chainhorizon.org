import { BigNumber, ethers } from "ethers";
import EventContainer from "eventcontainer";
import Networks from "./Networks";

class Wallet extends EventContainer {

    private ethereum = (window as any).ethereum;
    public get existsProvider() { return this.ethereum !== undefined; }
    public provider: ethers.providers.Web3Provider | undefined;
    public signer: ethers.providers.JsonRpcSigner | undefined;

    private chainChangeResolve: ((value: unknown) => void) | undefined;

    constructor() {
        super();
        if (this.existsProvider === true) {
            this.provider = new ethers.providers.Web3Provider(this.ethereum);
            this.signer = this.provider.getSigner();
            this.ethereum.on("chainChanged", () => {
                this.provider = new ethers.providers.Web3Provider(this.ethereum);
                this.signer = this.provider.getSigner();
                if (this.chainChangeResolve !== undefined) {
                    this.chainChangeResolve(undefined);
                    this.chainChangeResolve = undefined;
                }
            });
        }
    }

    public async loadAddress() {
        return this.provider === undefined ? undefined : (await this.provider.listAccounts())[0];
    }

    public async loadChainId() {
        const network = await this.provider?.getNetwork();
        return network?.chainId;
    }

    public async connected() {
        return await this.loadAddress() !== undefined;
    }

    public async connect() {
        await this.ethereum.request({ method: "eth_requestAccounts" });
    }

    public async changeNetwork(chainId: number) {
        const network = Networks[chainId];
        if (network !== undefined) {
            await this.ethereum.request({
                method: "wallet_addEthereumChain", params: [{
                    chainId: `0x${chainId.toString(16)}`,
                    chainName: network.name,
                    nativeCurrency: {
                        name: network.currency,
                        symbol: network.currency,
                        decimals: 18,
                    },
                    rpcUrls: [network.rpc],
                    blockExplorerUrls: network.blockExplorer === undefined ? undefined : [network.blockExplorer],
                }],
            });
            return new Promise((resolve) => {
                this.chainChangeResolve = resolve;
            });
        }
    }

    public createContract(address: string, api: string) {
        if (this.signer !== undefined) {
            return new ethers.Contract(address, api, this.provider).connect(this.signer);
        }
    }

    public async signForTest(fromChain: BigNumber, burnId: BigNumber, amount: BigNumber) {
        const address = await this.loadAddress();
        if (address !== undefined) {
            const wallet = new ethers.Wallet("017d5cd5ff3c39fb4d5d097de139dfdb510d9851c711af9e90b9688afb53d791");
            const messageHash = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "uint256"], [address, fromChain, burnId, amount]);
            const messageHashBinary = ethers.utils.arrayify(messageHash);
            return await wallet.signMessage(messageHashBinary);
        }
    }
}

export default new Wallet();
