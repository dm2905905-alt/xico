// Reglas de seguridad de Firestore.
// - Cualquiera puede VER productos y creadores (es una tienda pública).
// - La cuenta administradora puede cambiar todo.
// - Cualquier persona con sesión puede abrir SU tienda (un documento en "creadores" con su uid),
//   pero no puede darse a sí misma la insignia de verificado, top vendedor ni calificaciones.
// - Cada creador solo puede crear, editar o borrar SUS productos, y no puede tocar
//   las ventas, reseñas ni calificaciones (esas las pone el sistema), ni volver a mostrar
//   un producto que la administración ocultó.
// - Cada usuario solo puede leer y escribir su propio documento (carrito y favoritos).
// - La dirección de recolección de cada tienda es privada: solo la ve y cambia su dueño.
// - Los pedidos solo los ven el comprador y los creadores que participan; nadie los cambia
//   desde el navegador (solo el servidor de XICO, después de verificar el pago).
// - Todo lo demás está cerrado.
export const reglasFirestore = (correoAdmin: string) => `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function esAdmin() {
      return request.auth != null
        && request.auth.token.email == "${correoAdmin}"
        && request.auth.token.email_verified == true;
    }

    function conSesion() {
      return request.auth != null;
    }

    // Moderadores (lista en config/equipo, la cambia solo la administración): aprueban tiendas
    // y moderan contenido, pero no ven datos privados ni dinero
    function esModerador() {
      return request.auth != null
        && request.auth.token.email_verified == true
        && exists(/databases/$(database)/documents/config/equipo)
        && request.auth.token.email.lower() in get(/databases/$(database)/documents/config/equipo).data.moderadores;
    }

    // ¿La tienda (creador) pertenece a quien hace la petición?
    function esDuenoDe(slugCreador) {
      return get(/databases/$(database)/documents/creadores/$(slugCreador)).data.uid == request.auth.uid;
    }

    function textoValido(t, min, max) {
      return t is string && t.size() >= min && t.size() <= max;
    }

    function productoValido(p) {
      return textoValido(p.nombre, 3, 120)
        && textoValido(p.descripcion, 10, 2000)
        && p.precio is number && p.precio > 0 && p.precio <= 200000
        && (!('precioAntes' in p) || (p.precioAntes is number && p.precioAntes > p.precio));
    }

    match /creadores/{creador} {
      allow read: if true;
      allow create: if esAdmin() || (conSesion()
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.slug == creador
        && textoValido(request.resource.data.taller, 2, 60)
        && request.resource.data.verificado == false
        && request.resource.data.top == false
        && request.resource.data.calificacion == 0
        && request.resource.data.resenas == 0
        && request.resource.data.estadoTienda == 'revision'
        // Los 3 meses gratis cuentan desde ahora: la fecha la pone el navegador, pero debe ser la de hoy
        && request.resource.data.solicitada is int
        && math.abs(request.resource.data.solicitada - request.time.toMillis()) < 600000
        && !('suscripcion' in request.resource.data)
        && !('destacado' in request.resource.data)
        && !('invitada' in request.resource.data));
      allow update: if esAdmin()
        || (esModerador() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['estadoTienda', 'verificado', 'top', 'destacado']))
        || (conSesion()
        && resource.data.uid == request.auth.uid
        && textoValido(request.resource.data.taller, 2, 60)
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['nombre', 'taller', 'estado', 'ciudad', 'especialidad', 'historia', 'colores', 'foto']));
      allow delete: if esAdmin();
    }

    match /productos/{producto} {
      allow read: if true;
      allow create: if esAdmin() || (conSesion()
        && request.resource.data.slug == producto
        && esDuenoDe(request.resource.data.creador)
        && productoValido(request.resource.data)
        && request.resource.data.vendidos == 0
        && request.resource.data.resenas == 0
        && request.resource.data.calificacion == 0
        && !('oculto' in request.resource.data));
      allow update: if esAdmin()
        || (esModerador() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['oculto', 'motivoOculto']))
        || (conSesion()
        && esDuenoDe(resource.data.creador)
        && productoValido(request.resource.data)
        && request.resource.data.creador == resource.data.creador
        && request.resource.data.slug == resource.data.slug
        && request.resource.data.vendidos == resource.data.vendidos
        && request.resource.data.resenas == resource.data.resenas
        && request.resource.data.calificacion == resource.data.calificacion
        && request.resource.data.get('oculto', false) == resource.data.get('oculto', false)
        && request.resource.data.get('motivoOculto', '') == resource.data.get('motivoOculto', ''));
      allow delete: if esAdmin() || (conSesion() && esDuenoDe(resource.data.creador));
    }

    // Videos de Descubre: subidos a XICO o enlace de YouTube, siempre de un producto de la misma tienda
    match /videos/{video} {
      allow read: if true;
      allow create: if conSesion()
        && request.resource.data.id == video
        && request.resource.data.creadorUid == request.auth.uid
        && esDuenoDe(request.resource.data.creador)
        && get(/databases/$(database)/documents/productos/$(request.resource.data.producto)).data.creador == request.resource.data.creador
        && textoValido(request.resource.data.titulo, 0, 100)
        && sinContacto(request.resource.data.titulo)
        && !('oculto' in request.resource.data)
        && ((request.resource.data.tipo == 'youtube'
              && request.resource.data.youtubeId.matches('^[A-Za-z0-9_-]{11}$'))
          || (request.resource.data.tipo == 'archivo'
              && request.resource.data.ruta.matches('^videos/' + request.resource.data.creador + '/[A-Za-z0-9-]+$')));
      // La tienda solo puede cambiar el texto; ocultar es de la administración
      allow update: if esAdmin()
        || (esModerador() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['oculto']))
        || (conSesion()
        && resource.data.creadorUid == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['titulo'])
        && textoValido(request.resource.data.titulo, 0, 100)
        && sinContacto(request.resource.data.titulo));
      allow delete: if esAdmin() || esModerador() || (conSesion() && resource.data.creadorUid == request.auth.uid);
    }

    match /tiendasPrivado/{creador} {
      allow read: if esAdmin() || (conSesion() && esDuenoDe(creador));
      // getAfter: la solicitud de vendedor crea la tienda y estos datos en el mismo lote
      allow create, update: if esAdmin() || (conSesion()
        && getAfter(/databases/$(database)/documents/creadores/$(creador)).data.uid == request.auth.uid
        && request.resource.data.keys().hasOnly(['direccion', 'pago', 'aceptoTerminos'])
        && (!('pago' in request.resource.data)
            || (request.resource.data.pago.clabe is string
                && request.resource.data.pago.clabe.matches('^[0-9]{18}$')
                && textoValido(request.resource.data.pago.titular, 5, 100))));
      allow delete: if esAdmin();
    }

    // Pagos de mensualidad: los crea el servidor; la tienda solo ve los suyos.
    // La administración puede registrar pagos hechos por otro medio (transferencia, efectivo).
    match /pagosSuscripcion/{pago} {
      allow read: if esAdmin() || (conSesion() && resource.data.uid == request.auth.uid);
      allow create: if esAdmin() && request.resource.data.metodo == 'manual';
      allow update, delete: if false;
    }

    // Reseñas: cualquiera las lee; solo el servidor las escribe (comprueba que la persona compró)
    match /resenas/{resena} {
      allow read: if true;
      allow write: if false;
    }

    // Avisos (campanita): cada quien ve y marca como leídos solo los suyos; los crea el servidor o la administración
    match /avisos/{aviso} {
      allow read, delete: if conSesion() && resource.data.uid == request.auth.uid;
      allow update: if conSesion() && resource.data.uid == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['leido']);
      allow create: if esAdmin() || (esModerador() && request.resource.data.tipo == 'tienda');
    }

    // Eventos y retos para vendedores: los ve cualquiera con sesión. La administración los crea y premia;
    // la moderación puede crearlos, cancelarlos y borrar los que no se premiaron, pero no entregar premios.
    match /eventos/{evento} {
      allow read: if conSesion();
      allow write: if esAdmin();
      allow create: if esModerador()
        && request.resource.data.estado == 'activo'
        && !('ganadores' in request.resource.data)
        && !('premiado' in request.resource.data);
      allow update: if esModerador()
        && resource.data.estado == 'activo'
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['estado'])
        && request.resource.data.estado == 'cancelado';
      allow delete: if esModerador() && resource.data.estado != 'premiado';
    }

    // Lista del equipo: solo la administración
    match /config/{documento} {
      allow read, write: if esAdmin();
    }

    match /pedidos/{pedido} {
      allow read: if esAdmin() || (conSesion() && request.auth.uid in resource.data.participantes);
      allow write: if false;
    }

    // Mensajes sin datos de contacto: 7+ dígitos seguidos (aunque tengan espacios o guiones),
    // correos o redes de mensajería. La página ya los oculta; esto evita saltársela.
    function sinContacto(t) {
      return !t.matches('(?s).*[0-9]([ ()._/-]{0,3}[0-9]){6}.*')
        && !t.matches('(?is).*[a-z0-9._%+-]+@[a-z0-9-]+[.][a-z]{2,}.*')
        && !t.matches('(?is).*(whats ?app|wa[.]me|instagram|telegram|facebook|tik ?tok).*');
    }

    function conversacion(id) {
      return get(/databases/$(database)/documents/conversaciones/$(id)).data;
    }

    // Chat comprador ↔ vendedor: solo lo ven y escriben sus dos participantes
    match /conversaciones/{c} {
      allow get: if esAdmin() || (conSesion() && (resource == null || request.auth.uid in resource.data.participantes));
      allow list: if esAdmin() || (conSesion() && request.auth.uid in resource.data.participantes);
      allow create: if conSesion()
        && request.resource.data.compradorUid == request.auth.uid
        && request.resource.data.creadorUid != request.auth.uid
        && c == request.auth.uid + '__' + request.resource.data.creador
        && request.resource.data.participantes == [request.auth.uid, request.resource.data.creadorUid]
        && get(/databases/$(database)/documents/creadores/$(request.resource.data.creador)).data.uid == request.resource.data.creadorUid;
      allow update: if conSesion() && request.auth.uid in resource.data.participantes
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['ultimo', 'actualizado', 'leido']);

      match /mensajes/{m} {
        allow read: if esAdmin() || (conSesion() && request.auth.uid in conversacion(c).participantes);
        allow create: if conSesion()
          && request.auth.uid in conversacion(c).participantes
          && request.resource.data.de == request.auth.uid
          && request.resource.data.tipo in ['texto', 'imagen', 'propuesta']
          && (!('texto' in request.resource.data)
              || (textoValido(request.resource.data.texto, 1, 1000) && sinContacto(request.resource.data.texto)))
          && (request.resource.data.tipo != 'propuesta' || conversacion(c).creadorUid == request.auth.uid);
      }
    }

    // Propuestas personalizadas: las crea el vendedor; el comprador solo puede rechazarlas.
    // El precio no se puede cambiar y "pagada" solo la marca el servidor al confirmar el pago.
    match /propuestas/{p} {
      allow read: if esAdmin() || (conSesion()
        && (request.auth.uid == resource.data.compradorUid || request.auth.uid == resource.data.creadorUid));
      allow create: if conSesion()
        && request.resource.data.id == p
        && request.resource.data.creadorUid == request.auth.uid
        && esDuenoDe(request.resource.data.creador)
        && conversacion(request.resource.data.conversacion).creadorUid == request.auth.uid
        && conversacion(request.resource.data.conversacion).compradorUid == request.resource.data.compradorUid
        && request.resource.data.estado == 'pendiente'
        && textoValido(request.resource.data.titulo, 3, 120)
        && sinContacto(request.resource.data.titulo)
        && request.resource.data.precio is number && request.resource.data.precio > 0 && request.resource.data.precio <= 200000;
      allow update: if conSesion() && resource.data.estado == 'pendiente'
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['estado'])
        && ((request.auth.uid == resource.data.compradorUid && request.resource.data.estado == 'rechazada')
            || (request.auth.uid == resource.data.creadorUid && request.resource.data.estado == 'cancelada'));
    }

    match /usuarios/{uid} {
      allow read, delete: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['carrito', 'favoritos', 'actualizado']);
    }
  }
}
`;

