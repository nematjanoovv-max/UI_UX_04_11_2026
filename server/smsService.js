/**
 * Smart Delivery — Professional SMS & OTP Verification Service
 * Supports:
 * 1. Eskiz.uz SMS Gateway (Uzbekistan #1 cellular SMS provider)
 * 2. Telegram Bot fallback & direct dispatch
 * 3. Graceful demo/test mode with instant autofill
 */

class SmsService {
  constructor() {
    this.eskizEmail = (process.env.ESKIZ_EMAIL || '').trim();
    this.eskizPassword = (process.env.ESKIZ_PASSWORD || '').trim();
    this.eskizToken = null;
    this.tokenExpiresAt = 0;
  }

  // Normalize any phone number format into strict standard +998XXXXXXXXX
  normalizePhone(phone) {
    if (!phone) return '';
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('8') && digits.length === 10) {
      digits = '998' + digits.slice(1);
    }
    if (digits.length === 9) {
      digits = '998' + digits;
    }
    if (!digits.startsWith('998') && digits.length === 12) {
      // Keep as is
    }
    return '+' + digits;
  }

  // Get 9-digit suffix for DB queries
  getPhoneSuffix(phone) {
    const clean = (phone || '').replace(/[^0-9]/g, '');
    return clean.slice(-9);
  }

  // Authenticate with Eskiz.uz API if credentials are provided
  async getEskizToken() {
    if (!this.eskizEmail || !this.eskizPassword) return null;

    if (this.eskizToken && Date.now() < this.tokenExpiresAt) {
      return this.eskizToken;
    }

    try {
      const res = await fetch('https://notify.eskiz.uz/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.eskizEmail,
          password: this.eskizPassword
        })
      });

      const data = await res.json();
      if (data && data.data && data.data.token) {
        this.eskizToken = data.data.token;
        this.tokenExpiresAt = Date.now() + (25 * 24 * 60 * 60 * 1000); // 25 days
        console.log('[Eskiz] Token muvaffaqiyatli olindi.');
        return this.eskizToken;
      }
    } catch (err) {
      console.warn('[Eskiz Auth Error]:', err.message);
    }
    return null;
  }

  // Send real SMS via Eskiz.uz Gateway
  async sendEskizSms(phone, code) {
    const token = await this.getEskizToken();
    if (!token) return { ok: false, reason: 'no_eskiz_credentials' };

    const cleanPhone = this.normalizePhone(phone).replace('+', '');
    const message = `Smart Delivery: Sizning tasdiqlash kodingiz: ${code}. Uni hech kimga bermang!`;

    try {
      const res = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mobile_phone: cleanPhone,
          message: message,
          from: '4546', // Default Eskiz sender or customized originator
          callback_url: ''
        })
      });

      const data = await res.json();
      if (data && data.status === 'waiting') {
        console.log(`[Eskiz SMS] ${cleanPhone} raqamiga yuborildi. ID: ${data.id}`);
        return { ok: true, id: data.id };
      }
      return { ok: false, data };
    } catch (err) {
      console.warn('[Eskiz Send Error]:', err.message);
      return { ok: false, error: err.message };
    }
  }

  // Send OTP verification dispatching through all available channels
  async dispatchOtp({ phone, code, telegramId = null, botService = null }) {
    const normPhone = this.normalizePhone(phone);
    let sentVia = [];

    // 1. Try Eskiz real SMS Gateway first
    const eskizRes = await this.sendEskizSms(normPhone, code);
    if (eskizRes.ok) {
      sentVia.push('sms');
    }

    // 2. Try Telegram Bot message if telegramId is known or user started bot
    if (telegramId && botService) {
      try {
        await botService.sendOtpCode(telegramId, code, normPhone);
        sentVia.push('telegram');
      } catch (err) {
        console.warn('[Telegram OTP Error]:', err.message);
      }
    }

    const hasRealChannel = sentVia.length > 0;
    console.log(`[OTP Dispatch] Phone: ${normPhone} | Channels: ${sentVia.join(', ') || 'DEMO_FALLBACK'}`);

    return {
      ok: true,
      sentVia,
      isDemo: !hasRealChannel
    };
  }
}

const smsService = new SmsService();
module.exports = { smsService };
