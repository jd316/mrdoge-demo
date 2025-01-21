import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { NETWORK_CONFIG } from '../config';

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [networkStatus, setNetworkStatus] = useState({
    isConnected: false,
    chainId: null,
    isInitializing: true
  });
  const [web3Modal, setWeb3Modal] = useState(null);
  const isConnecting = useRef(false);

  // Initialize Web3Modal
  useEffect(() => {
    let mounted = true;

    const initializeWeb3Modal = async () => {
      try {
        console.log('Initializing Web3Modal...');
        const modal = new Web3Modal({
          cacheProvider: true,
          providerOptions: {},
          network: "polygon_amoy"
        });

        if (mounted) {
          setWeb3Modal(modal);
          setNetworkStatus(prev => ({ ...prev, isInitializing: false }));
          console.log('Web3Modal initialized');
        }
      } catch (error) {
        console.error('Failed to initialize Web3Modal:', error);
      }
    };

    initializeWeb3Modal();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      setAddress('');
      setSigner(null);
      setNetworkStatus(prev => ({ 
        ...prev, 
        isConnected: false 
      }));
    } else if (accounts[0] !== address) {
      console.log('Account changed:', accounts[0]);
      setAddress(accounts[0]);
    }
  }, [address]);

  // Handle chain changes
  const handleChainChanged = useCallback(async (chainId) => {
    console.log('Network changed to:', chainId);
    setNetworkStatus(prev => ({ ...prev, chainId }));
    
    // Refresh provider and signer on chain change
    if (web3Modal?.cachedProvider && !isConnecting.current) {
      await connectWallet();
    }
  }, [web3Modal]);

  const connectWallet = useCallback(async () => {
    if (!web3Modal || isConnecting.current) return;
    
    try {
      isConnecting.current = true;
      console.log('Connecting wallet...');
      
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      console.log('Connected to wallet:', { address, chainId: network.chainId });
      
      setProvider(provider);
      setSigner(signer);
      setAddress(address);
      setNetworkStatus({
        isConnected: true,
        chainId: network.chainId,
        isInitializing: false
      });

      // Add network if not already added
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
        console.log('Network added or already exists');
      } catch (error) {
        console.error('Failed to add network:', error);
      }

    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      isConnecting.current = false;
    }
  }, [web3Modal]);

  // Auto connect if cached provider exists
  useEffect(() => {
    if (web3Modal?.cachedProvider && !networkStatus.isConnected && !networkStatus.isInitializing && !isConnecting.current) {
      connectWallet();
    }
  }, [web3Modal, networkStatus.isConnected, networkStatus.isInitializing, connectWallet]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (provider?.provider?.removeAllListeners) {
        provider.provider.removeAllListeners();
      }
    };
  }, [provider]);

  return {
    provider,
    signer,
    address,
    networkStatus,
    connectWallet,
    isReady: !networkStatus.isInitializing && !isConnecting.current
  };
}