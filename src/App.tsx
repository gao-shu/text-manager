import { AppProvider } from "./context/AppContext";
import { MainLayout } from "./components/MainLayout";

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
