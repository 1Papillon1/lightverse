// WalletModal.jsx
import { useRootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';
import { useAccount } from 'wagmi';
import { WalletAddress } from './WalletAddress';
import { WalletBalance } from './WalletBalance';
import { WalletConnectButton } from './WalletConnectButton';

const WalletModal = observer(() => {
  const rootStore = useRootStore();
  const { isConnected } = useAccount();

  return (
    <div className="wallet-modal">
      <h1>Wallet Information</h1>
      <WalletConnectButton />
      {isConnected ? (
        <>
          <WalletAddress />
          <WalletBalance />
        </>
      ) : (
        <p>Please connect your wallet to view details.</p>
      )}
    </div>
  );
});