// Reglas de Firebase Storage (fotos).
// - Cualquiera puede VER las fotos de productos y de perfil (la tienda es pública).
// - Solo el dueño de la tienda (o la administración) puede subirlas o borrarlas.
// - Solo imágenes de hasta 6 MB. Todo lo demás está cerrado.
export const reglasStorage = (correoAdmin: string) => `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function esAdmin() {
      return request.auth != null
        && request.auth.token.email == "${correoAdmin}"
        && request.auth.token.email_verified == true;
    }

    // Consulta en la base de datos quién es el dueño de la tienda
    function esDueno(creador) {
      return request.auth != null
        && firestore.get(/databases/(default)/documents/creadores/$(creador)).data.uid == request.auth.uid;
    }

    function imagenValida() {
      return request.resource.size < 6 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    match /productos/{creador}/{archivo} {
      allow read: if true;
      allow create, update: if (esAdmin() || esDueno(creador)) && imagenValida();
      allow delete: if esAdmin() || esDueno(creador);
    }

    match /creadores/{creador}/{archivo} {
      allow read: if true;
      allow create, update: if (esAdmin() || esDueno(creador)) && imagenValida();
      allow delete: if esAdmin() || esDueno(creador);
    }

    // Videos de Descubre (máximo 60 MB) y su portada
    match /videos/{creador}/{archivo} {
      allow read: if true;
      allow create, update: if (esAdmin() || esDueno(creador))
        && ((request.resource.size < 60 * 1024 * 1024 && request.resource.contentType.matches('video/.*'))
          || imagenValida());
      allow delete: if esAdmin() || esDueno(creador);
    }

    // Fotos del chat (referencias del cliente y diseños de propuestas): solo los dos participantes
    match /chats/{conversacion}/{archivo} {
      allow read: if esAdmin() || (request.auth != null
        && request.auth.uid in firestore.get(/databases/(default)/documents/conversaciones/$(conversacion)).data.participantes);
      allow create: if request.auth != null
        && request.auth.uid in firestore.get(/databases/(default)/documents/conversaciones/$(conversacion)).data.participantes
        && imagenValida();
    }

    match /{todo=**} {
      allow read, write: if false;
    }
  }
}
`;
