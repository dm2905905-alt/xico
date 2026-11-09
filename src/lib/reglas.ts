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
        && request.resource.data.resenas == 0);
      allow update: if esAdmin() || (conSesion()
        && resource.data.uid == request.auth.uid
        && textoValido(request.resource.data.taller, 2, 60)
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['nombre', 'taller', 'estado', 'ciudad', 'especialidad', 'historia', 'colores']));
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
      allow update: if esAdmin() || (conSesion()
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

    match /tiendasPrivado/{creador} {
      allow read: if esAdmin() || (conSesion() && esDuenoDe(creador));
      allow create, update: if esAdmin() || (conSesion() && esDuenoDe(creador)
        && request.resource.data.keys().hasOnly(['direccion']));
      allow delete: if esAdmin();
    }

    match /pedidos/{pedido} {
      allow read: if esAdmin() || (conSesion() && request.auth.uid in resource.data.participantes);
      allow write: if false;
    }

    match /usuarios/{uid} {
      allow read, delete: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['carrito', 'favoritos', 'actualizado']);
    }
  }
}
`;
