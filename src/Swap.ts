import { DomNode, el } from "@hanul/skynode";
import { BigNumber, ethers } from "ethers";
import Mass from "./Mass";
import Networks from "./Networks";
import Wallet from "./Wallet";

export default class Swap extends DomNode {

    private fromChainSelect: DomNode<HTMLSelectElement>;
    private fromChainBalance: DomNode;

    private toChainSelect: DomNode<HTMLSelectElement>;
    private toChainBalance: DomNode;

    private proceedButton: DomNode;
    private proceedButtonHandler = () => { };
    private history: DomNode;

    private fromChain: number = 0;
    private toChain: number = 0;

    private fromChainMass: Mass | undefined;
    private toChainMass: Mass | undefined;

    constructor() {
        super("#swap");

        const chainids = Object.keys(Networks);
        this.fromChain = parseInt(chainids[0], 10);
        this.toChain = parseInt(chainids[1], 10);

        this.append(
            el(".from",
                el(".panel",
                    this.fromChainSelect = el("select", {
                        change: () => {
                            const origin = this.fromChain;
                            this.fromChain = parseInt(this.fromChainSelect.domElement.value, 10);
                            if (this.toChain === this.fromChain) {
                                this.toChain = origin;
                            }
                            this.createOptions();
                        },
                    }),
                    this.fromChainBalance = el(".balance", "Loading..."),
                ),
            ),
            el(".horizon",
                el("img.wlogo", { src: "/images/wlogo.png" }),
                el("img.arrow", { src: "/images/arrow.png" }),
                this.proceedButton = el("a.button"),
                this.history = el(".history"),
            ),
            el(".to",
                el(".panel",
                    this.toChainSelect = el("select", {
                        change: () => {
                            const origin = this.toChain;
                            this.toChain = parseInt(this.toChainSelect.domElement.value, 10);
                            if (this.fromChain === this.toChain) {
                                this.fromChain = origin;
                            }
                            this.createOptions();
                        },
                    }),
                    this.toChainBalance = el(".balance", "Loading..."),
                ),
            ),
        );

        this.createOptions();
        this.initWallet();
    }

    private createOptions() {

        this.fromChainSelect.empty();
        this.toChainSelect.empty();

        for (const [chainid, network] of Object.entries(Networks)) {
            this.fromChainSelect.append(el("option", network.name, { value: chainid }));
            this.toChainSelect.append(el("option", network.name, { value: chainid }));
        }

        this.fromChainSelect.domElement.value = String(this.fromChain);
        this.toChainSelect.domElement.value = String(this.toChain);

        this.fromChainMass?.delete();
        this.fromChainMass = new Mass(this.fromChain);
        this.fromChainMass.on("Transfer", async (from, to) => {
            const walletAddress = await Wallet.loadAddress();
            if (walletAddress !== undefined && (from === walletAddress || to === walletAddress)) {
                this.loadFromBalance(walletAddress);
            }
        });

        this.toChainMass?.delete();
        this.toChainMass = new Mass(this.toChain);
        this.toChainMass.on("Transfer", async (from, to) => {
            const walletAddress = await Wallet.loadAddress();
            if (walletAddress !== undefined && (from === walletAddress || to === walletAddress)) {
                this.loadToBalance(walletAddress);
            }
        });

        this.loadBalance();
    }

    private async initWallet() {

        this.proceedButton.empty().appendText("Loading...");
        this.proceedButton.off("click", this.proceedButtonHandler);

        if (Wallet.existsProvider !== true) {
            this.proceedButton.empty().appendText("Provider Not Found");
        }

        else if (await Wallet.connected() !== true) {
            this.proceedButton.empty().appendText("Unlock Wallet");
            this.proceedButton.on("click", this.proceedButtonHandler = async () => {
                await Wallet.connect();
                this.initWallet();
            });
        }

        else {
            this.proceedButton.empty().appendText("Transfer");
            this.proceedButton.on("click", this.proceedButtonHandler = async () => {
                const amount = prompt("Please enter the amount to transfer.");
                if (amount !== null) {
                    const burnId = await this.fromChainMass?.burn(BigNumber.from(this.toChain), ethers.utils.parseEther(amount));
                    if (burnId !== undefined) {

                        // for test
                        const signature = await Wallet.signForTest(BigNumber.from(this.fromChain), burnId, ethers.utils.parseEther(amount));
                        if (signature !== undefined) {
                            this.toChainMass?.mint(BigNumber.from(this.fromChain), burnId, ethers.utils.parseEther(amount), signature);
                        }
                    }
                }
            });
        }

        this.loadBalance();
    }

    private async loadFromBalance(walletAddress: string) {
        if (this.fromChainMass !== undefined) {

            const fromBalance = await this.fromChainMass.balanceOf(walletAddress);
            this.fromChainBalance.empty().appendText(`${ethers.utils.formatUnits(fromBalance)} MASS`);

            // for test
            this.fromChainBalance.append(el("a.test-mint-button", "Test Mint", {
                click: async () => {
                    const amount = prompt("Please enter the amount to mint.");
                    if (amount !== null) {
                        await this.fromChainMass?.testMint(ethers.utils.parseEther(amount));
                    }
                },
            }));
        }
    }

    private async loadToBalance(walletAddress: string) {
        if (this.toChainMass !== undefined) {

            const toBalance = await this.toChainMass.balanceOf(walletAddress);
            this.toChainBalance.empty().appendText(`${ethers.utils.formatUnits(toBalance)} MASS`);

            // for test
            this.toChainBalance.append(el("a.test-mint-button", "Test Mint", {
                click: async () => {
                    const amount = prompt("Please enter the amount to mint.");
                    if (amount !== null) {
                        await this.toChainMass?.testMint(ethers.utils.parseEther(amount));
                    }
                },
            }));
        }
    }

    private async loadBalance() {
        const walletAddress = await Wallet.loadAddress();
        if (walletAddress !== undefined) {
            this.loadFromBalance(walletAddress);
            this.loadToBalance(walletAddress);
        }
    }

    public delete() {
        this.fromChainMass?.delete();
        this.toChainMass?.delete();
        super.delete();
    }
}
