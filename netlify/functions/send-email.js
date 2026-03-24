const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { to, subject, text, attachments } = JSON.parse(event.body);

    const payload = {
      from: 'NHNN Stock Control <noreply@nhnnstock.co.uk>',
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
    };

    if (attachments && attachments.length) {
      payload.attachments = attachments;
    }

    const bodyStr = JSON.stringify(payload);

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer re_KGvUZPZ7_6bwv8iBceJYF82cLMNqnq1YS',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      req.on('error', reject);
      req.write(bodyStr);
      req.end();
    });

    return {
      statusCode: result.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: result.body,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
