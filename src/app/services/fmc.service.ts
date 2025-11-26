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

        const registrations: ReadonlyArray<ServiceWorkerRegistration> =
        await navigator.serviceWorker.getRegistrations();

        if (registrations.length === 0) {
            let swRegistered = await this.registerSw();
            if (swRegistered !== null) {
                await navigator.serviceWorker.ready;
                this.requestNotificationPermission(swRegistered);
            }
        } else {
            let registration = registrations.find(
                (reg) => reg.active && reg.active.scriptURL.includes('firebase-messaging')
            );
            if (!!registration) {
                await navigator.serviceWorker.ready;
                this.requestNotificationPermission(registration);
            } else {
                let swRegistered = await this.registerSw();
                if (swRegistered !== null) {
                    await navigator.serviceWorker.ready;
                    this.requestNotificationPermission(swRegistered);
            }
        }
    }
    }

    async registerSw(): Promise<ServiceWorkerRegistration | null> {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', );
                if (!!registration) {
                    return registration;
                } else {
                    return null;
                }
            } catch (error) {
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
            const token = await getToken(this.messaging, {
                vapidKey: environment.vapidKey,
                serviceWorkerRegistration: registration,
            });
            if (token) {
                this.saveNotificationToken(token);
            } else {
                console.warn('No registration token available. Request permission to generate one.');
            }
        } catch (error) {}
    }

    saveNotificationToken(token: string) {
        localStorage.setItem('pushToken', token);
    }
}
