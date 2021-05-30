import { ethers } from "ethers";
import EventContainer from "eventcontainer";
import Networks from "../Networks";
import Network from "./Network";

class NetworkManager extends EventContainer {

    private networks: { [chainid: number]: Network } = {};

    public getNetwork(chainid: number) {
        if (this.networks[chainid] !== undefined) {
            return this.networks[chainid];
        }
        else if (Networks[chainid] !== undefined) {
            return this.networks[chainid] = new Network(Networks[chainid].rpc);
        }
    }

    private ethereum: any = (window as any).ethereum;
    public get existsWalletProvider() { return this.ethereum !== undefined; }

    public walletProvider: ethers.providers.Web3Provider | undefined;
    public walletSigner: ethers.providers.JsonRpcSigner | undefined;

    constructor() {
        super();
        if (this.existsWalletProvider === true) {
            this.initWalletProvider();
            this.ethereum.on("chainChanged", () => this.initWalletProvider());
            this.ethereum.on("accountsChanged", () => this.initSigners());
        }
    }

    private initWalletProvider() {
        if (this.existsWalletProvider === true) {
            this.walletProvider = new ethers.providers.Web3Provider(this.ethereum);
            this.initSigners();
        }
    }

    public async loadWalletAddress() {
        return this.walletProvider === undefined ? undefined : (await this.walletProvider.listAccounts())[0];
    }

    public async connectToWallet() {
        await this.ethereum.request({ method: "eth_requestAccounts" });
    }

    public async initSigners() {
        const address = await this.loadWalletAddress();
        if (address !== undefined) {
            this.walletSigner = this.walletProvider!.getSigner();
            for (const network of Object.values(this.networks)) {
                network.initSigner();
            }
            return true;
        }
        return false;
    }

    public async changeWalletNetwork(chainid: number) {
        const network = Networks[chainid];
        if (network !== undefined) {
            await this.ethereum.request({
                method: "wallet_addEthereumChain", params: [{
                    chainId: ethers.utils.hexlify(chainid),
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
        }
    }
}

export default new NetworkManager();
