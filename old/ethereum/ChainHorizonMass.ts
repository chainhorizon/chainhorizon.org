import { BigNumber } from "@ethersproject/bignumber";
import SmartContract from "./SmartContract";

export default class ChainHorizonMass extends SmartContract {

    public name = "Chain Horizon Mass";
    public symbol = "MASS";
    public decimals = 18;

    constructor(chainid: number, address: string) {
        super(chainid, address, require("./ChainHorizonMassABI.json"), [
            "Transfer",
            "Approval",
            "Burn",
            "Mint",
        ]);
    }

    public async getTotalSupply(): Promise<BigNumber> { return await this.contract.totalSupply(); }

    public async balanceOf(owner: string): Promise<BigNumber> {
        return await this.contract.balanceOf(owner);
    }

    public async transfer(to: string, amount: BigNumber): Promise<boolean> {
        return await this.walletContract.transfer(to, amount);
    }

    public async transferFrom(from: string, to: string, amount: BigNumber): Promise<boolean> {
        return await this.walletContract.transferFrom(from, to, amount);
    }

    public async approve(spender: string, amount: BigNumber): Promise<boolean> {
        return await this.walletContract.approve(spender, amount);
    }

    public async allowance(owner: string, spender: string): Promise<BigNumber> {
        return await this.walletContract.allowance(owner, spender);
    }

    public async burn(toChain: BigNumber, amount: BigNumber): Promise<BigNumber> {
        return await this.walletContract.burn(toChain, amount);
    }

    public async getBurnAmount(toChain: BigNumber, burnId: BigNumber): Promise<BigNumber> { return await this.contract.burned(this.network.walletAddress, toChain, burnId); }
    public async getBurnCount(toChain: BigNumber): Promise<BigNumber> { return await this.contract.burnCount(toChain); }

    public async mint(fromChain: BigNumber, burnId: BigNumber, amount: BigNumber, signature: string): Promise<void> {
        await this.walletContract.mint(fromChain, burnId, amount, signature);
    }

    public async checkMinted(fromChain: BigNumber, burnId: BigNumber): Promise<boolean> { return await this.contract.checkMinted(fromChain, burnId); }
}
