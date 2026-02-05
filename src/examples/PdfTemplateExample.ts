/**
 * BellePoule Modern - PDF Template Integration Example
 * Example d'intégration du système de templates PDF
 * Licensed under GPL-3.0
 */

import { Pool, MatchStatus } from '../shared/types';
import { exportPoolWithTemplate, getAvailableTemplates, SimplePdfTemplate } from '../shared/utils/pdfTemplates';

/**
 * Exemple d'utilisation du système de templates PDF
 */
export class PdfTemplateExample {
  
  /**
   * Démonstration de l'export avec différents templates
   */
  static async demonstrateTemplateExports(pool: Pool): Promise<void> {
    console.log('🎨 Démonstration des exports PDF avec templates...');
    
    // Obtenir la liste des templates disponibles
    const availableTemplates = getAvailableTemplates();
    console.log('Templates disponibles:', availableTemplates.map(t => t.name));
    
    // Exporter avec chaque template
    for (const template of availableTemplates) {
      try {
        console.log(`📄 Export avec template "${template.name}"...`);
        
        await exportPoolWithTemplate(pool, template.id, {
          title: `Poule ${pool.number} - Template ${template.name}`,
          filename: `demo-poule-${pool.number}-${template.id}.pdf`
        });
        
        console.log(`✅ Export "${template.name}" réussi`);
      } catch (error) {
        console.error(`❌ Erreur avec template "${template.name}":`, error);
      }
    }
  }

  /**
   * Création d'un template personnalisé (exemple)
   */
  static createCustomTemplate(): SimplePdfTemplate {
    return {
      id: 'custom-club',
      name: 'Mon Club d\'Escrime',
      description: 'Template personnalisé pour notre club',
      colors: {
        primary: '#1e40af',    // Bleu club
        secondary: '#3b82f6',  // Bleu clair
        accent: '#f59e0b',      // Orange
        text: '#1f2937',        // Gris foncé
        background: '#f9fafb',  // Gris très clair
        borders: '#d1d5db'      // Gris bordure
      },
      fonts: {
        title: { size: 24, family: 'helvetica' },
        header: { size: 16, family: 'helvetica' },
        body: { size: 12, family: 'helvetica' }
      },
      branding: {
        organizationName: 'Club d\'Escrime Modern',
        footerText: 'club-escrime.fr - Généré avec BellePoule Modern'
      }
    };
  }

  /**
   * Exemple de pool de démonstration
   */
  static createDemoPool(): Pool {
    // Mock pool pour démonstration
    const demoPool: Pool = {
      id: 'demo-pool-1',
      number: 1,
      phaseId: 'phase-demo',
      fencers: [
        {
          id: 'f1',
          ref: 1,
          lastName: 'Dupont',
          firstName: 'Jean',
          gender: 'MALE' as any,
          nationality: 'FRA',
          status: 'CHECKED_IN' as any,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'f2',
          ref: 2,
          lastName: 'Martin',
          firstName: 'Sophie',
          gender: 'FEMALE' as any,
          nationality: 'FRA',
          status: 'CHECKED_IN' as any,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      matches: [
        {
          id: 'm1',
          number: 1,
          fencerA: null,
          fencerB: null,
          scoreA: { value: 5, isVictory: true, isAbstention: false, isExclusion: false, isForfait: false },
          scoreB: { value: 3, isVictory: false, isAbstention: false, isExclusion: false, isForfait: false },
          maxScore: 5,
          status: MatchStatus.FINISHED,
          strip: 1,
          startTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      referees: [],
      strip: 1,
      startTime: new Date(),
      isComplete: false,
      hasError: false,
      ranking: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return demoPool;
  }
}

/**
 * Fonction de démonstration pour tester le système
 */
export async function runPdfTemplateDemo(): Promise<void> {
  console.log('🚀 Lancement de la démonstration PDF Templates...');
  
  try {
    // Créer une pool de démonstration
    const demoPool = PdfTemplateExample.createDemoPool();
    console.log('📊 Pool de démonstration créée:', demoPool.number);
    
    // Lancer la démonstration
    await PdfTemplateExample.demonstrateTemplateExports(demoPool);
    
    console.log('✅ Démonstration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la démonstration:', error);
  }
}

// Export pour utilisation dans l'application
export default PdfTemplateExample;