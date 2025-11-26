import { Injectable } from "@angular/core";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { environment } from "../../environments/environment";


@Injectable({
  providedIn: "root",
})
export class FmcService {
    private messaging: Messaging;

    constructor() {
        const app = initializeApp(environment.firebaseConfig);
        this.messaging = getMessaging(app);
    }

    async installFCMServiceWorker() {
        try {
            // Registrar o actualizar el Service Worker de Firebase Messaging
            const registration = await this.registerSw();
            
            if (registration) {
                // Esperar a que el Service Worker esté listo
                await navigator.serviceWorker.ready;
                // Pedir permiso para notificaciones
                await this.requestNotificationPermission(registration);
            }
        } catch (error) {
            console.error('Error installing FCM Service Worker:', error);
        }
    }

    async registerSw(): Promise<ServiceWorkerRegistration | null> {
        if ('serviceWorker' in navigator) {
            try {
                console.log('Registrando Service Worker: /firebase-messaging-sw.js');
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('Service Worker registrado exitosamente:', registration);
                return registration || null;
            } catch (error) {
                console.error('Error registrando Service Worker:', error);
                return null;
            }
        } else {
            console.warn('Service workers are not supported in this browser.');
            return null;
        }
    }

    async requestNotificationPermission(registration: ServiceWorkerRegistration) {
        if (Notification.permission === 'granted') {
            this.getFcmToken(registration);
        } else if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.getFcmToken(registration);
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        } else {
            console.warn('Notification permission denied by user.');
        }
    }

    async getFcmToken(registration: ServiceWorkerRegistration) {
        try {
            console.log('Obteniendo token FCM con registro:', registration.scope);
            const token = await getToken(this.messaging, {
                vapidKey: environment.vapidKey,
                serviceWorkerRegistration: registration,
            });
            if (token) {
                console.log('Token obtenido:', token);
                this.saveNotificationToken(token);
            } else {
                console.warn('No se obtuvo token FCM.');
            }
        } catch (error) {
            console.error('Error obteniendo token FCM:', error);
        }
    }

    saveNotificationToken(token: string) {
        localStorage.setItem('pushToken', token);
    }
}
