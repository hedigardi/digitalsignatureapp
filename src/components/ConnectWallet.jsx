import React, { useEffect } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = ({ setAccount }) => {
  // Check if MetaMask is installed
  useEffect(() => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  }, []);

  // Function to connect to the user's wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum); // Initialize provider
        const accounts = await provider.send('eth_requestAccounts', []); // Request account access
        setAccount(accounts[0]); // Set the connected account
        console.log('Connected account:', accounts[0]);
      } catch (err) {
        console.error('Error connecting to wallet:', err);
      }
    } else {
      console.error('MetaMask not found');
    }
  };

  return (
    <button onClick={connectWallet}>
      Connect Wallet
    </button>
  );
};

export default ConnectWallet;
