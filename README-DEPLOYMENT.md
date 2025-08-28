# TriExpert Services - Despliegue con Docker

## 🚀 Despliegue en EasyPanel

### Prerrequisitos
- Cuenta en EasyPanel
- Repositorio en GitHub/GitLab
- Credenciales de Supabase configuradas

### Pasos para desplegar:

#### 1. Preparar el repositorio
```bash
# Subir el código a tu repositorio
git add .
git commit -m "Preparar para despliegue en EasyPanel"
git push origin main
```

#### 2. Configurar en EasyPanel
1. Crear nueva aplicación en EasyPanel
2. Conectar con tu repositorio GitHub
3. Usar el archivo `easypanel.yml` como configuración
4. Configurar las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PROXMOX_HOST`
   - `VITE_PROXMOX_USERNAME`
   - `VITE_PROXMOX_PASSWORD`
   - `VITE_N8N_WEBHOOK_URL`
   - `VITE_N8N_API_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

#### 3. Dominio personalizado
- Configurar DNS para apuntar a EasyPanel
- SSL automático con Let's Encrypt

---

## 🐳 Despliegue Local con Docker

### Desarrollo
```bash
# Construir y ejecutar
npm run docker:compose

# Solo construir imagen
npm run docker:build

# Ejecutar imagen construida
npm run docker:run
```

### Producción
```bash
# Con variables de entorno
npm run docker:prod

# O manualmente
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 Variables de Entorno Requeridas

```env
VITE_SUPABASE_URL=https://postgres.triexpertservice.com
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PROXMOX_HOST=https://your-proxmox-server:8006
VITE_PROXMOX_USERNAME=root@pam
VITE_PROXMOX_PASSWORD=your_password
VITE_N8N_WEBHOOK_URL=https://n8n.example.com/webhook
VITE_N8N_API_KEY=your_n8n_api_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

---

## 🔍 Verificación

Después del despliegue, verifica:

1. **Health Check**: `https://tu-dominio.com/health`
2. **Landing Page**: `https://tu-dominio.com/`
3. **Login**: `https://tu-dominio.com/login`

---

## 🛠️ Troubleshooting

### Problemas comunes:

1. **Build fails**: Verificar que todas las dependencias estén en package.json
2. **Variables de entorno**: Asegurarse de que todas las variables VITE_ estén configuradas
3. **Rutas no funcionan**: Nginx está configurado para manejar SPA routing
4. **Base de datos**: Verificar conectividad con Supabase

### Logs:
```bash
# Ver logs del contenedor
docker logs triexpert-services-prod

# Logs en tiempo real
docker logs -f triexpert-services-prod
```

---

## 📈 Monitoreo

- **Health endpoint**: `/health`
- **Métricas**: Disponibles en EasyPanel dashboard
- **Logs**: Centralizados en EasyPanel