import { Routes, Route } from "react-router-dom";
import { HomePage } from "./HomePage";
import { ProductsPage } from "./ProductsPage";
import { CategoriesPage } from "./CategoriesPage";
import { ConfigPage } from "./ConfigPage";

const App = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="products/new" element={<ProductsPage mode="create" />} />
      <Route path="products/:id" element={<ProductsPage mode="edit" />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="config" element={<ConfigPage />} />
    </Routes>
  );
};

export default App;
