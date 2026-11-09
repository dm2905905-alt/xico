// Reglas de seguridad de Firestore.
// - Cualquiera puede VER productos y creadores (es una tienda pública).
// - Solo la cuenta administradora puede crearlos o cambiarlos (por ahora; en la Fase 5
//   cada creador podrá editar sus propios productos).
// - Cada usuario solo puede leer y escribir su propio documento (carrito y favoritos).
// - Todo lo demás está cerrado.
export const reglasFirestore = (correoAdmin: string) => `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function esAdmin() {
      return request.auth != null
        && request.auth.token.email == "${correoAdmin}"
        && request.auth.token.email_verified == true;
    }

    match /productos/{producto} {
      allow read: if true;
      allow write: if esAdmin();
    }

    match /creadores/{creador} {
      allow read: if true;
      allow write: if esAdmin();
    }

    match /usuarios/{uid} {
      allow read, delete: if request.auth != null && request.auth.uid == uid;
      allow create, update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.keys().hasOnly(['carrito', 'favoritos', 'actualizado']);
    }
  }
}
`;
