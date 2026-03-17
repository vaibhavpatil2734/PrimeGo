import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/admin/ProductForm";

export default function CreateProduct() {
  const navigate = useNavigate();

  return (
    <ProductForm 
      onSuccess={() => navigate("/admin/products")}
    />
  );
}
