import * as Select from "@radix-ui/react-select";
import {Button, Theme} from '@radix-ui/themes';
import {useCallback, useContext} from 'react';
import {RpcChain, RpcConfigContext} from '@/app/context/config';
import {GlobeIcon} from '@radix-ui/react-icons';

const VALUES = {
  "mainnet-beta": "Mainnet Beta",
  "devnet": "Devnet",
  "testnet": "Testnet",
};

export default function NetworkSelector() {
  const config = useContext(RpcConfigContext);
  const handleValueChange = useCallback((v: RpcChain) => {
    config.setChain(v);
  }, [config]);

  return (
      <Select.Root dir="ltr" value={config.chain} onValueChange={handleValueChange}>
        <Theme>
          <Select.Trigger variant="surface" asChild>
            <Button className="cursor-pointer" size="4"><GlobeIcon/>{VALUES[config.chain]}<Select.Icon/></Button>
          </Select.Trigger>
          <Select.Content className="bg-gray-950 p-2 shadow-2xl shadow-purple-500 mt-2 rounded-lg">
            {
              Object.keys(VALUES).map((item) => (
                  <Select.Item key={item}
                               className={`cursor-pointer hover:text-purple-300 ${item === config.chain ? "text-purple-300" : "text-white"}`}
                               value={item}>{VALUES[item]}</Select.Item>
              ))
            }
          </Select.Content>
        </Theme>
      </Select.Root>
  );
}