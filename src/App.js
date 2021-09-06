import * as React from "react";
import { ethers } from "ethers";
import dotenv from 'dotenv'

import abi from "./utils/HeroicStory.json"

import { Spinner } from "./components/Spinner";

dotenv.config()

export default function App() {
  
  // State updated by listeners
  const [currentAccount, setCurrentAccount] = React.useState('');
  const [loading, setLoading] = React.useState(false)
  
  // User input
  const [URI, setURI] = React.useState("");
  const [nftDerviedFrom, setNftDerivedFrom] = React.useState("");
  const [nftDerivedFromId, setNftDerivedFromId] = React.useState(0);

  // Contract variables
  const contractAddress = "0x08fE631a040E98e13463fA3A263C14D420bB0123"
  const contractABI = abi;

  // Initialize listeners and check if already connected to Metamask.
  React.useEffect(() => {

    if(typeof window.ethereum !== undefined) {

      const { ethereum } = window;
      
      // Check if already connected with metamask
      ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if(!!accounts.length) {
            const account = accounts[0];
            setCurrentAccount(account);
          }
        })      

      // Initialize listeners

      ethereum.on("chainChanged", (chainId) => {
        // Only Rinkeby
        if(chainId != 4) {
          alert("Please switch to the Rinkeby network to use the webapp.");
        }
      })

      ethereum.on("accountsChanged", (accounts) => {

        if(accounts.length == 0) {
          setCurrentAccount('')
        } else {
          const account = accounts[0];
          setCurrentAccount(account);
        }        
      })
    }

  }, [])

  // Connect to metamask
  async function connectToMetamask() {
    const { ethereum } = window;

    if(!ethereum) {
      alert("Please install Metamask to continue using the webapp.");
    }

    setLoading(true)

    ethereum.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log(accounts[0])
        setLoading(false)
      })
      .catch(err => alert(
        err.message
      ));
  }
  
  async function mintNFT() {
    if(typeof window.ethereum !== undefined) {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const heroicStoryContract = new ethers.Contract(contractAddress, contractABI, signer);

      setLoading(true);

      try {

        const tx = await heroicStoryContract.mintTo(contractAddress, URI, nftDerviedFrom, nftDerivedFromId, { gasLimit: 300000 });
        alert(`You can view your transaction at https://rinkeby.etherscan.io/tx/${tx.hash}`)

        await tx.wait()

        setNftDerivedFrom("")
        setNftDerivedFromId(0);
        setURI("");

      } catch(err) {
        alert(err.message)
      }

      setLoading(false)
    }
  }

  const waveButtonActive = !!currentAccount
  
  return (
    <div className="m-auto flex justify-center my-4" style={{maxWidth: "800px"}}>
      <div className="flex flex-col">

        <p className="text-5xl text-center font-black text-gray-900 py-8">
          Let's bring writers to web3 🤝
        </p>

        <span className="text-xl text-center font-light text-gray-700 py-4">
          For reference, here's a notion doc that gives a walkthrough of everything - 
          <a 
            href="https://intriguing-workshop-53c.notion.site/Heroic-Story-flow-walkthrough-ca312b7bba1742ef940e22f9dfd42f5a" 
            target="blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            {" "}doc.
          </a> 
        </span>

        <span className="text-xl text-center font-light text-gray-700 py-4">
          The relevant OpenSea (RINKEBY) collection lives here -
          <a 
            href="https://testnets.opensea.io/collection/heroic-story" 
            target="blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            {" "}collection.
          </a> 
        </span>

        <p className="text-xl text-center font-light text-gray-700 py-4">
          This app is built for RINKEBY testnet. If you need rinkeby ETH, ping me on Discord. I'll switch the app to MAINNET once we've done 
          test runs with the Rinkeby contract. 
        </p>

        <div className="m-auto">
          {!currentAccount
            ? (
              <button onClick={connectToMetamask} className="border border-black p-4">
                Connect to Metamask
              </button>
            )

            : (
              <div className="flex flex-col justify-center">
                
                <label htmlFor="metadata-uri">
                  Paste the metadata URI here.
                </label>
                <input 
                  id="metadata-uri" 
                  value={URI} 
                  placeholder="e.g. ipfs://QmTKoG37ATZeUbpx1XREPGMNXcLMAAr2ZFJt5zA3qByjVE/" 
                  onChange={e => setURI(e.target.value)}
                  className="border p-4 w-96 verflow-scroll mb-4"  
                />

                <label htmlFor="derived-project-name">
                  Address of the project where the name came from.
                </label>
                <input 
                  id="derived-project-name" 
                  value={nftDerviedFrom} 
                  placeholder="e.g. Loot contract address."
                  onChange={e => setNftDerivedFrom(e.target.value)}
                  className="border p-4 w-96 overflow-scroll overflow-x-visible mb-4"  
                />

                <label htmlFor="derived-project-id">
                  Token Id of the NFT where the name came from.
                </label>
                <input 
                  id="derived-project-id" 
                  value={nftDerivedFromId} 
                  placeholder="e.g. 0" 
                  onChange={e => setNftDerivedFromId(e.target.value)}
                  className="border p-4 w-96 overflow-scroll overflow-x-visible mb-4"
                />

                <button
                  disabled={!waveButtonActive}
                  className={`p-2 border ${!waveButtonActive ? "border-gray-300 text-gray-300" : "border-black"}`}
                  onClick={mintNFT}
                >
                  {loading && (
                    <div className="m-auto flex justify-center">
                      <Spinner
                        color={"black"}
                        style={{ height: "25%", marginLeft: "-1rem" }}
                      />
                    </div>
                  )}

                  {!loading && (
                    <p>
                      Mint NFT
                    </p>
                  )}
                </button>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
