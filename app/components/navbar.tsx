import {IconButton, useThemeContext} from '@radix-ui/themes';
import {GitHubLogoIcon, MoonIcon, SunIcon} from '@radix-ui/react-icons';
import SelectWalletButton from '@/app/components/select-wallet-button';
import Link from 'next/link';
import Logo from '@/app/components/logo';
import NetworkSelector from '@/app/components/network-selector';

const ICON_SIZE = 24;

export default function Navbar() {
  const theme = useThemeContext();
  const toggleAppereance = () => {
    theme.onAppearanceChange(theme.appearance === 'dark' ? "light" : "dark");
  };
  return (
      <nav className="flex w-full justify-between flex-wrap p-5 mx-auto"
           style={{boxSizing: "content-box"}}>
        <Logo/>
        <div className="flex justify-center items-center gap-4">
          <IconButton asChild={true} variant="ghost" size="4" color="gray">
            <Link
                target="_blank" rel="_noopener"
                href="https://github.com/igdev0/solana-token-creator">
              <GitHubLogoIcon width={ICON_SIZE} height={ICON_SIZE}/>
            </Link>
          </IconButton>
          <IconButton variant="ghost" onClick={toggleAppereance} size="4" color="gray">
            {theme.appearance === "light" ? <MoonIcon width={ICON_SIZE} height={ICON_SIZE}/> :
                <SunIcon width={ICON_SIZE} height={ICON_SIZE}/>}
          </IconButton>
          <NetworkSelector/>
          <SelectWalletButton/>
        </div>
      </nav>
  );
}