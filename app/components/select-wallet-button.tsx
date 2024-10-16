import * as Dialog from '@radix-ui/react-dialog';
import {forwardRef, useImperativeHandle, useState} from 'react';
import {Button, ButtonProps, Flex, Theme} from '@radix-ui/themes';
import {useWallet, Wallet} from '@solana/wallet-adapter-react';
import {truncatePubKey} from '@/app/utils';
import {CloseIcon} from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import {PublicKey} from '@solana/web3.js';

export default forwardRef(function SelectWalletButton(props: ButtonProps, ref) {
  const [open, setOpen] = useState(false);
  const wallet = useWallet();

  const handleConnectWallet = (item: Wallet) => {
    return () => {
      wallet.select(item.adapter.name);
      if (wallet?.signIn) {
        wallet?.signIn();
      }
      setOpen(false);
    };
  };

  useImperativeHandle(ref, () => ({
    getWalletPublicKey(): PublicKey | null {
      return wallet.publicKey;
    }
  }));

  return (
      <Dialog.Root open={open} onOpenChange={setOpen} modal={true}>
        {
          wallet.publicKey ? (
              <Button size="4" variant="solid" onClick={event => event.preventDefault()}
                      disabled={props.disabled ?? false}>
                {truncatePubKey(wallet.publicKey.toString())}
                <div className="cursor-pointer" onClick={wallet.disconnect}><CloseIcon/></div>
              </Button>
          ) : (
              <Dialog.Trigger>
                <Button size="4" variant="solid">Connect wallet</Button>
              </Dialog.Trigger>
          )
        }

        <Dialog.Portal>
          <Theme>
            <Dialog.Overlay className="fixed dark:bg-overlay-dark left-0 right-0 bottom-0 top-0 flex items-center">
              <Dialog.Content
                  className="max-w-lg w-full dark:bg-black dark:bg-black p-4 rounded-l-lg mx-auto relative shadow-2xl">
                <Dialog.Title className="font-semibold">
                  Choose wallet
                </Dialog.Title>
                <Dialog.Description>
                  <p>Please choose a wallet to continue</p>
                </Dialog.Description>
                <Dialog.Trigger className="absolute top-0.5 right-0.5">
                  <CloseIcon/>
                </Dialog.Trigger>
                <Flex className="gap-2 flex-col mt-2">
                  {
                    wallet.wallets.map((item, idx) => (
                        <Button className="gap-2 w-full cursor-pointer" key={idx} onClick={handleConnectWallet(item)}>
                          <img src={item.adapter.icon} width={20}
                               height={20}
                               alt="Wallet icon"/> {item.adapter.name}
                        </Button>
                    ))
                  }
                </Flex>
              </Dialog.Content>
            </Dialog.Overlay>
          </Theme>
        </Dialog.Portal>
      </Dialog.Root>
  );
});