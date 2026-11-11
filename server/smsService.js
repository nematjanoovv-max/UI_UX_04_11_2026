/**
 * Smart Delivery — Professional SMS & OTP Verification Service
 * Supports:
 * 1. Deterministic HMAC-SHA256 TOTP for 100% resilient cross-instance verification (Vercel serverless / multi-instance safe)
 * 2. Telegram Bot instant dispatch (<100ms) & deep-link auto-activation
 * 3. Eskiz.uz SMS Gateway with non-blocking timeout fallback
 */

const crypto = require('crypto');
const OTP_SECRET = process.env.OTP_SECRET || 'smart-delivery-totp-secret-2026-secure';

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

  // Get 9-digit suffix for DB queries and hash generation
  getPhoneSuffix(phone) {
    const clean = (phone || '').replace(/[^0-9]/g, '');
    return clean.slice(-9);
  }

  // Deterministic 6-digit TOTP code generation (5-minute window)
  generateDeterministicOtp(phone, stepOffset = 0) {
    const clean = this.getPhoneSuffix(phone);
    // 5-minute epoch window
    const window = Math.floor(Date.now() / (5 * 60 * 1000)) + stepOffset;
    const hmac = crypto.createHmac('sha256', OTP_SECRET);
    hmac.update(`${clean}:${window}`);
    const hash = hmac.digest('hex');
    const intVal = parseInt(hash.slice(0, 8), 16);
    return String(intVal % 1000000).padStart(6, '0');
  }

  // Verify deterministic 6-digit OTP across current, previous, and next windows
  verifyDeterministicOtp(phone, code) {
    if (!phone || !code) return false;
    const cleanCode = String(code).trim();
    if (!/^\d{6}$/.test(cleanCode)) return false;
    for (const offset of [0, -1, 1]) {
      if (this.generateDeterministicOtp(phone, offset) === cleanCode) {
        return true;
      }
    }
    return false;
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
          from: '4546',
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

    // 1. Instant Telegram Bot dispatch FIRST (zero delay)
    if (telegramId && botService) {
      try {
        await botService.sendOtpCode(telegramId, code, normPhone);
        sentVia.push('telegram');
      } catch (err) {
        console.warn('[Telegram OTP Error]:', err.message);
      }
    }

    // 2. Try Eskiz real SMS Gateway with strict non-blocking timeout
    if (this.eskizEmail && this.eskizPassword) {
      try {
        const eskizPromise = this.sendEskizSms(normPhone, code);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Eskiz timeout')), 3000));
        const eskizRes = await Promise.race([eskizPromise, timeoutPromise]);
        if (eskizRes && eskizRes.ok) {
          sentVia.push('sms');
        }
      } catch (err) {
        console.warn('[Eskiz Timeout / Error]:', err.message);
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
