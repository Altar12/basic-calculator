import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { BasicCalculator } from "../target/types/basic_calculator";
import { BN } from "@project-serum/anchor"
import { expect } from "chai"


describe("basic-calculator", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.BasicCalculator as Program<BasicCalculator>;
  const calculatorKeypair = anchor.web3.Keypair.generate()
  const calculatorAddress = calculatorKeypair.publicKey


  it("Calculator creation", async () => {
    const tx = await program.methods.create("My calculator :)")
                                    .accounts({
                                      calculator: calculatorAddress,
                                      user: program.provider.publicKey
                                    })
                                    .signers([calculatorKeypair])
                                    .rpc();
    console.log("Calculator creation transaction signature", tx);
    const account = await program.account.calculator.fetch(calculatorAddress);
    expect(account.greeting).to.eql("My calculator :)");
    expect(account.user).to.eql(program.provider.publicKey);
    expect(account.result.toNumber()).to.eql(0);
  });

  it("Addition", async () => {
    await program.methods.operate(new BN(20), new BN(45), { addition: {} })
                          .accounts({
                              calculator: calculatorAddress,
                              user: program.provider.publicKey
                            })
                            .rpc();
    const account = await program.account.calculator.fetch(calculatorAddress);
    expect(account.result.toNumber()).to.eql(65);
  });
  
  it("Subtraction", async () => {
    await program.methods.operate(new BN(35), new BN(40), { subtraction: {} })
                          .accounts({
                              calculator: calculatorAddress,
                              user: program.provider.publicKey
                            })
                            .rpc();
    const account = await program.account.calculator.fetch(calculatorAddress);
    expect(account.result.toNumber()).to.eql(-5);
  });

  it("Multiplication", async () => {
    await program.methods.operate(new BN(24), new BN(100), { multiplication: {} })
                          .accounts({
                              calculator: calculatorAddress,
                              user: program.provider.publicKey
                            })
                            .rpc();
    const account = await program.account.calculator.fetch(calculatorAddress);
    expect(account.result.toNumber()).to.eql(2400);
  });
  
  it("Division", async () => {
    await program.methods.operate(new BN(99), new BN(11), { division: {} })
                          .accounts({
                              calculator: calculatorAddress,
                              user: program.provider.publicKey
                            })
                            .rpc();
    const account = await program.account.calculator.fetch(calculatorAddress);
    expect(account.result.toNumber()).to.eql(9);
  });
  
  it("Mod", async () => {
    await program.methods.operate(new BN(100), new BN(9), { mod: {} })
                          .accounts({
                              calculator: calculatorAddress,
                              user: program.provider.publicKey
                            })
                            .rpc();
  const account = await program.account.calculator.fetch(calculatorAddress);
  expect(account.result.toNumber()).to.eql(1);
  });
  
  
});
