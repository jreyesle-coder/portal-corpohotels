# Registro del CMS en Entra ID (desarrollo)

Guía para conectar el inicio de sesión del gestor de contenidos (CMS) con las cuentas institucionales de Microsoft de CORPHOTELS, con verificación en dos pasos obligatoria (NORTIC A2 5.05.o, A8 3.01.3).

Mientras no se complete, el CMS funciona en local con el **simulador de Entra** de Docker. En producción (S8), el proveedor crea un registro igual con la dirección del panel en Azure.

**Quién lo hace:** una persona con rol de **Administrador de aplicaciones** o **Administrador global** en Entra ID. Toma unos 20 minutos.

**Requisito:** licencia Microsoft Entra ID P1 (incluida en Microsoft 365 E3, E5 o Business Premium), necesaria para el acceso condicional que exige el doble factor.

## 1. Registrar la aplicación

1. Entre a https://entra.microsoft.com con su cuenta de administrador.
2. En el menú izquierdo: **Entra ID** → **Registros de aplicaciones** → **+ Nuevo registro**.
3. Complete:
   - **Nombre:** `CMS Portal CORPHOTELS (desarrollo)`
   - **Tipos de cuenta compatibles:** *Solo las cuentas de este directorio organizativo (inquilino único)*.
   - **URI de redirección:** plataforma **Web**, dirección `http://localhost:3004/auth/entra/retorno`
4. Pulse **Registrar**.
5. En la pantalla **Información general**, copie dos valores:
   - **Id. de aplicación (cliente)**
   - **Id. de directorio (inquilino)**

## 2. Crear el secreto de la aplicación

1. En la aplicación: **Certificados y secretos** → **Secretos de cliente** → **+ Nuevo secreto de cliente**.
2. Descripción `desarrollo local`, vencimiento **180 días** → **Agregar**.
3. Copie de inmediato la columna **Valor**: no se vuelve a mostrar.

> El secreto no se envía por correo ni por chat. Se escribe directamente en el archivo `.env` (paso 6).

## 3. Crear los cinco roles del CMS

1. En la aplicación: **Roles de aplicación** → **+ Crear rol de aplicación**.
2. Cree estos cinco roles. En cada uno, **Tipos de miembros permitidos:** *Usuarios/grupos* y casilla *¿Quiere habilitar este rol de aplicación?* marcada:

| Nombre para mostrar | Valor | Descripción |
| --- | --- | --- |
| Editor | `Editor` | Redacta y guarda borradores; no publica |
| Publicador | `Publicador` | Aprueba y publica contenido |
| OAI | `OAI` | Gestiona documentos de transparencia |
| Administrador | `Administrador` | Menús y acceso de usuarios al CMS |
| Auditor | `Auditor` | Solo lectura, incluida la bitácora |

El **Valor** debe escribirse exactamente igual. El CMS solo deja entrar a quien tenga al menos uno de estos roles.

## 4. Asignar personas a los roles

1. Menú izquierdo: **Entra ID** → **Aplicaciones empresariales** → busque `CMS Portal CORPHOTELS (desarrollo)`.
2. **Propiedades** → **¿Asignación requerida?** = **Sí** → **Guardar**.
3. **Usuarios y grupos** → **+ Agregar usuario o grupo** → elija la persona y su rol → **Asignar**.

## 5. Exigir verificación en dos pasos (acceso condicional)

1. Menú izquierdo: **Protección** → **Acceso condicional** → **Contexto de autenticación** → **+ Nuevo contexto de autenticación**.
   - **Nombre:** `CMS CORPHOTELS`, **Identificador:** `c1`, marque **Publicar en aplicaciones** → **Guardar**.
2. **Directivas** → **+ Nueva directiva**:
   - **Nombre:** `CMS CORPHOTELS – exigir MFA`
   - **Usuarios:** *Todos los usuarios*.
   - **Recursos de destino:** elija **Contexto de autenticación** → `CMS CORPHOTELS (c1)`.
   - **Conceder:** *Conceder acceso* → *Requerir autenticación multifactor* → **Seleccionar**.
   - **Habilitar directiva:** **Activado** → **Crear**.

## 6. Escribir los valores en el `.env`

En la PC de desarrollo, abra con el Bloc de notas el archivo `C:\Users\usuario\portal-corphotels\.env` y reemplace estas cuatro líneas con los valores copiados:

```
OIDC_ISSUER=https://login.microsoftonline.com/<Id. de directorio (inquilino)>/v2.0
OIDC_CLIENT_ID=<Id. de aplicación (cliente)>
OIDC_CLIENT_SECRET=<Valor del secreto>
OIDC_VERIFICACION_MFA=acrs:c1
```

Guarde el archivo y avise para reiniciar el servidor y hacer la prueba con una cuenta real.

## Cómo se protege el acceso

- No existen usuario ni contraseña locales en el CMS: la única puerta es Entra ID.
- El CMS rechaza a quien llegue sin doble factor o sin uno de los cinco roles, y lo registra en la bitácora.
- Desactivar a una persona en Entra ID, o quitarle el acceso en el CMS (campo *Acceso activo*), le cierra la sesión de inmediato.
