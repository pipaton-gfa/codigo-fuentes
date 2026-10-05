import pan from "../assets/pan.jpg";
import jamon from "../assets/jamon.jpg";
import queso from "../assets/queso.jpg";
import mantequilla from "../assets/mantequilla.jpg";
import jugo from "../assets/jugo.png";

export const TOKEN_VALUE_CLP = 5000;
export const JUICE_TOKEN_VALUE_CLP = 50;

export type Product = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  description: string;
  details: string[];
};

export const products: Product[] = [
  {
    id: "pan",
    name: "Pan",
    tagline: "",
    price: 8.9,
    image: pan,
    description: "",
    details: [],
  },
  {
    id: "jamon",
    name: "Jamón",
    tagline: "",
    price: 1.5,
    image: jamon,
    description: "",
    details: [],
  },
  {
    id: "queso",
    name: "Queso",
    tagline: "",
    price: 49,
    image: queso,
    description: "",
    details: [],
  },
  {
    id: "mantequilla",
    name: "Mantequilla",
    tagline: "",
    price: 6,
    image: mantequilla,
    description: "",
    details: [],
  },
  {
    id: "jugo",
    name: "Jugo",
    tagline: "",
    price: 3,
    image: jugo,
    description: "",
    details: [],
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const getTokenValue = (product: Pick<Product, "id">) =>
  product.id === "jugo" || product.id === "waniwani" ? JUICE_TOKEN_VALUE_CLP : TOKEN_VALUE_CLP;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
