import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private firebaseAdmin: any = null;

    constructor(private configService: ConfigService) {
        this.initFirebase();
    }

    private async initFirebase() {
        const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
        if (!serviceAccountJson) {
            this.logger.warn('[Notifications] FIREBASE_SERVICE_ACCOUNT_JSON not set — push notifications disabled');
            return;
        }
        try {
            const admin = await import('firebase-admin');
            if (!admin.default.apps.length) {
                const serviceAccount = JSON.parse(serviceAccountJson);
                admin.default.initializeApp({
                    credential: admin.default.credential.cert(serviceAccount),
                });
            }
            this.firebaseAdmin = admin.default;
            this.logger.log('[Notifications] Firebase Admin initialized');
        } catch (err) {
            this.logger.error('[Notifications] Failed to initialize Firebase Admin:', err.message);
        }
    }

    async sendToToken(
        token: string,
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<void> {
        if (!this.firebaseAdmin || !token) return;

        try {
            await this.firebaseAdmin.messaging().send({
                token,
                notification: { title, body },
                data: data || {},
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'default',
                    },
                },
            });
            this.logger.debug(`Push sent to token ${token.substring(0, 20)}...`);
        } catch (err) {
            this.logger.error(`Push failed for token ${token.substring(0, 20)}...: ${err.message}`);
            // Note: In production, catch 'registration-token-not-registered' and remove the token from DB
        }
    }

    async sendMatchFoundNotification(pushToken: string, partnerName: string): Promise<void> {
        await this.sendToToken(
            pushToken,
            '🎉 Eşleşme Bulundu!',
            `${partnerName} ile yolculuk paylaşabilirsiniz.`,
            { type: 'match_found' },
        );
    }

    async sendMessageNotification(pushToken: string, senderName: string, messageText: string, matchId: string): Promise<void> {
        await this.sendToToken(
            pushToken,
            `💬 ${senderName}`,
            messageText.length > 100 ? messageText.substring(0, 97) + '...' : messageText,
            { type: 'new_message', matchId },
        );
    }
}
