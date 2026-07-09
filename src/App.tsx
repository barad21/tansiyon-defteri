import { MainScreen } from './components/MainScreen';
import { DesktopOnlyGuard } from './components/DesktopOnlyGuard';
import './styles/global.css';

function App() {
  return (
    <DesktopOnlyGuard>
      <MainScreen />
    </DesktopOnlyGuard>
  );
}

export default App;
