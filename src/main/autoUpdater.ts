/**
 * BellePoule Modern - Auto Updater
 * Système de mise à jour automatique simplifié
 * Licensed under GPL-3.0
 */

import { app, dialog, shell, BrowserWindow } from 'electron';
import https from 'https';
import fs from 'fs';
import path from 'path';

interface UpdateInfo {
  hasUpdate: boolean;
  currentBuild: number;
  latestBuild: number;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
  assets: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

interface AutoUpdaterConfig {
  autoDownload: boolean;
  autoInstall: boolean;
  checkInterval: number; // en heures
  betaChannel: boolean;
}

export class AutoUpdater {
  private mainWindow: BrowserWindow;
  private config: AutoUpdaterConfig;
  private lastCheck: Date | null = null;
  private updateInfo: UpdateInfo | null = null;

  constructor(mainWindow: BrowserWindow, config: Partial<AutoUpdaterConfig> = {}) {
    this.mainWindow = mainWindow;
    this.config = {
      autoDownload: true,
      autoInstall: false, // Sécurité : ne pas installer automatiquement
      checkInterval: 24, // Vérifier chaque jour
      betaChannel: false,
      ...config
    };

    this.setupAutoCheck();
  }

  private setupAutoCheck(): void {
    // Vérifier les mises à jour au démarrage
    setTimeout(() => {
      this.checkAndNotify();
    }, 5000); // 5 secondes après démarrage

    // Vérifier périodiquement
    setInterval(() => {
      this.checkAndNotify();
    }, this.config.checkInterval * 60 * 60 * 1000);
  }

  private async checkAndNotify(): Promise<void> {
    try {
      const updateInfo = await this.checkForUpdates();
      if (updateInfo?.hasUpdate) {
        this.showUpdateNotification(updateInfo);
      }
    } catch (error) {
      console.error('Auto-update check failed:', error);
    }
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const currentInfo = this.getCurrentVersion();
      const release = await this.fetchLatestRelease();
      
      if (!release) return null;

      // Extraire le numéro de build depuis le nom de la release
      const buildMatch = release.name?.match(/Build #(\d+)/);
      const latestBuild = buildMatch ? parseInt(buildMatch[1]) : 0;
      
      const versionMatch = release.name?.match(/v(\d+\.\d+\.\d+)/);
      const latestVersion = versionMatch ? versionMatch[1] : currentInfo.version;
      
      const hasUpdate = latestBuild > currentInfo.build;

      this.updateInfo = {
        hasUpdate,
        currentBuild: currentInfo.build,
        latestBuild,
        latestVersion,
        downloadUrl: release.html_url || 'https://github.com/klinnex/bellepoule-modern/releases/latest',
        releaseNotes: release.body || '',
        assets: release.assets || []
      };

      this.lastCheck = new Date();
      return this.updateInfo;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }

  private async fetchLatestRelease(): Promise<any> {
    const channel = this.config.betaChannel ? 'beta' : 'latest';
    const apiUrl = this.config.betaChannel 
      ? 'https://api.github.com/repos/klinnex/bellepoule-modern/releases'
      : 'https://api.github.com/repos/klinnex/bellepoule-modern/releases/tags/latest';

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: this.config.betaChannel ? '/repos/klinnex/bellepoule-modern/releases' : '/repos/klinnex/bellepoule-modern/releases/tags/latest',
        method: 'GET',
        headers: {
          'User-Agent': 'BellePoule-Modern',
          'Accept': 'application/vnd.github.v3+json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const releases = this.config.betaChannel ? JSON.parse(data) : [JSON.parse(data)];
              resolve(releases[0]); // Prendre la première release
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });
  }

  private getCurrentVersion(): { version: string; build: number } {
    try {
      const versionPaths = [
        path.join(app.getAppPath(), 'version.json'),
        path.join(process.cwd(), 'version.json'),
      ];
      
      for (const versionPath of versionPaths) {
        if (fs.existsSync(versionPath)) {
          const content = fs.readFileSync(versionPath, 'utf-8');
          return JSON.parse(content);
        }
      }
    } catch (e) {
      console.error('Failed to read version:', e);
    }
    
    // Fallback depuis package.json
    try {
      const pkgPath = path.join(app.getAppPath(), 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const match = pkg.version.match(/(\d+\.\d+\.\d+)(?:-build\.(\d+))?/);
        if (match) {
          return {
            version: match[1],
            build: parseInt(match[2]) || 0
          };
        }
      }
    } catch (e) {
      console.error('Failed to read package.json:', e);
    }
    
    return { version: '1.0.0', build: 0 };
  }

