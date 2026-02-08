/**
 * BellePoule Modern - Update Notification Component
 * Affichage des notifications de mise à jour dans l'interface
 * Licensed under GPL-3.0
 */
import React from 'react';
interface UpdateNotificationProps {
    visible?: boolean;
}
declare const UpdateNotification: React.FC<UpdateNotificationProps>;
export default UpdateNotification;
export declare const updateNotificationStyles = "\n.update-notification {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  z-index: 1000;\n  max-width: 400px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  border-radius: 12px;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\n  animation: slideInRight 0.3s ease-out;\n}\n\n.update-notification-content {\n  display: flex;\n  align-items: center;\n  padding: 16px;\n  gap: 12px;\n  color: white;\n}\n\n.update-notification-icon {\n  font-size: 24px;\n  flex-shrink: 0;\n}\n\n.update-notification-text {\n  flex: 1;\n  min-width: 0;\n}\n\n.update-notification-text h4 {\n  margin: 0 0 4px 0;\n  font-size: 16px;\n  font-weight: 600;\n}\n\n.update-notification-text p {\n  margin: 0;\n  font-size: 14px;\n  opacity: 0.9;\n}\n\n.update-notification-multiple {\n  color: #ffd700 !important;\n  font-weight: 600;\n}\n\n.update-notification-actions {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  flex-shrink: 0;\n}\n\n@keyframes slideInRight {\n  from {\n    transform: translateX(100%);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n\n.btn-sm {\n  padding: 4px 8px;\n  font-size: 12px;\n}\n\n.btn-ghost {\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  color: white;\n}\n\n.btn-ghost:hover {\n  background: rgba(255, 255, 255, 0.1);\n  border-color: rgba(255, 255, 255, 0.5);\n}\n";
//# sourceMappingURL=UpdateNotification.d.ts.map