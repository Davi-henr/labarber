import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, MapPin, Loader2, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  tempo_duracao_minutos: number;
}

interface Barbeiro {
  id: string;
  nome: string;
  foto_url?: string;
}

interface PortfolioItem {
  id: string;
  imagem_url: string;
  legenda?: string;
}

interface BarbeariaInfo {
  barbearia: {
    id: string;
    nome: string;
    logo_url: string | null;
    cor_primaria: string | null;
    endereco: string | null;
    historia_texto: string | null;
  };
  servicos: Servico[];
  barbeiros: Barbeiro[];
  portfolio: PortfolioItem[];
}

export function LandingPage() {
  const { barbearia_id } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState<BarbeariaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`http://localhost:3333/chatbot/${barbearia_id}/info`);
        if (!response.ok) throw new Error('Falha ao buscar dados');
        const data = await response.json();
        setInfo(data);
      } catch (error) {
        toast.error('Erro ao carregar barbearia');
      } finally {
        setLoading(false);
      }
    }

    if (barbearia_id) {
      loadData();
    }
  }, [barbearia_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Carregando...</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <Scissors className="w-16 h-16 text-gray-700 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Barbearia não encontrada</h1>
      </div>
    );
  }

  const { barbearia, barbeiros, portfolio } = info;
  const logoSrc = barbearia.logo_url ? `http://localhost:3333${barbearia.logo_url}` : null;
  // const themeColor = barbearia.cor_primaria || '#EAB308'; // default para yellow-500

  const handleAgendar = () => {
    navigate(`/b/${barbearia_id}/agendar`);
  };

  const scrollTo = (id: string) => {
    setIsMenuOpen(false); // fechar menu mobile ao clicar
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      
      {/* 1. Navegação Superior */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('inicio')}>
             {logoSrc ? (
                <img src={logoSrc} alt="Logo" className="h-10 object-contain" />
             ) : (
                <Scissors className="text-yellow-500" size={24} />
             )}
             {!logoSrc && <span className="font-black tracking-widest text-lg uppercase truncate max-w-[150px] md:max-w-none">{barbearia.nome}</span>}
          </div>
          
          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-widest uppercase text-gray-300">
            <li><button onClick={() => scrollTo('inicio')} className="hover:text-yellow-500 transition-colors">Início</button></li>
            {barbearia.historia_texto && <li><button onClick={() => scrollTo('sobre')} className="hover:text-yellow-500 transition-colors">Sobre Nós</button></li>}
            {barbeiros.length > 0 && <li><button onClick={() => scrollTo('equipe')} className="hover:text-yellow-500 transition-colors">Equipe</button></li>}
            {portfolio.length > 0 && <li><button onClick={() => scrollTo('portfolio')} className="hover:text-yellow-500 transition-colors">Portfólio</button></li>}
          </ul>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white hover:text-yellow-500 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-black/95 backdrop-blur-xl border-b border-white/10"
            >
              <ul className="flex flex-col items-center py-6 gap-6 text-sm font-bold tracking-widest uppercase text-gray-300">
                <li><button onClick={() => scrollTo('inicio')} className="hover:text-yellow-500 transition-colors">Início</button></li>
                {barbearia.historia_texto && <li><button onClick={() => scrollTo('sobre')} className="hover:text-yellow-500 transition-colors">Sobre Nós</button></li>}
                {barbeiros.length > 0 && <li><button onClick={() => scrollTo('equipe')} className="hover:text-yellow-500 transition-colors">Equipe</button></li>}
                {portfolio.length > 0 && <li><button onClick={() => scrollTo('portfolio')} className="hover:text-yellow-500 transition-colors">Portfólio</button></li>}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Section */}
      <section id="inicio" className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Override */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074')] bg-cover bg-center bg-fixed bg-no-repeat opacity-40" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-[#050505]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-20">
          
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-10 w-full flex justify-center"
          >
            {logoSrc ? (
              <img 
                src={logoSrc} 
                alt={barbearia.nome} 
                className="w-auto h-32 md:h-48 object-contain"
              />
            ) : (
              <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase">
                {barbearia.nome}
              </h1>
            )}
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <button
              onClick={handleAgendar}
              className="bg-yellow-500 text-black font-extrabold uppercase tracking-widest px-10 py-4 rounded-sm shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:shadow-[0_0_40px_rgba(234,179,8,0.9)] hover:scale-105 transition-all duration-300"
            >
              Agendar Agora
            </button>
          </motion.div>

        </div>
      </section>

      {/* 3. Sobre Nós */}
      {barbearia.historia_texto && (
        <section id="sobre" className="py-32 px-6 relative bg-[#050505]">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-sm font-bold tracking-[0.3em] text-yellow-500 uppercase mb-8">Nossa História</h2>
            <div className="border-l-4 border-yellow-500 pl-6">
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
                {barbearia.historia_texto}
              </p>
            </div>
          </motion.div>
        </section>
      )}

      {/* 4. Nossa Equipe */}
      {barbeiros.length > 0 && (
        <section id="equipe" className="py-32 px-6 relative bg-black/40 border-y border-white/5">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-16">
              <h2 className="text-sm font-bold tracking-[0.3em] text-yellow-500 uppercase mb-2">Mestres da Barbearia</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Nossa Equipe</h3>
            </div>

            <div className="w-full py-10 relative">
              <Swiper
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                loop={true}
                coverflowEffect={{
                  rotate: 30,
                  stretch: -20,
                  depth: 250,
                  modifier: 1,
                  slideShadows: true,
                }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="w-full"
              >
                {barbeiros.map((barbeiro) => (
                  <SwiperSlide key={barbeiro.id} className="!w-[220px] sm:!w-[260px] md:!w-[300px] transition-transform duration-300 group">
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 shadow-2xl">
                      {barbeiro.foto_url ? (
                        <img 
                          src={`http://localhost:3333${barbeiro.foto_url}`} 
                          alt={barbeiro.nome} 
                          className="w-full h-[320px] md:h-[400px] object-cover rounded-2xl shadow-xl grayscale group-[.swiper-slide-active]:grayscale-0 transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-[320px] md:h-[400px] flex flex-col items-center justify-center text-gray-700 bg-[#111] rounded-2xl shadow-xl">
                          <Scissors size={48} className="mb-4 opacity-50" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-[.swiper-slide-active]:opacity-100 transition-all duration-500 translate-y-4 group-[.swiper-slide-active]:translate-y-0 text-center">
                        <span className="text-xs font-bold text-yellow-500 tracking-[0.3em] uppercase mb-1 block">Especialista</span>
                        <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">{barbeiro.nome}</h4>
                        <div className="w-12 h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 mx-auto mt-3 rounded-full"></div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.div>
        </section>
      )}

      {/* 5. Portfólio */}
      {portfolio.length > 0 && (
        <section id="portfolio" className="py-32 px-6 relative bg-[#050505]">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="mb-16">
              <h2 className="text-sm font-bold tracking-[0.3em] text-yellow-500 uppercase mb-2">Nosso Trabalho</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Galeria</h3>
            </div>

            <div className="w-full py-10 relative">
              <Swiper
                effect={'coverflow'}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={'auto'}
                loop={true}
                coverflowEffect={{
                  rotate: 30,
                  stretch: -20,
                  depth: 250,
                  modifier: 1,
                  slideShadows: true,
                }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{ clickable: true, dynamicBullets: true }}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="w-full"
              >
                {portfolio.map((item) => (
                  <SwiperSlide key={item.id} className="!w-[220px] sm:!w-[260px] md:!w-[300px] transition-transform duration-300 group">
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 shadow-2xl">
                      <img 
                        src={`http://localhost:3333${item.imagem_url}`} 
                        alt={item.legenda || 'Corte'} 
                        className="w-full h-[320px] md:h-[400px] object-cover rounded-2xl shadow-xl grayscale group-[.swiper-slide-active]:grayscale-0 transition-all duration-700"
                      />
                      
                      {item.legenda && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-[.swiper-slide-active]:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 md:p-8">
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <Scissors className="w-6 h-6 text-yellow-500 mb-3 opacity-80" />
                            <p className="text-xl md:text-3xl font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">{item.legenda}</p>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10 bg-black text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {logoSrc ? (
            <img src={logoSrc} alt="Logo" className="h-16 object-contain mb-8 opacity-50 grayscale hover:grayscale-0 transition-all" />
          ) : (
            <Scissors className="w-10 h-10 text-gray-700 mb-8" />
          )}
          
          {barbearia.endereco && (
            <div className="flex items-center justify-center gap-3 text-gray-400 mb-8">
              <MapPin size={20} className="text-yellow-500" />
              <p className="text-sm tracking-wide">{barbearia.endereco}</p>
            </div>
          )}
          
          <p className="text-xs text-gray-600 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} {barbearia.nome}. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Botão Flutuante (Tesoura) */}
      <motion.button
        onClick={handleAgendar}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 p-4 md:p-5 bg-yellow-500 text-black rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] focus:outline-none hover:bg-yellow-400"
        title="Agendar Horário"
      >
        <Scissors size={28} />
      </motion.button>
    </div>
  );
}