  private showUpdateNotification(updateInfo: UpdateInfo): void {
    // Notification discrète dans la console
    console.log(`🚀 Mise à jour disponible: v${updateInfo.latestVersion} (Build #${updateInfo.latestBuild})`);
    
    // Notification système si disponible
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update:available', updateInfo);
    }

    // Si autoDownload est activé, télécharger automatiquement
    if (this.config.autoDownload) {
      this.autoDownloadUpdate(updateInfo);
    }
  }

  private async autoDownloadUpdate(updateInfo: UpdateInfo): Promise<void> {
    try {
      const platform = this.getPlatform();
      const asset = this.findAssetForPlatform(updateInfo.assets, platform);
      
      if (asset) {
        console.log(`📥 Téléchargement automatique de ${asset.name}...`);
        // TODO: Implémenter le téléchargement automatique
        // Pour l'instant, on notifie juste l'utilisateur
      }
    } catch (error) {
      console.error('Auto download failed:', error);
    }
  }

  private getPlatform(): string {
    const platform = process.platform;
    const arch = process.arch;
    
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'macos';
    if (platform === 'linux') return 'linux';
    
    return 'unknown';
  }

  private findAssetForPlatform(assets: any[], platform: string): any {
    const patterns = {
      windows: ['.exe'],
      macos: ['.dmg'],
      linux: ['.AppImage', '.deb', '.rpm']
    };

    const extensions = patterns[platform as keyof typeof patterns] || [];
    return assets.find(asset => 
      extensions.some(ext => asset.name.endsWith(ext))
    );
  }

  async showUpdateDialog(): Promise<void> {
    if (!this.updateInfo) {
      const updateInfo = await this.checkForUpdates();
      if (!updateInfo) {
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: 'Mises à jour',
          message: 'Impossible de vérifier les mises à jour',
          detail: 'Vérifiez votre connexion internet.',
          buttons: ['OK'],
        });
        return;
      }
    }

    if (this.updateInfo && this.updateInfo.hasUpdate) {
      this.showUpdateOptionsDialog();
    } else {
      dialog.showMessageBox(this.mainWindow!, {
        type: 'info',
        title: 'Mises à jour',
        message: '🎉 Vous utilisez la dernière version !',
        detail: `Version actuelle : v${this.getCurrentVersion().version} (Build #${this.getCurrentVersion().build})`,
        buttons: ['OK'],
      });
    }
  }

  private showUpdateOptionsDialog(): void {
    if (!this.updateInfo || !this.mainWindow) return;

    const response = dialog.showMessageBoxSync(this.mainWindow!, {
      type: 'info',
      title: '🚀 Mise à jour disponible',
      message: `Une nouvelle version est disponible !`,
      detail: `Version actuelle : Build #${this.updateInfo.currentBuild}\nNouvelle version : Build #${this.updateInfo.latestBuild} (v${this.updateInfo.latestVersion})\n\n${this.updateInfo.releaseNotes ? '\nNotes de version:\n' + this.updateInfo.releaseNotes.substring(0, 200) + '...' : ''}`,
      buttons: [
        '📥 Télécharger maintenant',
        '🔗 Voir les releases',
        '✖️ Plus tard'
      ],
      defaultId: 0,
      cancelId: 2,
    });

    switch (response) {
      case 0: // Télécharger
        this.downloadAndInstall();
        break;
      case 1: // Voir les releases
        shell.openExternal('https://github.com/klinnex/bellepoule-modern/releases');
        break;
      case 2: // Plus tard
        // Rappeler plus tard
        break;
    }
  }

  private async downloadAndInstall(): Promise<void> {
    try {
      const platform = this.getPlatform();
      const asset = this.findAssetForPlatform(this.updateInfo!.assets, platform);
      
      if (asset) {
        // Ouvrir la page de téléchargement directement
        shell.openExternal(this.updateInfo!.downloadUrl);
        
        dialog.showMessageBox(this.mainWindow!, {
          type: 'info',
          title: '📥 Téléchargement',
          message: 'Redirection vers la page de téléchargement...',
          detail: 'Téléchargez la version correspondant à votre système et remplacez l\'application actuelle.',
          buttons: ['OK'],
        });
      } else {
        shell.openExternal(this.updateInfo!.downloadUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
      shell.openExternal(this.updateInfo!.downloadUrl);
    }
  }

  // API publique
  getUpdateInfo(): UpdateInfo | null {
    return this.updateInfo;
  }

  getLastCheck(): Date | null {
    return this.lastCheck;
  }

  isUpdateAvailable(): boolean {
    return this.updateInfo?.hasUpdate || false;
  }
}

export default AutoUpdater;