import {Heading, IconButton, useThemeContext} from '@radix-ui/themes';
import {GitHubLogoIcon, MoonIcon, SunIcon} from '@radix-ui/react-icons';
import SelectWalletButton from '@/app/components/select-wallet-button';

const ICON_SIZE = 24;
export default function Navbar() {
  const theme = useThemeContext();
  const toggleAppereance = () => {
    theme.onAppearanceChange(theme.appearance === 'dark' ? "light" : "dark");
  };
  return (
      <nav className="flex w-full justify-between flex-wrap p-5 mx-auto"
           style={{boxSizing: "content-box"}}>
        <Heading size="4">IGDev tools 🛠️</Heading>
        <div className="flex justify-center items-center gap-4">
          <IconButton variant="ghost" size="3" color="gray">
            <GitHubLogoIcon width={ICON_SIZE} height={ICON_SIZE}/>
          </IconButton>
          <IconButton variant="ghost" onClick={toggleAppereance} size="4" color="gray">
            {theme.appearance === "light" ? <MoonIcon width={ICON_SIZE} height={ICON_SIZE}/> :
                <SunIcon width={ICON_SIZE} height={ICON_SIZE}/>}
          </IconButton>
          <SelectWalletButton/>
        </div>
      </nav>
  );
}