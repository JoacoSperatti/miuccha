import { useNavigate } from "react-router-dom";

const CategoryGrid = () => {
  const navigate = useNavigate();
  const categories = [
    {
      id: 1,
      name: "TEXANAS",
      img: "/texanas.jpg",
      link: "/catalogo?cat=TEXANAS",
    },
    { id: 2, name: "BOTAS", img: "/botas.jpg", link: "/catalogo?cat=BOTAS" },
    {
      id: 3,
      name: "BORCEGOS",
      img: "/borcegos.jpg",
      link: "/catalogo?cat=BORCEGOS",
    },
    {
      id: 4,
      name: "DISCONTINUOS",
      img: "/discontinuos.jpg",
      link: "/catalogo?cat=DISCONTINUOS",
    },
  ];
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 w-full shadow-2xl border-t-2 border-white">
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => {
            navigate(cat.link);
            window.scrollTo(0, 0);
          }}
          className="group relative flex items-center justify-between p-10 cursor-pointer border-2 border-white bg-[#F3ECE7] h-[250px] md:h-[300px] overflow-hidden transition-all"
        >
          <img
            src={cat.img}
            className="w-1/2 h-full object-contain transition-transform duration-500 group-hover:-translate-x-3 z-10"
            alt={cat.name}
          />
          <h3 className="font-sans text-2xl md:text-3xl lg:text-4xl text-black uppercase z-10 tracking-[0.2em] font-bold text-right leading-none">
            {cat.name}
          </h3>
        </div>
      ))}
    </section>
  );
};

export default CategoryGrid;
