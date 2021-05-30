import { BigNumber, ethers } from "ethers";
import EventContainer from "eventcontainer";
import Networks from "./Networks";
import Wallet from "./Wallet";

export default class Mass extends EventContainer {
    private static readonly ABI = require("./MassABI.json");

    private provider: ethers.providers.JsonRpcProvider;
    private signer: ethers.providers.JsonRpcSigner;
    private contract: ethers.Contract;

    constructor(private chainId: number) {
        super();

        const network = Networks[chainId];
        this.provider = new ethers.providers.JsonRpcProvider(network.rpc);
        this.signer = this.provider.getSigner(ethers.constants.AddressZero);
        this.contract = new ethers.Contract(network.mass, Mass.ABI, this.provider).connect(this.signer);

        for (const eventName of [
            "Transfer",
            "Approval",
            "Burn",
            "Mint",
        ]) {
            this.contract.on(eventName, (...args) => this.fireEvent(eventName, ...args));
        }
    }

    public async balanceOf(owner: string): Promise<BigNumber> {
        return await this.contract.balanceOf(owner);
    }

    private walletContract: ethers.Contract | undefined;

    public async loadWalletContract() {
        if (await Wallet.loadChainId() !== this.chainId) {
            await Wallet.changeNetwork(this.chainId);
            this.walletContract = Wallet.createContract(Networks[this.chainId].mass, Mass.ABI);
        } else if (this.walletContract === undefined) {
            this.walletContract = Wallet.createContract(Networks[this.chainId].mass, Mass.ABI);
        }
        return this.walletContract;
    }

    public async testMint(amount: BigNumber) {
        await (await this.loadWalletContract())?.testMint(amount);
    }

    public async burn(toChain: BigNumber, amount: BigNumber): Promise<BigNumber | undefined> {
        const contract = await this.loadWalletContract();
        if (contract !== undefined) {
            const result = await contract.burn(toChain, amount);
            return result.value;
        }
    }

    public async mint(fromChain: BigNumber, burnId: BigNumber, amount: BigNumber, signature: string): Promise<void> {
        await (await this.loadWalletContract())?.mint(fromChain, burnId, amount, signature);
    }
}
