import Web3 from "web3";
import ganache from "ganache-cli"

export function getWeb3(rpcUrl: string) {
  return new Web3(ganache.provider())
}