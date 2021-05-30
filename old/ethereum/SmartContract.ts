import { ethers } from "ethers";
import EventContainer from "eventcontainer";
import Network from "./Network";
import NetworkManager from "./NetworkManager";

export default abstract class SmartContract extends EventContainer {

    protected network: Network | undefined;
    protected contract: ethers.Contract | undefined;
    protected walletContract: ethers.Contract | undefined;

    constructor(chainid: number, private address: string, private abi: any, eventNames: string[]) {
        super();
        this.network = NetworkManager.getNetwork(chainid);

        if (this.network?.signer !== undefined) {
            this.contract = new ethers.Contract(this.address, this.abi, this.network.provider).connect(this.network.signer);
            for (const eventName of eventNames) {
                this.contract.on(eventName, (...args) => this.fireEvent(eventName, ...args));
            }
        }

        if (NetworkManager.walletProvider !== undefined && NetworkManager.walletSigner !== undefined) {
            this.walletContract = new ethers.Contract(this.address, this.abi, NetworkManager.walletProvider).connect(NetworkManager.walletSigner);
        }
    }
}
