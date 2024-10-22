import React, { useEffect } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = ({ setAccount, account }) => {
  // Function to handle account disconnection or change
  const handleAccountChange = (accounts) => {
    if (accounts.length === 0) {
      // If no accounts, user is logged out, clear sessionStorage and set account to null
      sessionStorage.removeItem('userAccount');
      setAccount(null);
      console.log('User disconnected');
    } else {
      // If account is changed, update sessionStorage and state
      const newAccount = accounts[0];
      sessionStorage.setItem('userAccount', newAccount);
      setAccount(newAccount);
      console.log('Account changed:', newAccount);
    }
  };

  // Check if MetaMask is installed and set up listeners for account changes
  useEffect(() => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install it to use this feature.');
    } else {
      // Check if account is already in sessionStorage
      const savedAccount = sessionStorage.getItem('userAccount');
      if (savedAccount) {
        setAccount(savedAccount); // Set the account from sessionStorage
      }

      // Listen for account changes in MetaMask
      window.ethereum.on('accountsChanged', handleAccountChange);

      // Clean up listener on component unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      };
    }
  }, [setAccount]);

  // Function to connect to the user's wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum); // Initialize provider
        const accounts = await provider.send('eth_requestAccounts', []); // Request account access
        const userAccount = accounts[0];
        setAccount(userAccount); // Set the connected account
        sessionStorage.setItem('userAccount', userAccount); // Save account to sessionStorage
        console.log('Connected account:', userAccount);
      } catch (err) {
        console.error('Error connecting to wallet:', err);
      }
    } else {
      console.error('MetaMask not found');
    }
  };

  // Function to disconnect the wallet
  const disconnectWallet = () => {
    sessionStorage.removeItem('userAccount'); // Clear sessionStorage
    setAccount(null); // Set account to null
    console.log('User disconnected');
  };

  // Function to format wallet address
  const formatWalletAddress = (address) => {
    return `${address.substring(0, 7)}...${address.substring(address.length - 5)}`;
  };

  return (
    <>
      {/* Information text shown only when not logged in */}
      {!account && (
        <div>
          <p>
            To use the application, you need to be logged in with a Web3 wallet, such as MetaMask.
            <br />
            If you don’t have a wallet yet, you can easily create one by visiting{' '}
            <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
              https://metamask.io/
            </a>
          </p>
        </div>
      )}

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected wallet: {formatWalletAddress(account)}</p>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </div>
      )}
    </>
  );
};

export default ConnectWallet;
