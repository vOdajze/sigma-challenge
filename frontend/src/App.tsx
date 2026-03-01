import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Produtos from "@/pages/Produtos";
import Caixa from "@/pages/Caixa";
import Mapa from "@/pages/Mapa";
import PrivateRoute from "@/components/layout/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route element={<PrivateRoute />}>
          <Route
            path="/produtos"
            element={<Produtos />}
          />
          <Route
            path="/caixa"
            element={<Caixa />}
          />
          <Route
            path="/mapa"
            element={<Mapa />}
          />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
