import { useCart } from "react-use-cart";
import ProductItem from '../components/ProductItem';

import { products } from '../lib/common/data';

// import './Home.css';

const Home = ({addDetailsItem}) => {
  const { addItem } = useCart();

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-12">
        {products.map(product => {
          return <ProductItem product={product} key={product.id} addToCart={addItem} addDetailsItem={addDetailsItem} />
        })}
      </div>
      <p id="collect"></p>
    </div>
  );
}

export default Home;