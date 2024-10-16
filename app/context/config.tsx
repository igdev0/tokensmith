'use client';
import {createContext, useMemo, useState} from 'react';
import {clusterApiUrl, Connection} from '@solana/web3.js';

export type RpcChain = 'devnet' | 'testnet' | 'mainnet-beta';
export type ExplorerClusterName = 'devnet' | 'mainnet-beta' | 'testnet';

export interface RpcConfigContextType {
  chain: RpcChain;
  displayName: string,
  setChain: (chain: RpcChain) => void,
  connection: Connection,
}

const DEFAULT_CONFIG: RpcConfigContextType = Object.freeze({
  chain: "devnet",
  setChain: (chain) => {
  },
  connection: new Connection(clusterApiUrl("mainnet-beta")),
  displayName: "Devnet"
});

interface RpcDisplayNames {
  [name: RpcChain]: string;
}

const RPC_NAMES: RpcDisplayNames = {
  'devnet': "Devnet",
  'testnet': "Testnet",
  'mainnet-beta': "Mainnet"
};

export const RpcConfigContext = createContext<RpcConfigContextType>(DEFAULT_CONFIG);
export default function RpcContextProvider({children}) {
  const [chain, setChain] = useState<RpcChain>('devnet');
  const rest = useMemo<Omit<RpcConfigContextType, "setChain">>(() => {
    return {
      connection: new Connection(clusterApiUrl(chain, true)),
      displayName: RPC_NAMES[chain],
      chain
    };
  }, [chain]);

  return (
      <RpcConfigContext.Provider value={{chain, setChain, ...rest}}>
  {children}
  </RpcConfigContext.Provider>
);
}