import React from 'react';
import { Server, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Server className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">TriExpert Services</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Proveedor líder de servicios VPS con infraestructura de alta disponibilidad 
              y soporte técnico especializado 24/7. Tu hosting confiable desde 2020.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">VPS Linux</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">VPS Windows</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Hosting Web</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Dominios</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">SSL Certificates</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">soporte@triexpert.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">Miami, FL, USA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 TriExpert Services. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Términos de Servicio
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                SLA
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}