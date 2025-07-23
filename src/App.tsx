import { useCallback, useEffect, useState } from "react";
import cx from "classnames";

type Product = {
  id: string;
  name: string;
  type: string;
  price: number;
  amount: number;
};

type ProductsResponse = {
  products: Product[];
};

function formatNumberToUSD(number: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [inputPrice, setInputPrice] = useState<number>(0);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(-1);
  const [change, setChange] = useState<number>(0);
  const [balance, setBalance] = useState<number>(100);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/api");
      const json = (await res.json()) as ProductsResponse;
      setProducts(json.products);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const purchaseProduct = useCallback(() => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === products[selectedProductIndex].id
          ? { ...item, amount: item.amount > 0 ? item.amount - 1 : 0 }
          : item,
      ),
    );
    setChange(
      (prev) => prev + (inputPrice - products[selectedProductIndex].price),
    );

    setBalance((prev) =>
      prev <= 0 ? prev : prev - products[selectedProductIndex].price,
    );
  }, [selectedProductIndex, products, inputPrice]);

  const reset = () => {
    setInputPrice(0);
    setSelectedProductIndex(-1);
    setSelectedProductId("");
  };

  const setCurrentIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSelectedProductIndex(
      products.findIndex((item) => item.id === e.target.value),
    );
    setSelectedProductId(e.target.value);
  };

  if (isLoading) {
    return;
  }
  return (
    <>
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-3xl font-bold text-center">Vending Machine</h1>
      </header>
      <main className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <section className="flex-1 bg-white p-6 rounded-lg shadow">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products?.map((product) => (
              <li
                className={cx(
                  "border border-solid",
                  "bg-white p-4 rounded-lg shadow",
                  inputPrice * 100 >= product.price * 100
                    ? "border-blue-500"
                    : "border-gray-400",
                  products[selectedProductIndex]?.id === product.id
                    ? "border-green-400"
                    : "",
                )}
                key={product.id}
              >
                <div className="block">{product.name}</div>
                <div className="block">
                  <span>ID: </span>
                  {product.id}
                </div>
                <div className="block">
                  <span>Amount: </span>
                  {product.amount}
                </div>
                <div className="block">
                  <span>Price: </span>
                  {formatNumberToUSD(product.price)}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <aside className="flex flex-col md:w-1/3 bg-gray-200 p-6 rounded-lg shadow">
          <div className="flex flex-col h-full">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="currency"
            >
              Input currency (USD):
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
              id="currency"
              step="0.10"
              min="0"
              max={balance + change}
              required
              value={inputPrice}
              onChange={(e) => setInputPrice(parseFloat(e.target.value))}
              name="coins"
            />
            <label
              className="block text-sm font-medium text-gray-700 mb-2 mt-3"
              htmlFor="coins"
            >
              Product ID:
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900 placeholder-gray-400"
              disabled={inputPrice <= 0}
              value={selectedProductId}
              onChange={setCurrentIndex}
              required
              list="itemList"
            />
            <datalist id="itemList">
              {products
                .filter((p) => p.price <= inputPrice)
                .map((p) => (
                  <option key={p.id}>{p.id}</option>
                ))}
            </datalist>
          </div>
          <div className="flex flex-row self-end gap-2">
            <button
              disabled={
                !products[selectedProductIndex] ||
                products[selectedProductIndex].price > inputPrice ||
                products[selectedProductIndex].amount <= 0
              }
              onClick={() => purchaseProduct()}
              className="px-6 self-start py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Buy
            </button>
            <button
              onClick={reset}
              className="px-6 self-start py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              Reset
            </button>
            <div className="flex self-center flex-col text-xs xl:flex-row">
              <span>
                Available balance:{" "}
                <strong>{formatNumberToUSD(balance)}</strong>{" "}
              </span>
              <span>
                Accumulated change: <strong>{formatNumberToUSD(change)}</strong>
              </span>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}

export default App;
