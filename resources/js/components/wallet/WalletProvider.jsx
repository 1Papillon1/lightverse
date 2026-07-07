import { useRootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';
import { WagmiProvider, http } from 'wagmi';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, polygon, optimism, arbitrum, sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

const chains = [mainnet, polygon, optimism, arbitrum, sepolia];

const config = getDefaultConfig({
  appName: import.meta.env.VITE_APP_NAME,
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECTID,
  chains,
  ssr: false,
});

const queryClient = new QueryClient();

export default function WalletProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            accentColor: '#7a6ff0', // $color-secondary
            accentColorForeground: '#e0e0e0', // $color-text
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}