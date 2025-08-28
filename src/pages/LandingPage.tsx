import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Server, 
  Shield, 
  Zap, 
  Clock, 
  CheckCircle, 
  Star,
  ArrowRight,
  Cpu,
  HardDrive,
  Wifi,
  HeadphonesIcon,
  TrendingUp,
  Mail,
  Phone
} from 'lucide-react';

const plans = [
  {
    name: "VPS Starter",
    price: "$9.99",
    period: "/mes",
    popular: false,
    features: [
      "1 vCPU Core",
      "2GB RAM",
      "50GB SSD",
      "2TB Bandwidth",
      "1 IP Dedicada",
      "Soporte 24/7"
    ]
  },
  {
    name: "VPS Professional", 
    price: "$19.99",
    period: "/mes",
    popular: true,
    features: [
      "2 vCPU Cores",
      "4GB RAM", 
      "100GB SSD",
      "4TB Bandwidth",
      "1 IP Dedicada",
      "Soporte Prioritario 24/7"
    ]
  },
  {
    name: "VPS Enterprise",
    price: "$39.99", 
    period: "/mes",
    popular: false,
    features: [
      "4 vCPU Cores",
      "8GB RAM",
      "200GB SSD",
      "8TB Bandwidth",
      "2 IPs Dedicadas",
      "Soporte Dedicado 24/7"
    ]
  }
];

const features = [
  {
    icon: Shield,
    title: "Seguridad Avanzada",
    description: "Protección DDoS, firewalls configurables y backups automáticos diarios."
  },
  {
    icon: Zap,
    title: "Alto Rendimiento",
    description: "Servidores con tecnología SSD NVMe y procesadores Intel Xeon de última generación."
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "Garantizamos máxima disponibilidad con infraestructura redundante y monitoreo 24/7."
  },
  {
    icon: HeadphonesIcon,
    title: "Soporte Experto",
    description: "Equipo técnico especializado disponible 24/7 en español e inglés."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Servicios VPS de
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Clase Mundial
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Potencia tu negocio con nuestra infraestructura VPS premium. 
            Rendimiento garantizado, soporte experto y precios competitivos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Comenzar Ahora
            </Link>
            <a
              href="#plans"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Ver Planes
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir TriExpert Services?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la mejor combinación de rendimiento, confiabilidad y soporte técnico especializado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes VPS Flexibles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde proyectos pequeños hasta aplicaciones empresariales. Encuentra el plan perfecto para tus necesidades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-blue-600">{plan.price}</span>
                    <span className="text-xl text-gray-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Elegir Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-blue-200">Clientes Satisfechos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200">Tiempo de Actividad</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Soporte Técnico</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5</div>
              <div className="text-blue-200">Años de Experiencia</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Sobre TriExpert Services
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Somos una empresa especializada en servicios de hosting y VPS con más de 5 años 
                de experiencia. Nuestro compromiso es brindar soluciones tecnológicas robustas 
                y escalables para empresas de todos los tamaños.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Con infraestructura distribuida en múltiples centros de datos y un equipo de 
                ingenieros altamente capacitados, garantizamos el mejor rendimiento y disponibilidad 
                para tus proyectos.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">4.9/5 basado en 1,200+ reseñas</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <Cpu className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">CPU Optimizado</h3>
                <p className="text-sm text-gray-600">Procesadores Intel Xeon de alta frecuencia</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <HardDrive className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">SSD NVMe</h3>
                <p className="text-sm text-gray-600">Almacenamiento ultrarrápido</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                <Wifi className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Red Premium</h3>
                <p className="text-sm text-gray-600">Conectividad de 1Gbps garantizada</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <Shield className="h-8 w-8 text-orange-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Protección DDoS</h3>
                <p className="text-sm text-gray-600">Mitigation automática incluida</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Tienes preguntas?
            </h2>
            <p className="text-xl text-gray-600">
              Nuestro equipo está listo para ayudarte a encontrar la solución perfecta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">soporte@triexpert.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Teléfono</div>
                    <div className="text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Envíanos un Mensaje</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Cuéntanos sobre tu proyecto..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}