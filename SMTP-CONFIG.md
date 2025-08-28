# Configuración SMTP para Supabase

## 🔧 Configurar SMTP en Supabase

### 1. Acceder a la configuración
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ir a **Settings** → **Authentication**
3. Scroll down a **SMTP Settings**

### 2. Configuración recomendada

#### Gmail/Google Workspace:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: tu-email@gmail.com (o @tudominio.com)
SMTP Password: [App Password o contraseña]
Sender Name: TriExpert Services
Sender Email: noreply@triexpert.com
```

#### SendGrid:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Tu SendGrid API Key]
Sender Name: TriExpert Services
Sender Email: noreply@triexpert.com
```

#### Mailgun:
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Tu usuario Mailgun]
SMTP Password: [Tu password Mailgun]
Sender Name: TriExpert Services
Sender Email: noreply@triexpert.com
```

### 3. ⚠️ Para desarrollo temporal

Si necesitas desarrollar sin email confirmado:

1. **Deshabilitar email confirmation:**
   - En Supabase Dashboard → Authentication → Settings
   - Desactivar "Enable email confirmations"

2. **Habilitar Auto Confirm:**
   - En Supabase Dashboard → Authentication → Settings
   - Activar "Enable automatic confirmation"

### 4. 🧪 Probar configuración

Después de configurar SMTP:

1. Crear usuario de prueba desde la app
2. Verificar que llegue el email
3. Confirmar registro desde el email

### 5. 🔍 Troubleshooting

#### Error "SMTP configuration"
- Verificar credenciales SMTP
- Confirmar puerto (587 para TLS, 465 para SSL)
- Verificar que el sender email esté autorizado

#### Error "Rate limit"  
- Supabase limita emails por hora
- Esperar o contactar soporte para aumentar límite

#### Email no llega
- Verificar spam/junk folder
- Confirmar sender email configurado
- Verificar DNS si usas dominio personalizado

### 6. 🎯 Configuración de producción

Para producción, recomiendo:
- **SendGrid** o **Mailgun** para volumen alto
- **Dominio personalizado** con DNS configurado
- **Templates personalizados** para emails
- **Rate limits apropiados** para tu uso

### 7. 📧 Templates de email

Puedes personalizar los templates en:
Supabase Dashboard → Authentication → Templates

- **Confirm signup**: Email de confirmación
- **Invite user**: Email de invitación  
- **Magic link**: Email de login automático
- **Recovery**: Email de recuperación de contraseña