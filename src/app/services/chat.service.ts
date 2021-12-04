import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { query, orderBy, limit } from 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Mensaje } from '../interface/mensaje.interface';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  chats: any[] = [];
  public usuario: any = {};

  constructor(
    private firestore: Firestore,
    private afs: AngularFirestore,
    public auth: AngularFireAuth
  ) {
    this.auth.authState.subscribe((user) => {
      console.log('Estado del usuario: ', user);

      if (!user) {
        return;
      }
      this.usuario.nombre = user.displayName;
      this.usuario.uid = user.uid;
    });
  }

  login(proveedor: string) {
    if (proveedor === 'google') {
      this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } else {
      this.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    }
  }

  logout() {
    this.usuario = {};
    this.auth.signOut();
  }

  cargarMensaje() {
    const coleccion = collection(this.firestore, 'chats');
    const ordenado = query(coleccion, orderBy('fecha', 'desc'), limit(5));
    return collectionData(ordenado).pipe(
      map((mensajes) => {
        console.log(mensajes);
        this.chats = [];

        for (let mensaje of mensajes) {
          this.chats.unshift(mensaje);
        }
        //this.chats = mensajes;
      })
    );
  }

  agregarMensaje(texto: string) {
    let mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid,
    };

    return this.afs.firestore.collection('chats').add(mensaje);
  }
}
