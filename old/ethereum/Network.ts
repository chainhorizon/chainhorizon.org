import { ethers } from "ethers";
import EventContainer from "eventcontainer";
import NetworkManager from "./NetworkManager";

export default class Network extends EventContainer {

    public provider: ethers.providers.JsonRpcProvider;
    public signer: ethers.providers.JsonRpcSigner | undefined;

    constructor(rpc: string) {
        super();
        this.provider = new ethers.providers.JsonRpcProvider(rpc);
        this.initSigner();
    }

    public async initSigner() {
        this.signer = this.provider.getSigner(await NetworkManager.loadWalletAddress());
    }
}
