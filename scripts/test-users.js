const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv(path.join(__dirname, '..', '.env.local'));
loadEnv(path.join(__dirname, '..', '.env'));

const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');

const tenantId = process.env.GRAPH_TENANT_ID || process.env.AZURE_AD_TENANT_ID;
const clientId = process.env.GRAPH_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID;
const clientSecret = process.env.GRAPH_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET;
const siteId = process.env.SHAREPOINT_SITE_ID;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const client = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const res = await credential.getToken('https://graph.microsoft.com/.default');
      return res.token;
    }
  }
});

async function main() {
  try {
    const listRes = await client.api(`/sites/${siteId}/lists/PrimeCargo_Usuarios?expand=columns`).get();
    console.log('List ID:', listRes.id);
    console.log('Columns:', listRes.columns.map(c => c.name));

    const itemsRes = await client.api(`/sites/${siteId}/lists/PrimeCargo_Usuarios/items?expand=fields`).get();
    console.log('Total de usuários:', itemsRes.value.length);
    itemsRes.value.forEach(item => {
      console.log('User:', item.id, item.fields.Title, item.fields.EmailUsuario, item.fields.Perfil, 'SenhaHash:', item.fields.SenhaHash || 'NÃO DEFINIDA');
    });
  } catch (err) {
    console.error('Erro:', err.message);
  }
}

main();
