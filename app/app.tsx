import {WalletProvider} from '@solana/wallet-adapter-react';
import {PropsWithChildren} from 'react';
import RpcContextProvider from '@/app/context/config';

export default function App({children}: PropsWithChildren) {
  return (
      <RpcContextProvider>
        <WalletProvider wallets={[]} autoConnect={true}>
          {children}
        </WalletProvider>
      </RpcContextProvider>
  );
}