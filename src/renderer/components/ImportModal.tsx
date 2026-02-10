/**
 * BellePoule Modern - Import Modal Component
 * Licensed under GPL-3.0
 */

import React, { useState } from 'react';
import { Fencer } from '../../shared/types';
import { parseFFEFile, parseXMLFile, parseSimpleTXTFile, ImportResult } from '../../shared/utils/fileParser';

interface ImportModalProps {
  format: string;
  filepath: string;
  content: string;
  onImport: (fencers: Partial<Fencer>[]) => void;
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  format,
  filepath,
  content,
  onImport,
  onClose,
}) => {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFencers, setSelectedFencers] = useState<Set<number>>(new Set());

  React.useEffect(() => {
    // Parser le fichier selon le format
    let parseResult: ImportResult;
    
    if (format === 'xml') {
      parseResult = parseXMLFile(content);
    } else if (format === 'txt') {
      parseResult = parseSimpleTXTFile(content);
    } else {
      parseResult = parseFFEFile(content);
    }
    
    setResult(parseResult);
    // Sélectionner tous les tireurs par défaut
    setSelectedFencers(new Set(parseResult.fencers.map((_, i) => i)));
  }, [format, content]);

  const toggleFencer = (index: number) => {
    const newSelected = new Set(selectedFencers);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFencers(newSelected);
  };

  const toggleAll = () => {
    if (result) {
      if (selectedFencers.size === result.fencers.length) {
        setSelectedFencers(new Set());
      } else {
        setSelectedFencers(new Set(result.fencers.map((_, i) => i)));
      }
    }
  };

  const handleImport = () => {
    if (result) {
      const fencersToImport = result.fencers.filter((_, i) => selectedFencers.has(i));
      onImport(fencersToImport);
      onClose();
    }
  };

  const filename = filepath.split(/[/\\]/).pop() || filepath;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header">
          <h2>Importer des tireurs</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: '6px' }}>
            <strong>Fichier:</strong> {filename}
            <br />
            <strong>Format:</strong> {format.toUpperCase()}
          </div>

          {result && result.errors && result.errors.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', color: '#dc2626' }}>
              <strong>Erreurs:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                {result.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {result && result.warnings && result.warnings.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '6px', color: '#d97706' }}>
              <strong>Avertissements:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, maxHeight: '100px', overflow: 'auto' }}>
                {result.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
              </ul>
            </div>
          )}

          {result && result.fencers.length > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span><strong>{result.fencers.length}</strong> tireurs trouvés</span>
                <button 
                  onClick={toggleAll}
                  style={{ 
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--color-text)',
                    background: 'var(--color-border)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {selectedFencers.size === result.fencers.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
              </div>

              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                maxHeight: '300px',
                overflow: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg)' }}>
                    <tr>
                      <th style={{ padding: '0.5rem', textAlign: 'center', width: '40px' }}>✓</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Nom</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Prénom</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Sexe</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Club</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Classement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.fencers.map((fencer, index) => (
                      <tr 
                        key={index}
                        onClick={() => toggleFencer(index)}
                        style={{ 
                          cursor: 'pointer',
                          background: selectedFencers.has(index) ? 'var(--color-primary)' : 'transparent',
                          color: selectedFencers.has(index) ? '#FFFFFF' : 'var(--color-text)',
                          borderBottom: '1px solid var(--color-border)'
                        }}
                      >
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedFencers.has(index)}
                            onChange={() => toggleFencer(index)}
                          />
                        </td>
                        <td style={{ padding: '0.5rem' }}>{fencer.lastName}</td>
                        <td style={{ padding: '0.5rem' }}>{fencer.firstName}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{fencer.gender}</td>
                        <td style={{ padding: '0.5rem' }}>{fencer.club || '-'}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{fencer.ranking || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : result ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
              Aucun tireur trouvé dans ce fichier
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Chargement...
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleImport}
            disabled={selectedFencers.size === 0}
          >
            Importer {selectedFencers.size} tireur{selectedFencers.size > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
