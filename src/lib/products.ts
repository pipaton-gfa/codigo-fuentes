import ikunoRina from "../assets/ikuno-rina.png";
import donggeuran from "../assets/donggeuran.png";
import niinaHayashi from "../assets/niina-hayashi.png";
import omoriMaho from "../assets/omori-maho.png";
import waniwani from "../assets/waniwani.png";

export const TOKEN_VALUE_CLP = 5000;
export const WANIWANI_TOKEN_VALUE_CLP = 50;

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
    id: "ikuno-rina",
    name: "ikuno rina",
    tagline: "",
    price: 8.9,
    image: ikunoRina,
    description: "",
    details: [],
  },
  {
    id: "donggeuran",
    name: "Donggeuran",
    tagline: "",
    price: 1.5,
    image: donggeuran,
    description: "",
    details: [],
  },
  {
    id: "niina-hayashi",
    name: "Niina Hayashi",
    tagline: "",
    price: 49,
    image: niinaHayashi,
    description: "",
    details: [],
  },
  {
    id: "omori-maho",
    name: "omori maho",
    tagline: "",
    price: 6,
    image: omoriMaho,
    description: "",
    details: [],
  },
  {
    id: "waniwani",
    name: "waniwani",
    tagline: "",
    price: 3,
    image: waniwani,
    description: "",
    details: [],
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const getTokenValue = (product: Pick<Product, "id">) =>
  product.id === "waniwani" ? WANIWANI_TOKEN_VALUE_CLP : TOKEN_VALUE_CLP;

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
