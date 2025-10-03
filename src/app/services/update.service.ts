import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  constructor(private swUpdate: SwUpdate) {}

  initializeUpdateService() {
    if (this.swUpdate.isEnabled) {
      // Verificar actualizaciones cada 30 minutos
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 30 * 60 * 1000);

      // Escuchar cuando hay una nueva versión disponible
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        )
        .subscribe(() => {
          this.showUpdateDialog();
        });

      // Verificar actualizaciones inmediatamente al iniciar
      this.swUpdate.checkForUpdate();
    }
  }

  private showUpdateDialog() {
    const userWantsUpdate = confirm(
      '¡Hay una nueva versión de la aplicación disponible!\n\n' +
      '¿Deseas actualizar ahora para obtener las últimas mejoras y funciones?\n\n' +
      'La aplicación se recargará automáticamente después de la actualización.'
    );
    
    if (userWantsUpdate) {
      this.activateUpdate();
    }
  }

  private activateUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        // Mostrar mensaje de confirmación antes de recargar
        alert('Actualización completada. La aplicación se recargará ahora.');
        window.location.reload();
      }).catch(err => {
        console.error('Error al activar la actualización:', err);
        alert('Hubo un error al aplicar la actualización. Por favor, recarga la página manualmente.');
      });
    }
  }

  // Método público para verificar actualizaciones manualmente
  checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then(updateFound => {
        if (!updateFound) {
          alert('Ya tienes la versión más reciente de la aplicación.');
        }
      }).catch(err => {
        console.error('Error al verificar actualizaciones:', err);
      });
    } else {
      alert('Las actualizaciones automáticas no están disponibles en este entorno.');
    }
  }
}